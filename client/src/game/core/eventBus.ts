export type EventMap = Record<string, unknown>;

export type EventListener<T> = (payload: T) => void;

export class EventBus<TEvents extends EventMap> {
  private readonly listeners = new Map<keyof TEvents, Set<EventListener<TEvents[keyof TEvents]>>>();

  on<TKey extends keyof TEvents>(event: TKey, listener: EventListener<TEvents[TKey]>): () => void {
    const eventListeners = this.listeners.get(event) ?? new Set<EventListener<TEvents[keyof TEvents]>>();
    eventListeners.add(listener as EventListener<TEvents[keyof TEvents]>);
    this.listeners.set(event, eventListeners);

    return () => {
      const currentListeners = this.listeners.get(event);
      if (!currentListeners) {
        return;
      }

      currentListeners.delete(listener as EventListener<TEvents[keyof TEvents]>);
      if (currentListeners.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  emit<TKey extends keyof TEvents>(event: TKey, payload: TEvents[TKey]): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) {
      return;
    }

    Array.from(eventListeners).forEach((listener) => listener(payload));
  }

  clear(): void {
    this.listeners.clear();
  }
}
