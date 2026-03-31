/**
 * OpenClaw Hook: request-before
 *
 * Injects humanoid memories into request context
 */

import { getHumanoidMemory } from '../src/index.js';

export default async function requestBefore(context) {
  try {
    const { agentWallet, requestData } = context;

    if (!agentWallet || !requestData) {
      return;
    }

    const memory = getHumanoidMemory();
    await memory.beforeRequest(agentWallet, requestData);

  } catch (error) {
    console.error('[HumanoidMemory] request-before hook error:', error.message);
    // Don't block the request
  }
}
