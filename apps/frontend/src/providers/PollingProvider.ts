import { LiveProvider } from './LiveProvider';

/**
 * PollingProvider implements the LiveProvider interface using HTTP short-polling.
 * This is the fallback/default provider for RC2 until SSE or WebSockets are ready.
 */
export class PollingProvider implements LiveProvider {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isConnected: boolean = false;
  private readonly defaultIntervalMs: number;

  constructor(defaultIntervalMs: number = 5000) {
    this.defaultIntervalMs = defaultIntervalMs;
  }

  async connect(): Promise<void> {
    this.isConnected = true;
    return Promise.resolve();
  }

  disconnect(): void {
    this.isConnected = false;
    this.intervals.forEach((timer) => clearInterval(timer));
    this.intervals.clear();
  }

  /**
   * Subscribe to a topic by providing an HTTP fetch function that returns data.
   * Note: In a real pub-sub model (like WS), 'topic' is just a string channel. 
   * Since this is polling, the 'topic' must be the URL to fetch, or the callback 
   * should internally know how to fetch and just be executed periodically.
   * We adjust the callback to be the actual fetch executor that updates local state.
   */
  subscribe<T>(topic: string, callback: (data: T) => void | Promise<void>): () => void {
    if (!this.isConnected) {
      console.warn("PollingProvider is not connected.");
      return () => {};
    }

    // Immediately execute once
    callback({} as T); // Normally we'd fetch here, but we assume callback handles the fetch

    const timer = setInterval(() => {
      callback({} as T);
    }, this.defaultIntervalMs);

    this.intervals.set(topic, timer);

    return () => this.unsubscribe(topic);
  }

  unsubscribe(topic: string): void {
    const timer = this.intervals.get(topic);
    if (timer) {
      clearInterval(timer);
      this.intervals.delete(topic);
    }
  }
}

// Singleton instance for global app usage
export const defaultPollingProvider = new PollingProvider();
