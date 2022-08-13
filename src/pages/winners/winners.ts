import {
  itemsPerWinnersPage,
  serverAddress,
  serverPort,
  serverSchema,
} from '../../config';
import EventBus from '../../observers/eventBus';
import { Channel } from '../../observers/types';
import Store from '../../store/store';
import BaseComponent from '../baseComponent';
import Header from './components/header/header';
import Paginator from './components/paginator/paginator';
import WinnersTable from './components/winnersTable/winnersTable';
import WinnersTableBody from './components/winnersTableBody/winnersTableBody';
import WinnersTableHeader from './components/winnersTableHead/winnersTableHead';
import WinnersTableRow from './components/winnersTableRow/winnersTableRow';
import WinnersWrapper from './components/winnersWrapper/winnersWrapper';
import Template from './index.html';
import {
  ICar,
  IGarageResponse,
  IRow,
  IRowResponse,
  IWinnersPageData,
} from './types';

export default class Winners extends BaseComponent {
  private eventBus;

  private store;

  private header;

  private winnersWrapper;

  private winnersTable;

  private winnersTableHead;

  private winnersTableBody;

  private winnersTableRows: WinnersTableRow[];

  private paginator;

  constructor(parentNode: HTMLElement, eventBus: EventBus, store: Store) {
    super('div', [], parentNode, Template, {});
    this.eventBus = eventBus;
    this.store = store;
    this.header = new Header(this.node);
    this.winnersWrapper = new WinnersWrapper(this.node);
    this.winnersTable = new WinnersTable(this.winnersWrapper.node);
    this.winnersTableHead = new WinnersTableHeader(this.winnersTable.node, eventBus, store);
    this.winnersTableBody = new WinnersTableBody(this.winnersTable.node);
    this.winnersTableRows = [];
    this.paginator = new Paginator(this.node, eventBus, store);
    this.addListeners();
    // this.updateTableRows();
    this.onPageLoad();
  }

  async onPageLoad() {
    const pageData = await this.getPageData();
    this.eventBus.publish(Channel.winnersPageChanged, pageData);
  }

  async updateTableRows() {
    const garageResponse = await Winners.getCars();
    const cars = await garageResponse.json() as IGarageResponse[];
    const carsObj = Winners.carsResponseToObject(cars);
    this.winnersTableRows = [];
    const response = await this.getRows();
    const rows = await response.json() as IRowResponse[];
    this.winnersTableBody.node.innerHTML = '';
    rows.forEach((row, idx) => {
      const number = (this.store.store.get('currentWinnersPage') - 1) * itemsPerWinnersPage + idx + 1;
      this.winnersTableRows.push(
        new WinnersTableRow(
          this.winnersTableBody.node,
          number.toString(),
          carsObj[row.id].color,
          carsObj[row.id].name,
          row.wins.toString(),
          row.time,
        ),
      );
    });
  }

  addListeners() {
    this.eventBus.subscribe(Channel.winnersPageChanged, this.onPageChanged);
    this.eventBus.subscribe(Channel.winnersPageUpdated, this.onPageUpdated);
    this.eventBus.subscribe(Channel.winnersSortUpdated, this.onWinnersSortUpdated);
  }

  onWinnersSortUpdated = async () => {
    const pageData = await this.getPageData();
    this.eventBus.publish(Channel.winnersPageChanged, pageData);
  };

  onPageUpdated = async (data: unknown) => {
    const pageData = await this.getPageData();
    this.store.store.set('currentWinnersPage', data);
    pageData.pageNum = data;
    this.eventBus.publish(Channel.winnersPageChanged, pageData);
  };

  onPageChanged = async (data: unknown) => {
    this.updateTableRows();
    this.header.currentPage = this.store.store.get('currentWinnersPage');
    this.header.pagesNumber = (data as IWinnersPageData).totalCount;
  };

  getRows() {
    const url = `${serverSchema}${serverAddress}:${serverPort}/winners?_page=${this.store.store.get('currentWinnersPage')}&_limit=${itemsPerWinnersPage}&_sort=${this.store.store.get('currentWinnersSort')}&_order=${this.store.store.get('currentWinnersOrder')}`;
    return fetch(url);
  }

  async getPageData() {
    const response = await this.getRows();
    const rows = await response.json() as IRow[];
    return {
      totalCount: Number(response.headers.get('X-Total-Count')),
      pageNum: this.store.store.get('currentWinnersPage'),
      rows,
    };
  }

  static getCars() {
    const url = `${serverSchema}${serverAddress}:${serverPort}/garage`;
    return fetch(url);
  }

  static carsResponseToObject(response: IGarageResponse[]) {
    const acc: Record<number, ICar> = {};
    response.forEach((car) => {
      acc[car.id] = { name: car.name, color: car.color };
    });
    return acc;
  }
}
