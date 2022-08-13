import {
  serverSchema, serverAddress, serverPort, itemsPerPage, generateCarsNumber,
} from '../../config';
import BaseComponent from '../baseComponent';
import Template from './index.html';
import './normalize.scss';
import './index.scss';
import Header from './components/header/header';
import RaceContainer from './components/raceContainer/raceContainer';
import Paginator from './components/paginator/paginator';
import Race from './components/race/race';
import { ICar, IGaragePageData } from './types';
import EventBus from '../../observers/eventBus';
import { Channel } from '../../observers/types';
import Store from '../../store/store';
import getRandomColor from './helpers/randomColor';
import getRandomCarName from './helpers/randomCar';
import { IWinResult } from './components/race/types';

export default class Garage extends BaseComponent {
  private main;

  private header;

  private raceContainer;

  private paginator;

  private races: Record<number, Race>;

  private eventBus;

  private store;

  private createCarForm: HTMLFormElement | null;

  private carNameField: HTMLInputElement | null;

  private carColorField: HTMLInputElement | null;

  private createCarFormButton: HTMLButtonElement | null;

  private updateCarForm: HTMLFormElement | null;

  private updateCarName: HTMLInputElement | null;

  private updateCarColor: HTMLInputElement | null;

  private updateCarId: HTMLInputElement | null;

  private generateCarsButton: HTMLButtonElement | null;

  private startRaceButton: HTMLButtonElement | null;

  private resetRaceButton: HTMLButtonElement | null;

  private winnerModal: HTMLElement | null;

  constructor(parentNode: HTMLElement, eventBus: EventBus, store: Store) {
    super('div', [], parentNode, Template, {});
    this.main = document.createElement('main');
    this.main.classList.add('main');
    this.node.append(this.main);
    this.header = new Header(this.main);
    this.raceContainer = new RaceContainer(this.main);
    this.eventBus = eventBus;
    this.store = store;
    this.races = {};
    this.addRaces();
    this.paginator = new Paginator(this.main, this.eventBus, store);
    this.addListeners();
    this.createCarForm = this.node.querySelector('.car-form[name="createCar"]');
    this.carNameField = null;
    this.carColorField = null;
    this.createCarFormButton = null;
    if (this.createCarForm) {
      this.carNameField = this.createCarForm?.querySelector('.car-form__input');
      this.carColorField = this.createCarForm.querySelector('.car-form__color');
      this.createCarFormButton = this.createCarForm?.querySelector('.car-form__button');
    }
    this.updateCarForm = this.node.querySelector('.car-form[name="updateCar"]');
    this.updateCarName = null;
    this.updateCarColor = null;
    this.updateCarId = null;
    if (this.updateCarForm) {
      this.updateCarName = this.updateCarForm?.querySelector('.car-form__input');
      this.updateCarColor = this.updateCarForm?.querySelector('.car-form__color');
      this.updateCarId = this.updateCarForm?.querySelector('#updateCarId');
    }
    this.generateCarsButton = this.node.querySelector('#generateCarsButton');
    this.startRaceButton = this.node.querySelector('#startRaceButton');
    this.resetRaceButton = this.node.querySelector('#resetRaceButton');
    this.winnerModal = this.node.querySelector('.winner');
    this.addEventListeners();
  }

  async addRaces() {
    const response = await this.getCars();
    const data = await response.json();
    // console.log(response.headers.get('X-Total-Count'));
    this.eventBus.publish(Channel.carsLoaded, { totalCount: response.headers.get('X-Total-Count'), pageNum: 1, cars: data });
  }

  getCars() {
    return fetch(`${serverSchema}${serverAddress}:${serverPort}/garage?_page=${this.store.store.get('currentGaragePage')}&_limit=${itemsPerPage}`);
  }

  clearRaces() {
    this.races = [];
    this.raceContainer.node.innerHTML = '';
  }

  addListeners() {
    this.eventBus.subscribe(Channel.carsLoaded, this.onCarsLoaded);
    this.eventBus.subscribe(Channel.garagePageChanged, this.onPageChanged);
    this.eventBus.subscribe(Channel.carsDelete, this.onCarDeleted);
  }

