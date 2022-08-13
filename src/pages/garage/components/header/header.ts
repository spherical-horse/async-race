import BaseComponent from '../../../baseComponent';
import Template from './index.html';

export default class Header extends BaseComponent {
  private pagesCountElement;

  private pagesNumberElement;

  constructor(parentNode: HTMLElement) {
    super('div', [], parentNode, Template, {});
    this.pagesCountElement = this.node.querySelector('#garageTotalCount') as HTMLSpanElement;
    this.pagesNumberElement = this.node.querySelector('#garagePageNumber') as HTMLSpanElement;
  }

  set pagesCount(value: number) {
    this.pagesCountElement.innerText = value.toString();
  }

  get pagesCount(): number {
    return Number(this.pagesCountElement.innerText);
  }

  set pagesNumber(value: number) {
    this.pagesNumberElement.innerText = value.toString();
  }

  get pagesNumber() {
    return Number(this.pagesNumberElement.innerText);
  }
}
