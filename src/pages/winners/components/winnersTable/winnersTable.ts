import BaseComponent from '../../../baseComponent';

export default class WinnersTable extends BaseComponent {
  constructor(parentNode: HTMLElement) {
    super('table', ['winners-table'], parentNode, '', {});
  }
}