  onCarsLoaded = (data: unknown) => {
    this.clearRaces();
    (data as IGaragePageData).cars.forEach((car: ICar) => {
      this.races[car.id] = new Race(
        this.raceContainer.node,
        this.eventBus,
        car.name,
        car.color,
        car.id,
        this.updateCarId,
        this.updateCarName,
        this.updateCarColor,
      );
    });
    this.header.pagesCount = (data as IGaragePageData).totalCount;
    // const pagesCount = Math.ceil((data as IGaragePageData).totalCount / itemsPerPage);
    const currentPage = this.store.store.get('currentGaragePage');
    this.header.pagesNumber = currentPage;
    const isFirstPage = currentPage <= 1;
    if (isFirstPage) {
      this.paginator.makePrevButtonDisabled();
    } else {
      this.paginator.makePrevButtonEnabled();
    }
    const isLastPage = Math.ceil((data as IGaragePageData).totalCount
      / itemsPerPage) <= (data as number);
    if (isLastPage) {
      this.paginator.makeNextButtonDisabled();
    } else {
      this.paginator.makeNextButtonEnabled();
    }
  };

  onPageChanged = async (data: unknown) => {
    this.store.store.set('currentGaragePage', data);
    this.hideWinner();
    const response = await this.getCars();
    const d = await response.json();
    this.eventBus.publish(Channel.carsLoaded, { totalCount: response.headers.get('X-Total-Count'), pageNum: data, cars: d });
    const isFirstPage = (data as number) <= 1;
    if (isFirstPage) {
      this.paginator.makePrevButtonDisabled();
    } else {
      this.paginator.makePrevButtonEnabled();
    }
    const isLastPage = Math.ceil(Number(response.headers.get('X-Total-Count')) / itemsPerPage) <= (data as number);
    if (isLastPage) {
      this.paginator.makeNextButtonDisabled();
    } else {
      this.paginator.makeNextButtonEnabled();
    }
  };

  onCarDeleted = (data: unknown) => {
    Garage.deleteCar(data as number);
    Garage.deleteFromWinners(data as number);
    const currentPage = Object.keys(this.races).length === 1 && this.store.store.get('currentGaragePage') > 1
      ? this.store.store.get('currentGaragePage') - 1
      : this.store.store.get('currentGaragePage');
    if (Object.keys(this.races).length <= 1) {
      this.store.store.set('currentGaragePage', this.store.store.get('currentGaragePage') - 1);
    }
    this.eventBus.publish(Channel.garagePageChanged, currentPage);
  };

  static async deleteCar(id: number) {
    const url = `${serverSchema}${serverAddress}:${serverPort}/garage/${id}`;
    await fetch(url, {
      method: 'delete',
    });
  }

  static async deleteFromWinners(id: number) {
    const url = `${serverSchema}${serverAddress}:${serverPort}/winners/${id}`;
    await fetch(url, {
      method: 'DELETE',
    });
  }

