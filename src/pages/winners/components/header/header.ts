import BaseComponent from '../../../baseComponent';
import Template from './index.html';

export default class Header extends BaseComponent {
  private winnersCountElement;

  private winnersPageElement;

  constructor(parentNode: HTMLElement) {
    super('div', ['wihhers-header'], parentNode, Template, {});
    this.winnersCountElement = this.node.querySelector('#winnersCount') as HTMLSpanElement;
    this.winnersPageElement = this.node.querySelector('#winnersPageNum') as HTMLSpanElement;
  }

  set pagesNumber(val: number) {
    if (this.winnersCountElement) {
      this.winnersCountElement.innerText = val.toString();
    }
  }

  set currentPage(val: number) {
    if (this.winnersPageElement) {
      this.winnersPageElement.innerText = val.toString();
    }
  }
}
