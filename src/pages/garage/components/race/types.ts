enum EngineStatus {
  started = 'started',
  stopped = 'stopped',
}

export interface IWinResult {
  winnerId: number;
  time: number;
}

export default EngineStatus;
