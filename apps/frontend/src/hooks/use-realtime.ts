import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type TransportMethod = 'polling' | 'sse' | 'websocket';

interface UseRealtimeSyncOptions<T> {
  topic: string;
  fetchData: () => Promise<T>;
  method?: TransportMethod;
  pollingInterval?: number;
  enabled?: boolean;
}

/**
 * useRealtimeSync
 * 
 * An architecture abstraction for handling real-time data across the application.
 * Currently uses TanStack Query short-polling.
 * In the future, this can gracefully upgrade to SSE or WebSockets without 
 * requiring UI components to change.
 */
export function useRealtimeSync<T>({
  topic,
  fetchData,
  method = 'polling',
  pollingInterval = 5000,
  enabled = true,
}: UseRealtimeSyncOptions<T>) {
  const queryClient = useQueryClient();

  // Query implementation acts as our baseline data store and polling fallback
  const query = useQuery({
    queryKey: [topic],
    queryFn: fetchData,
    refetchInterval: method === 'polling' ? pollingInterval : false,
    enabled,
  });

  // Future-proofing for SSE / WebSocket
  useEffect(() => {
    if (!enabled || method === 'polling') return;

    let cleanup: () => void = () => {};

    if (method === 'sse') {
      // Future implementation:
      // const eventSource = new EventSource(`/api/realtime/sse/${topic}`);
      // eventSource.onmessage = (event) => {
      //   const data = JSON.parse(event.data);
      //   queryClient.setQueryData([topic], data);
      // };
      // cleanup = () => eventSource.close();
    } else if (method === 'websocket') {
      // Future implementation:
      // const ws = new WebSocket(`wss://api.example.com/realtime/ws/${topic}`);
      // ws.onmessage = (event) => {
      //   const data = JSON.parse(event.data);
      //   queryClient.setQueryData([topic], data);
      // };
      // cleanup = () => ws.close();
    }

    return cleanup;
  }, [topic, method, enabled, queryClient]);

  return query;
}
