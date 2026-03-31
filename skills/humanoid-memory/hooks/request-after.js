/**
 * OpenClaw Hook: request-after
 *
 * Stores interaction as memory after request completes
 */

import { getHumanoidMemory } from '../src/index.js';

export default async function requestAfter(context) {
  try {
    const { agentWallet, request, response } = context;

    if (!agentWallet || !request) {
      return;
    }

    const memory = getHumanoidMemory();
    await memory.afterRequest(agentWallet, request, response);

  } catch (error) {
    console.error('[HumanoidMemory] request-after hook error:', error.message);
    // Don't block
  }
}
