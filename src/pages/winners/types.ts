export interface IRow {
  number: number,
  color: string,
  name: string,
  wins: number,
  bestTime: string
}

export interface IWinnersPageData {
  totalCount: number,
  pageNum: number,
  rows: IRow[],
}

export enum SortType {
  id = 'id',
  wins = 'wins',
  time = 'time',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface IRowResponse {
  wins: number,
  time: string,
  id: number,
}

export interface IGarageResponse {
  id: number,
  color: string,
  name: string,
}

export interface ICar {
  color: string,
  name: string,
}

export type CarObjectType = Record<number, ICar>;
