import { itemsPerWinnersPage } from '../../../../config';
import EventBus from '../../../../observers/eventBus';
import { Channel } from '../../../../observers/types';
import Store from '../../../../store/store';
import BaseComponent from '../../../baseComponent';
import { IWinnersPageData } from '../../types';
import Template from './index.html';

export default class Paginator extends BaseComponent {
  private prevButtonElement;

  private nextButtonElement;

  private store;

  private eventBus;

  constructor(parentNode: HTMLElement, eventBus: EventBus, store: Store) {
    super('div', ['paginator'], parentNode, Template, {});
    this.nextButtonElement = this.node.querySelector('#paginationNext') as HTMLButtonElement;
    this.prevButtonElement = this.node.querySelector('#paginationPrev') as HTMLButtonElement;
    this.eventBus = eventBus;
    this.store = store;
    this.addListeners();
    this.addEventListeners();
  }

  addListeners() {
    // this.eventBus.subscribe(Channel.winnersLoaded, this.onWinnersLoaded);
    this.eventBus.subscribe(Channel.winnersPageChanged, this.onPageUpdated);
  }

  addEventListeners() {
    this.nextButtonElement.addEventListener('click', () => {
      const nextPage = this.store.store.get('currentWinnersPage') + 1;
      this.eventBus.publish(Channel.winnersPageUpdated, nextPage);
    });
    this.prevButtonElement.addEventListener('click', () => {
      const prevPage = this.store.store.get('currentWinnersPage') - 1;
      this.eventBus.publish(Channel.winnersPageUpdated, prevPage);
    });
  }

  makeNextButtonDisabled() {
    this.nextButtonElement.disabled = true;
  }

  makeNextButtonEnabled() {
    this.nextButtonElement.removeAttribute('disabled');
  }

  makePrevButtonDisabled() {
    this.prevButtonElement.disabled = true;
  }

  makePrevButtonEnabled() {
    this.prevButtonElement.removeAttribute('disabled');
  }

  onPageUpdated = (data: unknown) => {
    if ((data as IWinnersPageData).pageNum === 1) {
      this.makePrevButtonDisabled();
    } else {
      this.makePrevButtonEnabled();
    }
    const totalPages = Math.ceil((data as IWinnersPageData).totalCount / itemsPerWinnersPage);
    if (totalPages > (data as IWinnersPageData).pageNum) {
      this.makeNextButtonEnabled();
    } else {
      this.makeNextButtonDisabled();
    }
  };

  onWinnersLoaded = (data: unknown) => {
    if ((data as IWinnersPageData).pageNum === 1) {
      this.makePrevButtonDisabled();
    }
    const totalPages = Math.ceil((data as IWinnersPageData).totalCount / itemsPerWinnersPage);
    if (totalPages > (data as IWinnersPageData).pageNum) {
      this.makeNextButtonEnabled();
    } else {
      this.makeNextButtonDisabled();
    }
  };
}
