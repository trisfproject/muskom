package realtime

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/fasthttp/websocket"
	"go.uber.org/zap"
)

type Client struct {
	ID     string
	UserID string // Empty if system-wide connection, but usually tied to a user
	Conn   *websocket.Conn
	Send   chan []byte
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	log        *zap.Logger
	mu         sync.RWMutex
}

var instance *Hub
var once sync.Once

func GetHub(log *zap.Logger) *Hub {
	once.Do(func() {
		instance = &Hub{
			broadcast:  make(chan []byte),
			register:   make(chan *Client),
			unregister: make(chan *Client),
			clients:    make(map[*Client]bool),
			log:        log,
		}
		go instance.Run()
	})
	return instance
}

func (h *Hub) Register() chan *Client {
	return h.register
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			h.log.Info("Client registered", zap.String("id", client.ID), zap.String("user_id", client.UserID))
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
				h.log.Info("Client unregistered", zap.String("id", client.ID), zap.String("user_id", client.UserID))
			}
			h.mu.Unlock()
		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) SendToUser(userID string, payload interface{}) {
	b, err := json.Marshal(payload)
	if err != nil {
		h.log.Error("Failed to marshal payload for user", zap.Error(err))
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client.UserID == userID || client.UserID == "" { // Broadcast to specific user or to superadmins (depends on logic)
			// Wait, let's just send to exact userID.
			// Actually, for some events (like Registration Submitted), we might want to send to all admins.
			// The caller should specify the user. If the caller wants to send to all admins, it should call SendToRole or iterate.
			// For now, if userID is provided, send to that user.
			if client.UserID == userID {
				select {
				case client.Send <- b:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (h *Hub) Broadcast(payload interface{}) {
	b, err := json.Marshal(payload)
	if err != nil {
		h.log.Error("Failed to marshal broadcast payload", zap.Error(err))
		return
	}
	h.broadcast <- b
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(54 * time.Second) // Ping ticker
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) ReadPump(hub *Hub) {
	defer func() {
		hub.unregister <- c
		c.Conn.Close()
	}()
	c.Conn.SetReadLimit(512)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error { c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second)); return nil })
	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				hub.log.Error("WebSocket unexpected close error", zap.Error(err))
			}
			break
		}
	}
}
