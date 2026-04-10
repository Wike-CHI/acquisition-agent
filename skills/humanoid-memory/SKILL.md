---
name: humanoid-memory
description: Brain-inspired memory for AI agents with V-score consolidation and Ebbinghaus forgetting
version: 1.0.0
user-invocable: true
metadata: {"openclaw":{"emoji":"🧠","requires":{"bins":["node"]},"os":["darwin","linux","win32"]}}
triggers:
  - humanoid memory
  - 记忆管理
---

# Humanoid Memory System

**Brain-inspired memory for AI agents with V-score consolidation and Ebbinghaus forgetting.**

## What is it?

Humanoid Memory is an OpenClaw skill that implements a cognitive memory system inspired by brain architecture:

- 🧠 **V-Score Consolidation** - Memory importance based on coherence, significance, noise, and resonance
- 🔄 **Tensor Fusion** - Similar memories automatically merge
- 💀 **Ebbinghaus Forgetting** - Exponential decay removes unused memories
- 🎯 **Semantic Search** - HNSW index for fast vector retrieval

## Key Features

### V-Score Formula
```
V = 1 / (1 + e^-(wc*C + ws*S + wm*M - wn*N))
```
Where:
- **C** = Coherence (fluency)
- **S** = Significance (importance)
- **N** = Noise (meaningless content)
- **M** = Memory Resonance (tensor similarity)

### Memory Lifecycle
1. **Perceive** → Store user/AI interaction
2. **Sleep** → Process queue:
   - Check tensor resonance (M > 8.5 = fuse, M > 9.5 = reinforce)
   - LLM evaluate C, S, N
   - Calculate V-score
   - Consolidate if V > 0.5
3. **Recall** → Retrieve weighted by similarity × V × decay
4. **GC** → Remove memories below death threshold

### Dual-Track Memory
- `user_text` → Semantic document (retrievable)
- `ai_text` → Metadata (context only)

## Installation

```bash
claw skill install humanoid-memory
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `HUMANOID_EMBEDDING` | `ollama` | Embedding provider (ollama/openai/mock) |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `nomic-embed-text` | Embedding model |
| `HUMANOID_LLM` | `ollama` | LLM for evaluation |
| `HUMANOID_V_THRESHOLD` | `0.5` | Memory consolidation threshold |
| `HUMANOID_FORGET_RATE` | `0.005` | Ebbinghaus decay rate |
| `HUMANOID_S_DESC` | - | Custom significance description |

## CLI Commands

```bash
# Search memories
claw memory humanoid search "my preferences"

# List memories
claw memory humanoid list --limit=10

# Show stats
claw memory humanoid stats

# Test system
claw memory humanoid test

# Wipe all memories
claw memory humanoid wipe
```

## Architecture

```
HumanoidMemory
├── config.js         # V-score weights, thresholds
├── physics.js       # Core math (V-score, Ebbinghaus)
├── embeddings.js     # Ollama/OpenAI/Mock providers
├── hnsw.js           # Vector index
├── storage.js        # Memory persistence
├── evaluator.js      # C/S/N LLM evaluation
├── engine.js         # Cognitive orchestration
└── hooks/
    ├── request-before.js   # Inject memories
    ├── request-after.js    # Store interactions
    └── session-end.js     # Cleanup
```

## Hooks

This skill registers OpenClaw hooks:

- `request-before` → Injects relevant memories into context
- `request-after` → Stores user/AI interaction as memory
- `session-end` → Logs memory stats

## Comparison to openclaw-memory

| Feature | humanoid | openclaw-memory |
|---------|----------|-----------------|
| V-score | ✅ | ❌ (simple importance) |
| Ebbinghaus | ✅ | ❌ (7-day TTL) |
| Tensor fusion | ✅ | ❌ |
| LLM evaluation | ✅ C/S/N | ❌ |
| HNSW index | ✅ | ❌ |
| Multi-agent | ✅ | ✅ |
| x402 payments | ❌ | ✅ |

## Requirements

- Node.js 18+
- OpenClaw v2026.1.30+
- Ollama (for local embeddings) or OpenAI API

## License

MIT
