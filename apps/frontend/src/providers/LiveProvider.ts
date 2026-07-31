/**
 * LiveProvider defines the abstraction for real-time bidirectional communication.
 * Implementations (e.g., PollingProvider, SSEProvider, WebSocketProvider) will 
 * satisfy this interface so the UI never depends on the actual transport layer.
 */
export interface LiveProvider {
  /**
   * Connect to the realtime service.
   */
  connect(): Promise<void>;

  /**
   * Disconnect gracefully from the realtime service.
   */
  disconnect(): void;

  /**
   * Subscribe to a specific topic or event.
   * @param topic - The channel to listen to (e.g., 'attendance_updates').
   * @param callback - The handler invoked when data arrives.
   * @returns An un-subscription function.
   */
  subscribe<T>(topic: string, callback: (data: T) => void): () => void;

  /**
   * Explicitly unsubscribe from a topic entirely.
   * @param topic - The channel to stop listening to.
   */
  unsubscribe(topic: string): void;
}
