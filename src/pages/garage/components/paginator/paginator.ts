import { itemsPerPage } from '../../../../config';
import EventBus from '../../../../observers/eventBus';
import { Channel } from '../../../../observers/types';
import Store from '../../../../store/store';
import BaseComponent from '../../../baseComponent';
import { IGaragePageData } from '../../types';
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
    this.eventBus.subscribe(Channel.carsLoaded, this.onCarsLoaded);
  }

  addEventListeners() {
    this.nextButtonElement.addEventListener('click', () => {
      const nextPage = this.store.store.get('currentGaragePage') + 1;
      this.eventBus.publish(Channel.garagePageChanged, nextPage);
    });
    this.prevButtonElement.addEventListener('click', () => {
      const prevPage = this.store.store.get('currentGaragePage') - 1;
      this.eventBus.publish(Channel.garagePageChanged, prevPage);
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

  onCarsLoaded = (data: unknown) => {
    if ((data as IGaragePageData).pageNum === 1) {
      this.makePrevButtonDisabled();
    }
    const totalPages = Math.ceil((data as IGaragePageData).totalCount / itemsPerPage);
    if (totalPages > (data as IGaragePageData).pageNum) {
      this.makeNextButtonEnabled();
    } else {
      this.makeNextButtonDisabled();
    }
  };
}
