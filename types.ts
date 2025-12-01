export interface RotationStep {
  original: string;
  direction: 'L' | 'R';
  distance: number;
  result: number;
  isMatch: boolean; // True if resulted in 0
}

export interface SolveResult {
  password: number;
  history: RotationStep[];
}

export enum SimulationState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}
