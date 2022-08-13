// const HASH = '#/';

import EventBus from '../observers/eventBus';
import { Channel } from '../observers/types';

export default class Router {
  private eventBus: EventBus | null;

  constructor() {
    this.addListeners();
    this.eventBus = null;
  }

  addListeners() {
    window.addEventListener('hashchange', this.handleHashChange);
  }

  handleHashChange = () => {
    const query = window.location.hash.replace('#/', '');
    this.eventBus?.publish(Channel.hashChange, query);
  };

  registerEventBus(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
}
