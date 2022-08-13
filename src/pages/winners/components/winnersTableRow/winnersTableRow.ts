import BaseComponent from '../../../baseComponent';
import Template from './index.html';

export default class WinnersTableRow extends BaseComponent {
  constructor(
    parentNode: HTMLElement,
    number: string,
    color: string,
    name: string,
    wins: string,
    bestTime: string,
  ) {
    super('tr', [], parentNode, Template, {
      number, color, name, wins, bestTime,
    });
  }
}
