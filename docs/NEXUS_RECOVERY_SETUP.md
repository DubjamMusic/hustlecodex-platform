# Nexus Recovery - Setup Guide

## Overview

Nexus Recovery is an AI-powered recovery support platform integrated into HustleCodeX. It provides:

- **AI Twin Chat**: Personal AI guide for decision-making and support
- **Decision Simulator**: Visualize potential outcomes before making choices
- **Quest System**: Gamified tasks to support recovery journey
- **Community Features**: Resource mapping and peer support (coming soon)

## Prerequisites

- Node.js 18.0.0 or higher
- Supabase account (free tier works)
- OpenAI API account (requires payment)

## Installation

### 1. Install Dependencies

Dependencies are already installed if you followed the main setup. If not:

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs openai zustand @tanstack/react-query
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the database to be provisioned (1-2 minutes)

#### Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/migrations/20260115000000_initial_schema.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**

This will create:
- `profiles` table (user profiles with recovery status)
- `twins` table (AI Twin configurations)
- `contributions` table (community resources)
- `quests` table (available quests)
- `quest_completions` table (user quest tracking)
- Row Level Security (RLS) policies

#### Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (keep this secure!)

### 3. Set Up OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key (you won't see it again!)

### 4. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxx

# Enable Nexus Recovery
NEXT_PUBLIC_ENABLE_NEXUS_RECOVERY=true
```

3. **Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

## Usage

### Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000/nexus` to access the Nexus Recovery dashboard.

### Production

Build and deploy:

```bash
npm run build
npm start
```

Or deploy to Vercel:

```bash
vercel --prod
```

Make sure to add all environment variables in your Vercel project settings.

## Features

### AI Twin Chat

The AI Twin is a conversational agent that:
- Provides empathetic support
- Helps think through decisions
- Remembers conversation context
- Adapts to your recovery status

**API Endpoint**: `POST /api/twin/chat`

```typescript
// Example request
fetch('/api/twin/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "I'm feeling stressed about work",
    context: {
      recoveryStatus: 'recovery',
      personality: 'Be supportive and practical',
      userHistory: ['previous', 'messages']
    }
  })
})
```

### Decision Simulator

Helps users explore potential outcomes:
- Good path: positive consequences
- Bad path: risky consequences
- Recovery-focused insights

**API Endpoint**: `POST /api/twin/simulate`

```typescript
// Example request
fetch('/api/twin/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    decision: "Should I go to that party tonight?",
    context: {
      recoveryStatus: 'recovery',
      currentStreak: 30
    }
  })
})
```

### Quest System

Gamified tasks that:
- Encourage healthy habits
- Award XP for completion
- Track daily streaks
- Support leveling up

## Database Schema

### profiles

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  recovery_status TEXT CHECK (recovery_status IN ('recovery', 'reentry', 'both', 'supporter')),
  xp INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Seeker',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### twins

```sql
CREATE TABLE twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  personality_prompt TEXT,
  memory_json JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### contributions

```sql
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('report', 'meeting', 'resource', 'quest')),
  title TEXT NOT NULL,
  description TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  upvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### quests

```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 10,
  creator_id UUID REFERENCES profiles(id),
  is_daily BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### quest_completions

```sql
CREATE TABLE quest_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quest_id, completed_at::date)
);
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with these policies:

- **profiles**: Users can view/update their own profile
- **twins**: Users can view/manage their own Twin
- **contributions**: Public read, authenticated insert
- **quests**: Public read
- **quest_completions**: Users manage their own completions

### Environment Variables

- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` is server-only (never expose!)
- `OPENAI_API_KEY` is server-only (never expose!)

### API Routes

All AI Twin API routes:
- Run server-side only
- Validate input
- Handle errors gracefully
- Rate limit recommended for production

## Costs

### Supabase

- Free tier: 500MB database, 2GB bandwidth, 50,000 monthly active users
- Sufficient for MVP and beta testing
- Scales to Pro tier ($25/month) when needed

### OpenAI

- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Average conversation: ~$0.01-0.05
- Decision simulation: ~$0.01-0.02
- Budget ~$50-100/month for 1000-5000 active users

## Troubleshooting

### "AI Twin service is not configured"

- Check that `OPENAI_API_KEY` is set in `.env.local`
- Restart the dev server after adding env variables
- Verify the API key is valid on OpenAI dashboard

### "Failed to connect to Supabase"

- Check that Supabase URL and keys are correct
- Verify your Supabase project is active
- Check network connectivity
- Ensure migrations were run successfully

### TypeScript errors

```bash
npm run type-check
```

Fix any type errors before building for production.

## Next Steps

1. **Add Authentication**: Implement Supabase Auth
2. **Create Onboarding**: Welcome flow for new users
3. **Map Features**: Add contribution mapping with Leaflet
4. **Mobile App**: Use Capacitor for native mobile apps
5. **Advanced AI**: Fine-tune OpenAI models with user data
6. **Analytics**: Track engagement and outcomes

## Resources

- [API Documentation](./API.md) - **Complete API reference with examples**
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [HustleCodeX Repository](https://github.com/DubjamMusic/hustlecodex)

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review the problem statement for detailed requirements

---

**Built with ❤️ for the recovery community**
