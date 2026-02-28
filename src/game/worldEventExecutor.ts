import type { PhysicsCommand } from '../world/types';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeWorldEvents(
  dispatch: (cmd: PhysicsCommand) => number | null,
  events: PhysicsCommand[],
  delayMs = 300,
): Promise<void> {
  for (const event of events) {
    dispatch(event);

    // Shake gets extra pause for the visual to settle
    if (event.type === 'shake') {
      await sleep(delayMs + 400);
    } else if (event.type === 'addBody') {
      // Rapid-fire for multiple bodies
      await sleep(delayMs * 0.5);
    } else {
      await sleep(delayMs);
    }
  }
}
