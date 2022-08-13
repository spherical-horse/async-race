import { Channel, ListenerType } from './types';

export default class EventBus {
  private channels: Record<string, ListenerType[]>;

  constructor() {
    this.channels = {};
  }

  subscribe(channel: Channel, listener: ListenerType) {
    if (!this.channels[channel]) {
      this.channels[channel] = [];
    }
    this.channels[channel].push(listener);
  }

  publish(channel: string, data?: unknown) {
    if (!this.channels[channel] || this.channels[channel].length === 0) return;
    this.channels[channel].forEach((listener) => {
      listener(data);
    });
  }
}
