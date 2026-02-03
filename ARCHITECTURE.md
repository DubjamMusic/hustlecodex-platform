# HustleCodeX Platform Architecture

## Overview

HustleCodeX is a modular, AI-orchestrated recovery platform built on a **stateless compute + stateful memory** architecture. The system treats decisions as first-class objects and uses multiple AI agents to provide diverse perspectives on user choices.

## System Components

### 1. Stateless Compute (Vercel)
- **Next.js Pages Router**: Server-side rendering and API routes
- **Edge Functions**: Low-latency middleware for feature flags and routing
- **Serverless Functions**: API routes for decision processing, agent orchestration
- **Zero persistent state**: All state is externalized to IONOS DB

### 2. Stateful Memory (IONOS DB/Storage)
- **PostgreSQL Database**: Managed via Prisma ORM
  - User sessions and profiles
  - Decision history with full context
  - Memory fragments with relevance scoring
  - Agent responses and disagreements
  - Telemetry events for analytics
- **Object Storage**: (Future) Media artifacts, user-generated content
- **Persistence Layer**: All state survives compute restarts

### 3. AI Agents (Modular Services)
AI agents are modular, async services that can be swapped, extended, or run in parallel:

- **Affirm Agent**: Validates and supports user decisions
- **Challenge Agent**: Questions and pressure-tests user decisions
- **Future Agents**: 
  - Recovery Coach (emotional support)
  - Technical Mentor (coding guidance)
  - Community Connector (peer matching)
  - Risk Assessor (relapse prevention)

Each agent:
- Is streaming-ready for real-time responses
- Can reference memory fragments for context
- Returns structured responses with confidence scores
- Logs all interactions for telemetry

### 4. Decisions as First-Class Objects
Every user decision is:
- **Captured**: User choice + context + timestamp
- **Processed**: Multi-agent analysis (affirm + challenge)
- **Scored**: Relevance, confidence, risk assessment
- **Stored**: Immutable decision history
- **Referenced**: Future decisions use prior context

## Connector Map

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Edge Config  │  │Feature Flags │  │ Middleware   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL SERVERLESS                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │            Next.js API Routes                      │     │
│  │  /api/decision.ts ← Main decision loop             │     │
│  │  /api/memory.ts   ← Memory retrieval/storage       │     │
│  │  /api/telemetry.ts ← Analytics ingestion           │     │
│  └─────────┬────────────────────────┬─────────────────┘     │
│            │                        │                        │
│            ▼                        ▼                        │
│  ┌─────────────────┐     ┌─────────────────────────┐       │
│  │  Agent Services │     │  Memory Services         │       │
│  │  • affirmAgent  │     │  • Fragment scoring      │       │
│  │  • challengeAgent│    │  • Decay calculation     │       │
│  │  • Future agents │    │  • Relevance ranking     │       │
│  └─────────┬────────┘    └─────────┬────────────────┘       │
└────────────┼──────────────────────┼─────────────────────────┘
             │                      │
             │                      │
             ▼                      ▼
┌──────────────────────────────────────────────────────────────┐
│              EXTERNAL AI PROVIDERS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   OpenAI     │  │   Claude     │  │ Future Models│       │
│  │  GPT-4/3.5   │  │  Opus/Sonnet │  │  Llama/etc   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘       │
└─────────┼──────────────────┼──────────────────────────────────┘
          │                  │
          └──────────┬───────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   IONOS DATABASE (PostgreSQL)                │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Tables (via Prisma):                            │       │
│  │  • User/Session   ← Identity & auth              │       │
│  │  • Decision       ← User choices + context       │       │
│  │  • MemoryFragment ← Scored context snippets      │       │
│  │  • AgentResponse  ← AI outputs + confidence      │       │
│  │  • TelemetryEvent ← Metrics & analytics          │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Decision Loop

1. **User submits decision** → POST `/api/decision`
2. **API route receives request**:
   - Validates input
   - Retrieves relevant memory fragments
   - Spawns parallel agent calls
3. **Agents process in parallel**:
   - Affirm agent: `agents/affirmAgent.ts`
   - Challenge agent: `agents/challengeAgent.ts`
   - Both reference memory context
4. **Responses stored**:
   - Decision record created
   - Agent responses linked to decision
   - New memory fragments generated
   - Telemetry event logged
5. **Response returned to client**:
   - Affirm perspective
   - Challenge perspective
   - Confidence scores
   - Memory references

