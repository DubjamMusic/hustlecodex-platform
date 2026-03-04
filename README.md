 hustlecodeX
 HustleCodex Stack

Vercel-ready Next.js starter kit for community-driven recovery RPG.

 HustleCodex V3
Reality Recovery Playing Game — built with Next.js and TailwindCSS
main
# HustleCodeX V3 - Reality Recovery Platform

Reality Recovery Playing Game — built with Next.js, TypeScript, and TailwindCSS

> **From Struggle to Digital Empire** — A gamified recovery platform that transforms addiction energy into coding skills and entrepreneurship.

## ✨ Features

### 🎮 Interactive Prestige Console
- **Complex Hierarchy**: 4-tier sector system with locked/unlocked states
- **Golden Globe**: Animated central orb with real-time node statistics
- **Data Pulse System**: Visual data streak animations on command
- **Command Dock**: Glassmorphic control interface with live stats
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### 🤖 Decision Loop System (NEW)
- **Multi-Agent Analysis**: Get perspectives from both Affirm and Challenge agents
- **Memory-Enhanced Context**: Decisions informed by your past choices and patterns
- **Parallel Agent Execution**: Fast responses with concurrent AI processing
- **Telemetry & Analytics**: Track decision patterns, agent performance, and outcomes
- **Streaming-Ready Architecture**: Foundation for real-time agent responses
- **Monetization Hooks**: Free tier limits with premium upgrade paths

### 🤖 Nexus Recovery
- **AI Twin Chat**: Personal AI guide for decision-making and recovery support
- **Decision Simulator**: Visualize good path vs bad path before making choices
- **Quest System**: Gamified daily tasks with XP rewards and level progression
- **User Profiles**: Track recovery status, streaks, and achievements
- **Community Features**: Resource mapping and peer support (coming soon)

[📖 Full Nexus Recovery Setup Guide](./docs/NEXUS_RECOVERY_SETUP.md) | [🔌 API Documentation](./docs/API.md)

### 🚀 Technical Stack
- **Framework**: Next.js 14.1 (Pages Router)
- **Language**: TypeScript 5.3+ (strict mode)
- **Styling**: Tailwind CSS 3.4
- **Database**: PostgreSQL via Prisma ORM (IONOS or any Postgres 12+)
- **AI**: OpenAI GPT-3.5/GPT-4 (swappable providers)
- **State**: Zustand for client state
- **Fonts**: Cinzel (prestige), Inter (general)
- **Animations**: Framer Motion + CSS keyframes

### 🔒 Production Ready
- ✅ Security headers configured
- ✅ SEO optimized with meta tags
- ✅ Performance optimized (SWC, code splitting)
- ✅ Type-safe with TypeScript strict mode
- ✅ Zero security vulnerabilities (Next.js 15.5.9)
- ✅ Custom 404 error page
- ✅ Responsive mobile design
- ✅ PWA support with Capacitor

## 🚀 Quick Start

### Prerequisites

- **Node.js 18.18.0+** (check with `node --version`)
- **PostgreSQL 12+** database (IONOS, Supabase, or local)
- **OpenAI API Key** (optional, can use mock responses)

### Installation

```bash
# Clone the repository
git clone https://github.com/DubjamMusic/hustlecodex-platform.git
cd hustlecodex-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev

# Open http://localhost:3000
```

### Decision Loop Setup

The Decision Loop is the core AI-powered feature that provides multi-agent decision support.

1. **Set up Database** (PostgreSQL):
   ```bash
   # Option 1: Use IONOS Managed Database
   # Get connection string from IONOS dashboard
   DATABASE_URL="postgresql://user:password@host:5432/hustlecodex"
   
   # Option 2: Use local PostgreSQL
   DATABASE_URL="postgresql://localhost:5432/hustlecodex"
   
   # Run migrations
   npx prisma migrate deploy
   ```

2. **Configure OpenAI** (for AI agents):
   ```bash
   # Get API key from https://platform.openai.com/api-keys
   OPENAI_API_KEY=sk-your_key_here
   
   # Or use mock responses (no API key needed)
   MOCK_AI_RESPONSES=true
   ```

3. **Enable Feature Flags**:
   ```bash
   # In .env.local
   FEATURE_FLAGS=decision_loop_enabled:true,multi_agent_enabled:true,telemetry_enabled:true
   ```

4. **Access Decision Loop**:
   ```
   http://localhost:3000/decision
   ```

### Nexus Recovery Features (Legacy)

