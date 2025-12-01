import { SolveResult, RotationStep } from '../types';

export const parseAndSolve = (input: string): SolveResult => {
  const lines = input.trim().split(/\n+/);
  let current = 50; // Dial starts at 50
  let passwordCount = 0;
  const history: RotationStep[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const directionChar = trimmed[0].toUpperCase();
    const distanceStr = trimmed.slice(1);
    const distance = parseInt(distanceStr, 10);

    if ((directionChar !== 'L' && directionChar !== 'R') || isNaN(distance)) {
      continue; // Skip invalid lines
    }

    const direction = directionChar as 'L' | 'R';

    // Logic:
    // 0-99 dial.
    // L = decrease (towards lower numbers). (Current - Dist)
    // R = increase (towards higher numbers). (Current + Dist)
    // Wrap around 0-99 using modulo.

    let nextVal = current;

    if (direction === 'L') {
      // JS modulo bug with negative numbers: (a % n + n) % n
      nextVal = ((current - distance) % 100 + 100) % 100;
    } else {
      nextVal = (current + distance) % 100;
    }

    const isMatch = nextVal === 0;
    if (isMatch) {
      passwordCount++;
    }

    history.push({
      original: trimmed,
      direction,
      distance,
      result: nextVal,
      isMatch,
    });

    current = nextVal;
  }

  return {
    password: passwordCount,
    history,
  };
};
