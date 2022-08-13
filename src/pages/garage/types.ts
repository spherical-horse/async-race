export interface ICar {
  id: number,
  name: string,
  color: string,
}

export interface IGaragePageData {
  totalCount: number,
  pageNum: number,
  cars: ICar[],
}
