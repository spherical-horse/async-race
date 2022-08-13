import EventBus from '../observers/eventBus';
import { Channel } from '../observers/types';
import Garage from '../pages/garage/garage';
import { SortOrder, SortType } from '../pages/winners/types';
import Winners from '../pages/winners/winners';
import Router from '../router/router';
import Store from '../store/store';
import { ViewType } from './types';

export default class App {
  private store: Store;

  private eventBus: EventBus;

  private router: Router;

  private view: ViewType;

  constructor(store: Store, eventBus: EventBus, router: Router) {
    this.store = store;
    this.eventBus = eventBus;
    this.router = router;
    this.view = null;
  }

  start() {
    this.router.registerEventBus(this.eventBus);
    this.eventBus.subscribe(Channel.hashChange, this.onHashChanged);
    window.location.hash = '#/garage';
    this.store.store.set('currentGaragePage', 1);
    this.store.store.set('currentWinnersPage', 1);
    this.store.store.set('currentWinnersSort', SortType.id);
    this.store.store.set('currentWinnersOrder', SortOrder.ASC);
    this.view = new Garage(document.body, this.eventBus, this.store);
  }

  onHashChanged = (data: unknown) => {
    if (data === 'garage') {
      document.body.innerHTML = '';
      this.view = new Garage(document.body, this.eventBus, this.store);
    }
    if (data === 'winners') {
      document.body.innerHTML = '';
      this.view = new Winners(document.body, this.eventBus, this.store);
    }
  };
}
