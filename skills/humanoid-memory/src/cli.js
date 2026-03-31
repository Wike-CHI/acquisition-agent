/**
 * Humanoid Memory CLI
 *
 * Commands:
 * - search <query> - Search memories
 * - list [limit] - List recent memories
 * - stats - Show memory statistics
 * - wipe - Clear all memories
 */

import { getHumanoidMemory } from './index.js';

const args = process.argv.slice(2);
const command = args[0];

const memory = getHumanoidMemory();
const agentWallet = process.env.AGENT_WALLET || 'default';

async function main() {
  switch (command) {
    case 'search':
      const query = args.slice(1).join(' ') || 'hello';
      console.log(`\n🔍 Searching: "${query}"`);
      const results = await memory.recall(agentWallet, query, 5);
      if (results.length === 0) {
        console.log('  No memories found');
      } else {
        results.forEach((r, i) => {
          console.log(`\n  [${i + 1}] Weight: ${r.final_weight.toFixed(3)}`);
          console.log(`      User: ${r.text}`);
          console.log(`      AI:   ${r.ai_text}`);
        });
      }
      break;

    case 'list':
      const limit = parseInt(args[1]) || 10;
      console.log(`\n📋 Recent ${limit} memories:`);
      const all = memory.getStats(agentWallet);
      console.log(`  Total: ${all.count} memories`);
      console.log(`  Index: ${all.indexType}`);
      break;

    case 'stats':
      console.log(`\n📊 Memory Statistics:`);
      const stats = memory.getStats(agentWallet);
      console.log(`  Count: ${stats.count}`);
      console.log(`  Index: ${stats.indexType} (dim: ${stats.dimension})`);
      if (stats.indexStats) {
        console.log(`  Index nodes: ${stats.indexStats.nodeCount}`);
      }
      break;

    case 'wipe':
      console.log('\n💣 Wiping all memories...');
      memory.wipe(agentWallet);
      console.log('  Done');
      break;

    case 'test':
      // Run a test interaction
      console.log('\n🧪 Testing memory system...');

      memory.perceive(agentWallet, 'Hello, my name is Zhang San', 'Nice to meet you, Zhang San!');
      memory.perceive(agentWallet, 'I like playing basketball', 'Basketball is great exercise!');
      memory.perceive(agentWallet, 'What is my name?', 'Your name is Zhang San.');

      await memory.sleep(agentWallet);

      console.log('\n🔍 Retrieving "basketball"...');
      const bball = await memory.recall(agentWallet, 'basketball', 2);
      bball.forEach(r => {
        console.log(`  - ${r.text} (weight: ${r.final_weight.toFixed(3)})`);
      });

      console.log('\n🔍 Retrieving "name"...');
      const name = await memory.recall(agentWallet, 'name', 2);
      name.forEach(r => {
        console.log(`  - ${r.text} (weight: ${r.final_weight.toFixed(3)})`);
      });

      break;

    default:
      console.log(`
🤖 Humanoid Memory CLI

Usage: node cli.js <command>

Commands:
  search <query>    Search memories
  list [limit]     List memories
  stats            Show statistics
  wipe             Clear all memories
  test             Run test interaction
`);
  }
}

main().catch(console.error);