  addEventListeners() {
    this.createCarForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createCar();
    });
    this.updateCarForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateCar();
    });
    this.generateCarsButton?.addEventListener('click', () => {
      this.generateCars();
    });
    this.startRaceButton?.addEventListener('click', () => {
      this.startRace();
    });
    this.resetRaceButton?.addEventListener('click', () => {
      this.resetRace();
    });
  }

  async startRace() {
    this.hideWinner();
    this.makeRaceButtonDisabled();
    this.makeResetButtonDisabled();
    this.makeGenerateCarsButtonDisabled();
    const races = Object.values(this.races);
    const promises = races.map((race) => race.startEnginePromise());
    const objs = await Promise.all(promises);
    const animationDurations = objs.map((obj) => obj.distance / obj.velocity);
    const promisesAnimate: Promise<IWinResult>[] = [];
    races.forEach((race, idx) => {
      race.switchEngineToDriveMode();
      promisesAnimate.push(race.race(animationDurations[idx]));
    });
    try {
      const { winnerId, time } = await Promise.any(promisesAnimate);
      const text = `The winner is ${this.races[winnerId].name} ${time.toFixed(2)} s`;
      this.showWinner(text);
      await Garage.onWinRace(winnerId, time);
    } catch {
      this.showWinner('No winner');
    }
    this.makeResetButtonEnabled();
    this.makeGenerateCarsButtonEnabled();
  }

  static async onWinRace(winnerId: number, time: number) {
    const winnersUrl = `${serverSchema}${serverAddress}:${serverPort}/winners/${winnerId}`;
    const response = await fetch(winnersUrl, { method: 'GET' });
    if (response.status === 404) {
      const url = `${serverSchema}${serverAddress}:${serverPort}/winners`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wins: 1, id: winnerId, time: time.toFixed(2) }),
      });
    } else {
      const data = await response.json();
      const wins = data.wins + 1;
      const t = Math.min(time, data.time);
      const updateUrl = `${serverSchema}${serverAddress}:${serverPort}/winners/${winnerId}`;
      await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wins, time: t.toFixed(2) }),
      });
    }
  }

  resetRace() {
    this.hideWinner();
    Object.values(this.races).forEach((race) => {
      race.resetRace();
    });
    this.makeRaceButtonEnabled();
  }

  makeRaceButtonDisabled() {
    if (this.startRaceButton) {
      this.startRaceButton.disabled = true;
    }
  }

  makeRaceButtonEnabled() {
    if (this.startRaceButton) {
      this.startRaceButton.removeAttribute('disabled');
    }
  }

  makeResetButtonDisabled() {
    if (this.resetRaceButton) {
      this.resetRaceButton.disabled = true;
    }
  }

  makeResetButtonEnabled() {
    if (this.resetRaceButton) {
      this.resetRaceButton.removeAttribute('disabled');
    }
  }

  makeGenerateCarsButtonDisabled() {
    if (this.generateCarsButton) {
      this.generateCarsButton.disabled = true;
    }
  }

  makeGenerateCarsButtonEnabled() {
    if (this.generateCarsButton) {
      this.generateCarsButton.removeAttribute('disabled');
    }
  }

  showWinner(text: string) {
    if (this.winnerModal) {
      this.winnerModal.innerText = text;
      this.winnerModal.style.display = 'block';
    }
  }

  hideWinner() {
    if (this.winnerModal) {
      this.winnerModal.style.display = 'none';
    }
  }

  async generateCars() {
    const promises = Array(generateCarsNumber).fill(null).map(() => (fetch(`${serverSchema}${serverAddress}:${serverPort}/garage`, {
      method: 'post',
      body: JSON.stringify({
        name: getRandomCarName(),
        color: getRandomColor(),
      }),
      headers: { 'Content-Type': 'application/json' },
    })));
    await Promise.all(promises);
    this.eventBus.publish(Channel.garagePageChanged, this.store.store.get('currentGaragePage'));
  }

  async createCar() {
    const data = {
      name: this.carNameField?.value,
      color: this.carColorField?.value,
    };
    const response = await fetch(`${serverSchema}${serverAddress}:${serverPort}/garage`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const carData = await response.json();
    if (Object.keys(this.races).length < itemsPerPage) {
      this.races[carData.id] = new Race(
        this.raceContainer.node,
        this.eventBus,
        carData.name,
        carData.color,
        carData.id,
        this.updateCarId,
        this.updateCarName,
        this.updateCarColor,
      );
    } else {
      this.paginator.makeNextButtonEnabled();
    }
    this.header.pagesCount += 1;
  }

  async updateCar() {
    const data = {
      name: this.updateCarName?.value,
      color: this.updateCarColor?.value,
    };
    await fetch(`${serverSchema}${serverAddress}:${serverPort}/garage/${this.updateCarId?.value}`, {
      body: JSON.stringify(data),
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const currentPage = this.store.store.get('currentGaragePage');
    // console.log(currentPage);
    this.eventBus.publish(Channel.garagePageChanged, currentPage);
  }
}
