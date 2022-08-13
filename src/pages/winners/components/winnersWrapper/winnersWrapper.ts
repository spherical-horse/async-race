import BaseComponent from '../../../baseComponent';

export default class WinnersWrapper extends BaseComponent {
  constructor(parentNode: HTMLElement) {
    super('div', ['winners'], parentNode, '', {});
  }
}
