export type ListenerType = (data: unknown) => void;

export enum Channel {
  hashChange = 'hash/change',
  carsLoaded = 'cars/load',
  garagePageChanged = 'garage/page/changed',
  carsDelete = 'cars/delete',
  winnersPageChanged = 'winners/page/changed',
  winnersPageUpdated = 'winners/page/updated',
  winnersSortUpdated = 'winners/sort/updated',
  winnersLoaded = 'winners/load',
}
