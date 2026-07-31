package automation

import (
	"context"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"github.com/trisfproject/muskom/apps/api/platform/eventbus"
	"github.com/trisfproject/muskom/apps/api/platform/integration"
)

type Engine struct {
	db        *sqlx.DB
	bus       eventbus.EventDispatcher
	providers map[string]integration.Provider
	log       *zap.Logger
}

func NewEngine(db *sqlx.DB, bus eventbus.EventDispatcher, log *zap.Logger) *Engine {
	return &Engine{
		db:        db,
		bus:       bus,
		providers: make(map[string]integration.Provider),
		log:       log,
	}
}

func (e *Engine) RegisterProvider(p integration.Provider) {
	e.providers[p.ID()] = p
}

// Start binds the engine to the EventBus, effectively bridging Domains to External Systems
func (e *Engine) Start() {
	// Dynamically subscribe to all events that have active rules
	// For simplicity in this abstract, we subscribe a generic handler to ALL events, 
	// and internally filter rules. In production, we'd only subscribe to necessary channels.
	
	events := []eventbus.EventType{
		eventbus.EventParticipantApproved,
		eventbus.EventParticipantRejected,
		eventbus.EventCandidateVerified,
		eventbus.EventAttendanceCheckedIn,
		eventbus.EventAttendanceUndone,
		eventbus.EventVotingStarted,
		eventbus.EventVotingStopped,
		eventbus.EventVoteSubmitted,
		eventbus.EventNotificationQueued,
		eventbus.EventEventPublished,
		eventbus.EventEventCompleted,
	}

	for _, evt := range events {
		e.bus.Subscribe(evt, e.handleEvent)
	}
	
	e.log.Info("Automation Engine Started")
}

func (e *Engine) handleEvent(ctx context.Context, env *eventbus.EventEnvelope) error {
	rules, err := e.getRulesForEvent(ctx, env.EventID, env.Type)
	if err != nil || len(rules) == 0 {
		return nil
	}

	for _, rule := range rules {
		provider, exists := e.providers[rule.Provider]
		if !exists {
			e.log.Error("Provider not registered for automation rule", zap.String("provider", rule.Provider))
			continue
		}

		// Inject payload data into the config template (abstracted)
		executionConfig := rule.Config
		executionConfig["_payload"] = env.Payload

		start := time.Now()
		result := provider.Execute(ctx, executionConfig)
		
		// Map strict Observability metrics (Status, Duration, Retries, Error)
		status := "SUCCESS"
		errMsg := ""
		if !result.Success {
			status = "FAILED"
			errMsg = result.ErrorMessage
		}

		durationMs := int(time.Since(start).Milliseconds())

		e.recordIntegrationLog(ctx, env.EventID, rule.ID, rule.Provider, rule.Action, status, durationMs, result.Retries, errMsg)
	}

	return nil
}

func (e *Engine) getRulesForEvent(ctx context.Context, eventID string, eventType eventbus.EventType) ([]Rule, error) {
	query := `SELECT id, event_id, name, event_type, provider, action, is_active FROM automation_rules WHERE event_id = $1 AND event_type = $2 AND is_active = true`
	
	var rows []struct {
		ID        string `db:"id"`
		EventID   string `db:"event_id"`
		Name      string `db:"name"`
		EventType string `db:"event_type"`
		Provider  string `db:"provider"`
		Action    string `db:"action"`
		IsActive  bool   `db:"is_active"`
	}

	err := e.db.SelectContext(ctx, &rows, query, eventID, string(eventType))
	if err != nil {
		e.log.Error("Failed to fetch automation rules", zap.Error(err))
		return nil, err
	}

	var rules []Rule
	for _, r := range rows {
		rules = append(rules, Rule{
			ID:        r.ID,
			EventID:   r.EventID,
			Name:      r.Name,
			EventType: eventbus.EventType(r.EventType),
			Provider:  r.Provider,
			Action:    r.Action,
			Config:    make(map[string]interface{}), // Mocking config parsing for brevity
			IsActive:  r.IsActive,
		})
	}

	return rules, nil
}

func (e *Engine) recordIntegrationLog(ctx context.Context, eventID, ruleID, provider, action, status string, durationMs, retries int, errMsg string) {
	query := `
		INSERT INTO integration_logs (event_id, rule_id, provider, action, status, duration_ms, retries, error_message)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := e.db.ExecContext(ctx, query, eventID, ruleID, provider, action, status, durationMs, retries, errMsg)
	if err != nil {
		e.log.Error("Failed to record integration log", zap.Error(err))
	}
}
