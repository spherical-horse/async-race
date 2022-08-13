import EventBus from '../../../../observers/eventBus';
import { Channel } from '../../../../observers/types';
import Store from '../../../../store/store';
import BaseComponent from '../../../baseComponent';
import { SortOrder, SortType } from '../../types';
import Template from './index.html';
import './index.scss';

export default class WinnersTableHeader extends BaseComponent {
  private store;

  private eventBus;

  private wins;

  private bestTime;

  constructor(parentNode: HTMLElement, eventBus: EventBus, store: Store) {
    super('thead', ['winners-table__header'], parentNode, Template, {});
    this.store = store;
    this.eventBus = eventBus;
    this.wins = this.node.querySelector('#winnersTableWinsSort');
    this.bestTime = this.node.querySelector('#winnersTableTimeSort');
    this.addEventListeners();
  }

  addEventListeners() {
    this.wins?.addEventListener('click', () => {
      const currentSort = this.store.store.get('currentWinnersSort');
      if (currentSort !== SortType.wins) {
        this.store.store.set('currentWinnersSort', SortType.wins);
      } else {
        const currentSortOrder = this.store.store.get('currentWinnersOrder');
        if (currentSortOrder === SortOrder.ASC) {
          this.store.store.set('currentWinnersOrder', SortOrder.DESC);
        } else {
          this.store.store.set('currentWinnersOrder', SortOrder.ASC);
        }
      }
      this.eventBus.publish(Channel.winnersSortUpdated);
    });
    this.bestTime?.addEventListener('click', () => {
      const currentSort = this.store.store.get('currentWinnersSort');
      if (currentSort !== SortType.time) {
        this.store.store.set('currentWinnersSort', SortType.time);
      } else {
        const currentSortOrder = this.store.store.get('currentWinnersOrder');
        if (currentSortOrder === SortOrder.ASC) {
          this.store.store.set('currentWinnersOrder', SortOrder.DESC);
        } else {
          this.store.store.set('currentWinnersOrder', SortOrder.ASC);
        }
      }
      this.eventBus.publish(Channel.winnersSortUpdated);
    });
  }
}