## Extending the System

### Adding New AI Agents

1. Create agent file: `agents/yourAgent.ts`
2. Follow the pattern:
   ```typescript
   export async function callYourAgent(
     prompt: string,
     context: MemoryFragment[],
     options?: AgentOptions
   ): Promise<AgentResponse> {
     // Streaming-ready implementation
   }
   ```
3. Update `pages/api/decision.ts` to call your agent
4. Add agent type to Prisma schema
5. Deploy (no infrastructure changes needed)

### Adding Feature Flags

1. Define flag in Vercel Edge Config dashboard
2. Reference in `lib/featureFlags.ts`:
   ```typescript
   export const FEATURES = {
     YOUR_FEATURE: 'your_feature_enabled',
   };
   ```
3. Check flag before executing feature code
4. Toggle in production without redeployment

### Memory Evolution

Memory fragments include:
- **Relevance Score**: How relevant to current decision
- **Confidence Score**: How reliable the information is
- **Decay Factor**: Time-based degradation (older = less weight)

To customize scoring:
- Edit `lib/memory.ts` scoring functions
- Adjust decay constants
- Add custom relevance algorithms
- Implement user feedback loops

### Monetization Hooks

Strategic insertion points for paid features:

1. **Agent Selection** (`pages/api/decision.ts`):
   - Free tier: Affirm + Challenge only
   - Premium: Access to all agents (Coach, Mentor, etc.)

2. **Memory Capacity** (`lib/memory.ts`):
   - Free: Last 50 decisions
   - Premium: Unlimited history

3. **Telemetry Access** (`lib/telemetry.ts`):
   - Free: Basic stats
   - Premium: Advanced analytics, export data

4. **Feature Flags** (`lib/featureFlags.ts`):
   - Gate premium features behind subscription check

### Edge Function Opportunities

Current edge functions (via middleware):
- Feature flag routing
- A/B testing
- Geo-based content

Future edge functions:
- Real-time presence (who's online)
- WebSocket message routing
- CDN invalidation triggers

## Technology Decisions

### Why Pages Router (Not App Router)?
- Stable, battle-tested API routes
- Simpler mental model for API-first apps
- Better community support for Prisma + Next.js 14
- Easier to migrate incrementally if needed

### Why Prisma?
- Type-safe database access
- Automatic migrations
- Works seamlessly with IONOS PostgreSQL
- Excellent TypeScript integration

### Why Modular Agents?
- Easy to swap AI providers (OpenAI → Claude → local models)
- Parallel execution for speed
- Independent deployment/testing
- Cost optimization (use cheaper models for simple agents)

### Why Decisions as First-Class?
- Immutable audit trail
- Machine learning training data
- User accountability
- Recovery progress tracking

## Security Considerations

1. **API Keys**: Never expose in client code
2. **Rate Limiting**: Implement per-user limits on `/api/decision`
3. **Input Validation**: Zod schemas for all API inputs
4. **Database Access**: Prisma prevents SQL injection
5. **CORS**: Configure for production domains only
6. **Session Management**: Secure HTTP-only cookies

## Performance Optimization

1. **Agent Parallelization**: Affirm + Challenge run simultaneously
2. **Memory Caching**: Hot memory fragments in Redis (future)
3. **Edge Caching**: Static assets via Vercel CDN
4. **Database Indexing**: Prisma indexes on userId, createdAt
5. **Streaming Responses**: Real-time agent outputs

## Monitoring & Observability

Track via `lib/telemetry.ts`:
- Decisions per user (engagement)
- Return rate (retention)
- Memory references (context usage)
- Agent disagreements (decision quality)
- Response times (performance)
- Error rates (reliability)

Export to:
- Vercel Analytics (built-in)
- Postgres (custom queries)
- External tools (Mixpanel, Amplitude)

## Future Architecture Evolution

### Phase 2: Real-time Features
- WebSockets for live agent streaming
- Presence system for community
- Live decision feed

### Phase 3: Distributed Agents
- Agents as separate microservices
- Message queue for agent orchestration
- Horizontal scaling per agent

### Phase 4: User-Trained Models
- Fine-tune models on user's decision history
- Personalized agent responses
- Privacy-preserving federated learning

### Phase 5: Web3 Integration
- Decision NFTs (ownership proof)
- Community governance (DAO)
- Token rewards for progress