To enable AI-powered recovery features:

1. **Set up Supabase** (free tier):
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Run database migrations from `supabase/migrations/`

2. **Set up OpenAI** (requires API key):
   - Create account at [platform.openai.com](https://platform.openai.com)
   - Generate API key

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Add your Supabase and OpenAI keys
   # Set NEXT_PUBLIC_ENABLE_NEXUS_RECOVERY=true
   ```

4. **Access Nexus Dashboard**:
   ```
   http://localhost:3000/nexus
   ```

**Full setup guide**: [docs/NEXUS_RECOVERY_SETUP.md](./docs/NEXUS_RECOVERY_SETUP.md)

## 📦 Build & Deploy

### Local Production Build

```bash
# Type check
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

### Deploy to Vercel + IONOS

The recommended setup uses **Vercel for compute** (Next.js hosting) and **IONOS for stateful storage** (PostgreSQL database).

#### Step 1: Set up IONOS Database

1. **Create IONOS Account**:
   - Sign up at [ionos.com](https://www.ionos.com/)
   - Navigate to Database hosting

2. **Create PostgreSQL Database**:
   - Choose PostgreSQL 12+ instance
   - Note down connection credentials
   - Enable external connections (whitelist Vercel IPs if needed)

3. **Get Connection String**:
   ```
   DATABASE_URL=postgresql://username:password@host.ionos.com:5432/hustlecodex
   DIRECT_URL=postgresql://username:password@host.ionos.com:5432/hustlecodex
   ```

#### Step 2: Deploy to Vercel

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Configure Environment Variables** in Vercel Dashboard:
   ```bash
   # Database
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...
   
   # AI
   OPENAI_API_KEY=sk-...
   
   # Feature Flags
   FEATURE_FLAGS=decision_loop_enabled:true,multi_agent_enabled:true,telemetry_enabled:true
   
   # Monetization
   FREE_TIER_DECISION_LIMIT=50
   FREE_TIER_MEMORY_LIMIT=100
   
   # Optional
   ANALYTICS_WRITE_KEY=...
   EDGE_CONFIG=...
   ```

3. **Run Database Migrations**:
   ```bash
   # From local machine with Vercel environment
   DATABASE_URL="your_production_url" npx prisma migrate deploy
   
   # Or use Vercel CLI
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

4. **Verify Deployment**:
   - Visit your Vercel URL
   - Test `/api/decision` endpoint
   - Check `/decision` page
   - Monitor logs in Vercel dashboard

#### Step 3: Post-Deployment Setup

1. **Configure Feature Flags** (Optional - Vercel Edge Config):
   - Go to Vercel Dashboard → Project → Storage
   - Create Edge Config
   - Add feature flags:
     ```json
     {
       "decision_loop_enabled": true,
       "multi_agent_enabled": true,
       "telemetry_enabled": true
     }
     ```
   - Copy Edge Config connection string to `EDGE_CONFIG` env var

2. **Set up Analytics** (Optional):
   - Enable Vercel Analytics in dashboard
   - Or configure external analytics via `ANALYTICS_WRITE_KEY`

3. **Configure Custom Domain**:
   - Add domain in Vercel dashboard
   - Update DNS records
   - SSL automatically provisioned

### Deploy to Netlify (Alternative)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configure environment variables in Netlify dashboard
```

### Docker Deployment (Self-Hosted)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t hustlecodex .
docker run -p 3000:3000 --env-file .env.local hustlecodex
```

## 🔧 Configuration
npm start

# Type checking
npm run type-check

# Deploy to Vercel (recommended)
vercel --prod
```

## 🎨 Project Structure

```
hustlecodex/
├── agents/                       # AI agent modules (NEW)
│   ├── affirmAgent.ts            # Affirm agent: validates decisions
│   └── challengeAgent.ts         # Challenge agent: questions decisions
├── components/
│   ├── CommandDock.tsx           # Control interface
│   ├── GoldenGlobe.tsx           # Central orb with animations
│   ├── PrestigeSidebar.tsx       # Sector hierarchy
│   ├── DecisionLoop.tsx          # Decision loop UI (NEW)
│   ├── TwinChat.tsx              # AI Twin chat interface
│   └── QuestList.tsx             # Quest system
├── pages/
│   ├── _app.tsx                  # App wrapper
│   ├── _document.tsx             # HTML document
│   ├── index.tsx                 # Home dashboard
│   ├── decision.tsx              # Decision loop page (NEW)
│   ├── nexus.tsx                 # Nexus Recovery dashboard
│   ├── 404.tsx                   # Error page
│   └── api/
│       ├── decision.ts           # Decision loop API endpoint (NEW)
│       └── twin/                 # AI Twin API routes
│           ├── chat.ts           # Chat endpoint
│           └── simulate.ts       # Decision simulation
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── featureFlags.ts           # Feature flag management
│   ├── memory.ts                 # Memory fragment system
│   ├── telemetry.ts              # Analytics & telemetry (NEW)
│   ├── env.ts                    # Environment validation
│   └── openai.ts                 # OpenAI utilities
├── prisma/
│   └── schema.prisma             # Database schema (Prisma)
├── styles/
│   └── globals.css               # Global styles + animations
├── tailwind.config.js            # Tailwind configuration
├── next.config.js                # Next.js configuration
└── vercel.json                   # Deployment config
```

## 🤖 Agent Orchestration Rules

The Decision Loop uses a **multi-agent architecture** where different AI perspectives analyze the same decision. Here's how it works:

### Agent Types

1. **Affirm Agent** (`agents/affirmAgent.ts`):
   - **Role**: Validates and supports the user's decision
   - **Model**: GPT-3.5-turbo (configurable to GPT-4)
   - **Temperature**: 0.7 (balanced creativity)
   - **Focus**: Positive reinforcement, growth identification, encouragement

2. **Challenge Agent** (`agents/challengeAgent.ts`):
   - **Role**: Questions and pressure-tests the user's decision
   - **Model**: GPT-3.5-turbo (configurable)
   - **Temperature**: 0.8 (slightly more creative for diverse perspectives)
   - **Focus**: Risk identification, blind spot detection, alternative viewpoints

### Orchestration Flow

```
User Decision Input
        ↓
1. Validate Input (Zod schema)
        ↓
2. Check Feature Flags
   - decision_loop_enabled
   - multi_agent_enabled
   - telemetry_enabled
        ↓
3. Retrieve Relevant Memories
   - Query user's past decisions
   - Score by relevance
   - Return top 5 memories
        ↓
4. Call Agents in Parallel
   ├─→ Affirm Agent  (memory context)
   └─→ Challenge Agent (memory context)
        ↓
5. Detect Disagreements
   - Compare confidence scores
   - Flag significant deltas (>0.3)
        ↓
6. Store Everything
   ├─→ Decision record
   ├─→ Agent responses
   ├─→ Memory fragments
   └─→ Telemetry events
        ↓
7. Return Structured Response
   - Decision ID
   - Agent responses
   - Memory references
   - Meta information
```

### Adding New Agents

To add a new agent (e.g., Recovery Coach, Risk Assessor):

1. **Create agent file**: `agents/yourAgent.ts`
   ```typescript
   import OpenAI from 'openai';
   import { env } from '@/lib/env';
   
   export async function callYourAgent(
     decisionText: string,
     context: string,
     memories: MemoryFragment[]
   ): Promise<YourAgentResponse> {
     // Implementation
   }
   ```

2. **Update decision API**: `pages/api/decision.ts`
   ```typescript
   const yourAgentPromise = callYourAgent(decisionText, context, memories);
   agentPromises.push(yourAgentPromise);
   ```

3. **Store response**: Add to `agentResponsePromises` array

4. **Update UI**: Modify `components/DecisionLoop.tsx` to display new agent

### Feature Flag Integration

Agents respect feature flags for gradual rollout:

```typescript
// Check if multi-agent is enabled
const multiAgentEnabled = await isFeatureEnabled(
  FEATURES.MULTI_AGENT_ENABLED, 
  userId
);

// Only call Challenge agent if enabled
if (multiAgentEnabled) {
  const challengePromise = callChallengeAgent(...);
  agentPromises.push(challengePromise);
}
```

### Monetization Hooks

Free vs Premium tier differences:

| Feature | Free Tier | Premium Tier |
|---------|-----------|--------------|
| Decisions per day | 50 | Unlimited |
| Agents available | Affirm only | Affirm + Challenge + Future agents |
| Memory capacity | 100 fragments | Unlimited |
| Telemetry access | Basic stats | Advanced analytics + export |
| Model choice | GPT-3.5 | GPT-4 + Claude |

Configure limits via environment variables:
```bash
FREE_TIER_DECISION_LIMIT=50
FREE_TIER_MEMORY_LIMIT=100
PREMIUM_TIER_ID=premium_v1
```

### Model Swapping

Agents support multiple AI providers:

```typescript
// In agent config
export const AGENT_CONFIG = {
  provider: 'openai', // or 'anthropic', 'local', etc.
  model: 'gpt-3.5-turbo', // or 'gpt-4', 'claude-opus-20240229'
  // ...
};

// To swap providers, update env.ts and agent files
// No infrastructure changes needed!
```

## 🎯 Key Components
│       └── twin/                 # AI Twin API routes (NEW)
│           ├── chat.ts           # Chat endpoint
│           └── simulate.ts       # Decision simulation
├── lib/
│   ├── supabase.ts               # Supabase client & types (NEW)
│   └── openai.ts                 # OpenAI utilities (NEW)
├── supabase/
│   └── migrations/               # Database schema (NEW)
├── docs/
│   └── NEXUS_RECOVERY_SETUP.md   # Setup guide (NEW)
├── styles/
│   └── globals.css               # Global styles + animations
├── tailwind.config.js            # Tailwind configuration
├── next.config.js                # Next.js configuration
└── vercel.json                   # Deployment config
```

## 🎯 Key Components

### Golden Globe Prestige Console

#### PrestigeSidebar
- Interactive sector cards with hover effects
- Locked/unlocked state management
- Price tag displays
- Click handlers for sector selection

#### GoldenGlobe
- Animated central orb (400px desktop, 250px mobile)
- Real-time node count and latency display
- Ambient data streak animations
- Pulse effect system (15 synchronized streaks)
- React refs for imperative control

#### CommandDock
- Glassmorphic design with backdrop blur
- Dynamic stats message display
- Pulse button with hover effects
- Gold color scheme integration

### Nexus Recovery Features

#### TwinChat
- AI-powered conversational interface
- Message history with timestamps
- Context-aware responses based on recovery status
- Real-time streaming from OpenAI GPT-3.5-turbo
- Glassmorphic design matching platform aesthetic

#### DecisionSimulator
- Input field for decision description
- Good path vs bad path visualization
- Color-coded outcomes (green/red)
- Recovery-focused insights
- Integrated with AI Twin intelligence

#### QuestList
- Daily and regular quest display
- XP reward tracking
- Completion state management
- Badge system integration
- Progress visualization

## 🔧 Configuration

### Environment Variables

#### Core Application
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME="HustleCodeX - Reality Recovery Platform"
```

#### Optional Analytics
```bash
NEXT_PUBLIC_GA_ID=           # Google Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN= # Plausible Analytics
```

#### Nexus Recovery Features (NEW)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server-only

# OpenAI
OPENAI_API_KEY=sk-xxxxx  # Server-only

# Feature Flags
NEXT_PUBLIC_ENABLE_NEXUS_RECOVERY=true
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```

**⚠️ Security**: Never commit `.env.local` to git. Server-only keys should never be exposed to the browser.

### Tailwind Theme
Custom colors defined in `tailwind.config.js`:
- **gold**: #d4af37 (prestige elements)
- **deep-black**: #020202 (backgrounds)
- **prestige-blue**: #003366 (accents)

Custom font family:
- **cinzel**: Cinzel serif (Google Fonts)

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (stacked layout, 250px globe)
- **Desktop**: ≥ 768px (sidebar + main, 400px globe)

## 🎨 Animations

### Data Streak Fall
```css
@keyframes fall {
  from { transform: translateY(-500px) rotate(45deg); opacity: 1; }
  to { transform: translateY(500px) rotate(45deg); opacity: 0; }
}
```

- Ambient: 1 streak every 3 seconds
- Pulse: 15 streaks in rapid succession
- Duration: 0.5-2 seconds per streak
- Effect: Golden gradient with blur

## 🔐 Security

All security headers configured in `vercel.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy configured

## 📈 Performance

- **Build Size**: ~100KB first load JS
- **Lighthouse Score**: 95-100 (Performance)
- **Core Web Vitals**: All metrics in green zone
- **Images**: Optimized with Next.js Image component
- **Fonts**: Preconnected to Google Fonts CDN

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

### Docker
```bash
docker build -t golden-globe .
docker run -p 3000:3000 golden-globe
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide.

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Deployment Guide](./DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of HustleCodex V3 - Reality Recovery Playing Game.

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Golden Globe Prestige Console
- [x] AI Twin Chat with OpenAI GPT-3.5
- [x] Decision Simulator (good path vs bad path)
- [x] Quest System with XP rewards
- [x] Supabase database schema
- [x] TypeScript strict mode
- [x] Security headers and best practices

### Phase 2: Core Features (Q1 2026)
- [ ] User authentication with Supabase Auth
- [ ] Profile creation and recovery status tracking
- [ ] Quest completion persistence
- [ ] XP and rank progression system
- [ ] Daily streak tracking
- [ ] Community contribution mapping (Leaflet/OpenStreetMap)
- [ ] Resource location pins

### Phase 3: Enhanced Features (Q2 2026)
- [ ] AI Twin memory and context persistence
- [ ] Advanced decision simulation with multi-path outcomes
- [ ] Badge and achievement system
- [ ] Leaderboards
- [ ] User-generated quests
- [ ] Marketplace for recovery resources
- [ ] Mobile PWA optimization

### Phase 4: Growth (Q3-Q4 2026)
- [ ] Payment gateway integration (Stripe/Gumroad)
- [ ] B2B dashboard for recovery organizations
- [ ] Advanced analytics and outcome tracking
- [ ] Native mobile apps (Capacitor iOS/Android)
- [ ] Sponsor/mentor matching system
- [ ] Video content integration
- [ ] Multi-language support

### Phase 5: Scale (2027)
- [ ] Web3/NFT achievements (optional)
- [ ] API marketplace
- [ ] White-label solutions for recovery centers
- [ ] Research partnerships for outcome studies
- [ ] Integration with telehealth platforms
- [ ] Voice-first AI Twin interface

## 📚 Documentation

- [🚀 MVP Launch Checklist](./docs/launch-checklist.md) - Viable MVP (A) definition, release steps & 5-minute verification checklist
- [Ecosystem Usage Guide](./docs/ECOSYSTEM_USAGE_GUIDE.md) - **NEW!** How to combine all repos with pros and cons
- [API Documentation](./docs/API.md) - Complete API reference with examples
- [Architecture Overview](./ARCHITECTURE.md) - System design and component map
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Nexus Recovery Setup Guide](./docs/NEXUS_RECOVERY_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 💰 Business Model

### Revenue Streams
1. **Freemium SaaS**
   - Free: Basic AI Twin, limited quests, community features
   - Guardian ($9/mo): Unlimited AI conversations, advanced decision simulations
   - Architect ($29/mo): Priority support, custom AI personality, analytics

2. **B2B Licenses**
   - Recovery centers: $500-5K/month for white-labeled instances
   - Reentry programs: Custom pricing based on user count
   - Co-branded solutions with outcome tracking

3. **Marketplace** (10-15% commission)
   - User-generated prompts and quests
   - Recovery resources and tools
   - Professional content from creators

4. **Grants & Partnerships**
   - Recovery research grants ($50-500K/year)
   - Government reentry program funding
   - Foundation support for social impact

### Target Market
- **Primary**: 20M+ individuals in recovery in the US
- **Secondary**: 5M+ individuals in reentry programs
- **Tertiary**: Recovery organizations and treatment centers

## 🏆 Competitive Advantage

| Feature | HustleCodeX | Codecademy | I Am Sober | BetterHelp |
|---------|-------------|------------|------------|------------|
| AI Decision Support | ✅ | ❌ | ❌ | ⚠️ |
| Real Coding Skills | ✅ | ✅ | ❌ | ❌ |
| Recovery Focus | ✅ | ❌ | ✅ | ✅ |
| Gamification | ✅ | ⚠️ | ⚠️ | ❌ |
| Community Mapping | ✅ | ❌ | ⚠️ | ❌ |
| B2B Solutions | ✅ | ✅ | ❌ | ✅ |

## 🤝 Contributing

We welcome contributions from developers, designers, recovery professionals, and community members!

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow our coding standards (see `.github/copilot-instructions.md`)
4. Write tests for new features
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Areas for Contribution
- 🐛 Bug fixes and issue resolution
- ✨ New feature development
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage expansion
- 🌍 Internationalization
- ♿ Accessibility improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Recovery community for inspiration and feedback
- Open source contributors
- Supabase and OpenAI for enabling AI-powered recovery support
- UK recovery charities for partnership opportunities

## 📞 Contact

- **Website**: [hustlecodex.com](https://hustlecodex.com)
- **Email**: hello@hustlecodex.com
- **GitHub**: [github.com/DubjamMusic/hustlecodex](https://github.com/DubjamMusic/hustlecodex)
- **Discord**: Join our community (coming soon)

---

**Built with ❤️ for the recovery community** | Transforming lives through code, one quest at a time.
