import {
  serverAddress,
  serverPort,
  serverSchema,
} from '../../../../config';
import EventBus from '../../../../observers/eventBus';
import { Channel } from '../../../../observers/types';
import BaseComponent from '../../../baseComponent';
import Template from './index.html';
import './index.scss';
import EngineStatus, { IWinResult } from './types';

export default class Race extends BaseComponent {
  private removeButton: HTMLButtonElement | null;

  private eventBus;

  private id;

  private selectButton: HTMLButtonElement | null;

  private startButton: HTMLButtonElement | null;

  private stopButton: HTMLButtonElement | null;

  private carContainer: HTMLElement | null;

  private updateCarInput: HTMLInputElement | null;

  private colorInput: HTMLInputElement | null;

  private nameInput: HTMLInputElement | null;

  public name;

  private color;

  private leftPosition;

  private isEngineBroken;

  private isRaceStopped;

  private isEngineStarted;

  constructor(
    parentNode: HTMLElement,
    eventBus: EventBus,
    name: string,
    color: string,
    id: number,
    idInput: HTMLInputElement | null,
    nameInput: HTMLInputElement | null,
    colorInput: HTMLInputElement | null,
  ) {
    super('div', ['race'], parentNode, Template, { name, color });
    this.eventBus = eventBus;
    this.name = name;
    this.color = color;
    this.removeButton = this.node.querySelector('.remove');
    this.id = id;
    this.updateCarInput = idInput;
    this.colorInput = colorInput;
    this.nameInput = nameInput;
    this.selectButton = this.node.querySelector('.select');
    this.startButton = this.node.querySelector('.start-button');
    this.stopButton = this.node.querySelector('.stop-button');
    this.carContainer = this.node.querySelector('.race__car-container');
    this.leftPosition = 0;
    this.isEngineBroken = false;
    this.isRaceStopped = false;
    this.isEngineStarted = false;
    this.addEventListeners();
  }

  addEventListeners() {
    this.removeButton?.addEventListener('click', () => {
      this.eventBus.publish(Channel.carsDelete, this.id);
    });
    this.selectButton?.addEventListener('click', () => {
      if (this.updateCarInput) {
        this.updateCarInput.value = this.id.toString();
      }
      if (this.nameInput) {
        this.nameInput.value = this.name;
      }
      if (this.colorInput) {
        // console.log(this.color);
        this.colorInput.value = this.color;
      }
    });
    this.startButton?.addEventListener('click', async () => {
      const animationDuration = await this.startEngine();
      this.switchEngineToDriveMode();
      this.race(animationDuration);
    });
    this.stopButton?.addEventListener('click', () => {
      this.resetRace();
    });
  }

  get raceWidth() {
    const abContainer = this.node.querySelector('.race__ab-container');
    const flag = this.node.querySelector('.race__track-right-container');
    const nodeWidth = Number(getComputedStyle(this.node).width.replace('px', ''));
    if (abContainer && flag) {
      const abWidth = Number(getComputedStyle(abContainer).width.replace('px', ''));
      const flagWidth = Number(getComputedStyle(flag).marginRight.replace('px', ''));
      return nodeWidth - abWidth - flagWidth;
    }
    return NaN;
  }

  resetRace() {
    this.isRaceStopped = true;
    if (this.carContainer) {
      this.carContainer.style.transform = 'translateX(0)';
    }
    if (this.startButton) {
      this.startButton.removeAttribute('disabled');
    }
    this.leftPosition = 0;
  }

  disableButtonsOnRaceStarted() {
    if (this.selectButton) {
      this.selectButton.disabled = true;
    }
    if (this.startButton) {
      this.startButton.disabled = true;
    }
    if (this.removeButton) {
      this.removeButton.disabled = true;
    }
  }

  enableButtonsOnRaceStopped() {
    if (this.selectButton) {
      this.selectButton.removeAttribute('disabled');
    }
    if (this.removeButton) {
      this.removeButton.removeAttribute('disabled');
    }
  }

  race(animationDuration: number): Promise<IWinResult> {
    return new Promise((resolve, reject) => {
      this.isEngineBroken = false;
      this.isRaceStopped = false;
      this.disableButtonsOnRaceStarted();
      const width = this.raceWidth;
      const speed = width / animationDuration;
      let startTime = Date.now();
      const endTime = startTime + animationDuration;
      const animate = () => {
        const time = Date.now();
        const timeDelta = time - startTime;
        const distanceTick = timeDelta * speed;
        startTime = time;
        this.move(distanceTick);
        if (time < endTime && !this.isEngineBroken && !this.isRaceStopped) {
          requestAnimationFrame(animate);
        } else {
          this.enableButtonsOnRaceStopped();
          this.isRaceStopped = true;
          if (this.isEngineBroken) {
            reject(new Error('Engine broken'));
          } else resolve({ winnerId: this.id, time: animationDuration / 1000 });
        }
      };
      animate();
    });
  }

  move(x: number) {
    const left = x + this.leftPosition;
    if (this.carContainer) {
      this.carContainer.style.transform = `translateX(${left}px)`;
    }
    this.leftPosition = left;
  }

  startEnginePromise() {
    const url = `${serverSchema}${serverAddress}:${serverPort}/engine/?id=${this.id}&status=${EngineStatus.started}`;
    const response = fetch(url, { method: 'PATCH' }).then((r) => r.json());
    this.isEngineStarted = true;
    return response;
  }

  switchEngineToDriveMode() {
    fetch(`${serverSchema}${serverAddress}:${serverPort}/engine?id=${this.id}&status=drive`, {
      method: 'PATCH',
    }).then((r) => r.json())
      .catch(() => {
        this.isEngineBroken = true;
      });
  }

  async startEngine() {
    const url = `${serverSchema}${serverAddress}:${serverPort}/engine/?id=${this.id}&status=${EngineStatus.started}`;
    const response = await fetch(url, { method: 'PATCH' });
    const { velocity, distance } = await response.json();
    const animationDuration = distance / velocity;
    return animationDuration;
  }
}
