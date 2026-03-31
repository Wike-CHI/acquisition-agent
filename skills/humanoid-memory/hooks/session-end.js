/**
 * OpenClaw Hook: session-end
 *
 * Cleanup and stats at session end
 */

import { getHumanoidMemory } from '../src/index.js';

export default async function sessionEnd(context) {
  try {
    const { agentWallet, sessionId } = context;

    if (!agentWallet) {
      return;
    }

    const memory = getHumanoidMemory();
    await memory.sessionEnd(agentWallet);

  } catch (error) {
    console.error('[HumanoidMemory] session-end hook error:', error.message);
  }
}
