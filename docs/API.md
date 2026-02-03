# API Documentation

## Overview

HustleCodeX Platform provides RESTful API endpoints for AI-powered recovery support features. All API routes are built with Next.js API routes and require proper environment configuration.

## Base URL

**Development**: `http://localhost:3000`  
**Production**: `https://your-domain.com`

## Authentication

Currently, API endpoints do not require authentication tokens. However, they do require:
- Valid `OPENAI_API_KEY` environment variable (server-side only)
- Proper CORS configuration for browser requests

## Available Endpoints

### 1. AI Twin Chat

#### `POST /api/twin/chat`

Initiates a conversation with the AI Twin, a personal guide that provides empathetic support and helps users think through decisions.

**Request Headers**
```
Content-Type: application/json
```

**Request Body**
```typescript
{
  "message": string,              // Required: User's message to the AI Twin
  "context"?: {                   // Optional: Conversation context
    "recoveryStatus"?: string,    // User's recovery status (e.g., "recovery", "reentry", "both")
    "personality"?: string,       // Custom personality prompt for the AI Twin
    "userHistory"?: string[]      // Previous messages for context (last 6 recommended)
  }
}
```

**Response (200 OK)**
```typescript
{
  "response": string              // AI Twin's response message
}
```

**Error Responses**

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid request body - message is required or invalid type |
| 405 | Method not allowed - only POST requests are accepted |
| 503 | Service unavailable - OPENAI_API_KEY not configured |
| 500 | Server error - failed to generate response |

**Example Request**

```typescript
// Using fetch API
const response = await fetch('/api/twin/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: "I'm feeling stressed about work today",
    context: {
      recoveryStatus: 'recovery',
      personality: 'Be supportive and practical',
      userHistory: [
        "Hi! I'm your AI Twin...",
        "What's on your mind today?"
      ]
    }
  })
});

const data = await response.json();
console.log(data.response); // AI Twin's response
```

**Example with Axios**

```typescript
import axios from 'axios';

const { data } = await axios.post('/api/twin/chat', {
  message: "I'm feeling stressed about work today",
  context: {
    recoveryStatus: 'recovery',
    userHistory: ['Hi', 'Hello there']
  }
});

console.log(data.response);
```

**Implementation Details**

- Uses OpenAI GPT-3.5-turbo model
- Maximum response tokens: 300
- Temperature: 0.7 (balanced creativity/coherence)
- Includes conversation history for context awareness
- System prompt emphasizes empathy and non-judgmental support

---

### 2. Decision Simulator

#### `POST /api/twin/simulate`

Simulates potential outcomes of a decision by providing both positive (good path) and negative (bad path) scenarios.

**Request Headers**
```
Content-Type: application/json
```

**Request Body**
```typescript
{
  "decision": string,             // Required: The decision to simulate
  "context"?: {                   // Optional: User context
    "recoveryStatus"?: string,    // User's recovery status
    "currentStreak"?: number      // Days of recovery/sobriety
  }
}
```

**Response (200 OK)**
```typescript
{
  "goodPath": string,             // Positive outcome scenario (2-3 sentences)
  "badPath": string               // Negative outcome scenario (2-3 sentences)
}
```

**Error Responses**

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid request body - decision is required or invalid type |
| 405 | Method not allowed - only POST requests are accepted |
| 503 | Service unavailable - OPENAI_API_KEY not configured |
| 500 | Server error - failed to simulate decision |

**Example Request**

```typescript
// Using fetch API
const response = await fetch('/api/twin/simulate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    decision: "Should I attend that party tonight?",
    context: {
      recoveryStatus: 'recovery',
      currentStreak: 45
    }
  })
});

const data = await response.json();
console.log('Good Path:', data.goodPath);
console.log('Bad Path:', data.badPath);
```

**Example Response**
```json
{
  "goodPath": "Choosing a recovery-friendly alternative like meeting a sober friend for coffee helps maintain your 45-day streak. You'll wake up tomorrow proud of your choice and your progress continues.",
  "badPath": "Attending the party with alcohol present puts your 45-day streak at risk. The environment could trigger cravings and make it harder to stay committed to your recovery goals."
}
```

**Implementation Details**

- Uses OpenAI GPT-3.5-turbo model
- Maximum response tokens: 250
- Temperature: 0.7
- Response parsing extracts "GOOD PATH" and "BAD PATH" sections
- Fallback messages provided if parsing fails
- Focus on recovery-relevant consequences

---

## Setup & Configuration

### Environment Variables

Before using the API endpoints, configure the following environment variables in `.env.local`:

```bash
# OpenAI Configuration (Required)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Configuration (Optional - for future features)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Feature Flags
NEXT_PUBLIC_ENABLE_NEXUS_RECOVERY=true
```

**Important Security Notes:**
- `OPENAI_API_KEY` is server-side only and never exposed to the browser
- Never commit `.env.local` to version control
- Use environment variables in your deployment platform (Vercel, etc.)

### Getting an OpenAI API Key

1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key immediately (you won't see it again)
6. Add to your `.env.local` file

**Cost Considerations:**
- GPT-3.5-turbo is the most cost-effective model
- Each chat request uses ~200-500 tokens
- Monitor usage at [platform.openai.com/usage](https://platform.openai.com/usage)

---

## Usage Examples

### React Component Integration

#### AI Twin Chat

```typescript
import { useState } from 'react';

function TwinChatExample() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: {
            recoveryStatus: 'recovery'
          }
        })
      });
      
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      {response && <p>{response}</p>}
    </div>
  );
}
```

#### Decision Simulator

```typescript
import { useState } from 'react';

function DecisionSimulatorExample() {
  const [decision, setDecision] = useState('');
  const [paths, setPaths] = useState<{goodPath: string, badPath: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/twin/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          context: {
            recoveryStatus: 'recovery',
            currentStreak: 30
          }
        })
      });
      
      const data = await res.json();
      setPaths(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        value={decision} 
        onChange={(e) => setDecision(e.target.value)}
        placeholder="What decision are you considering?"
      />
      <button onClick={simulate} disabled={loading}>
        {loading ? 'Simulating...' : 'Simulate'}
      </button>
      {paths && (
        <div>
          <div style={{color: 'green'}}>
            <h4>Good Path</h4>
            <p>{paths.goodPath}</p>
          </div>
          <div style={{color: 'red'}}>
            <h4>Bad Path</h4>
            <p>{paths.badPath}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Error Handling

### Best Practices

Always implement proper error handling when calling API endpoints:

```typescript
async function safeApiCall() {
  try {
    const response = await fetch('/api/twin/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' })
    });

    // Check if response is OK
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    // Handle error appropriately
    // - Show user-friendly message
    // - Log to error tracking service
    // - Retry logic if appropriate
    return null;
  }
}
```

### Common Error Scenarios

#### 1. Missing API Key

**Error**: `503 Service Unavailable`  
**Message**: "AI Twin service is not configured. Please add OPENAI_API_KEY to environment variables."

**Solution**: 
- Ensure `OPENAI_API_KEY` is set in `.env.local`
- Restart your development server after adding the key
- Verify the key is valid on OpenAI dashboard

#### 2. Invalid Request

**Error**: `400 Bad Request`  
**Message**: "Message is required" or "Decision is required"

**Solution**:
- Ensure required fields are present in request body
- Verify field types (message/decision must be strings)
- Check for empty or whitespace-only strings

#### 3. Rate Limiting

**Error**: `429 Too Many Requests` (from OpenAI)

**Solution**:
- Implement rate limiting on client side
- Add debouncing for user input
- Consider caching responses for common queries
- Upgrade OpenAI plan if needed

#### 4. Network Issues

**Error**: Network timeout or connection refused

**Solution**:
- Implement retry logic with exponential backoff
- Show loading states to users
- Provide fallback offline functionality

---

## Rate Limiting & Best Practices

### Client-Side Considerations

1. **Debouncing**: Add delays before API calls
```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (message) => {
  await fetch('/api/twin/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
}, 500); // Wait 500ms after user stops typing
```

2. **Request Queuing**: Prevent multiple simultaneous requests
```typescript
let isRequesting = false;

async function sendMessage(message: string) {
  if (isRequesting) return;
  
  isRequesting = true;
  try {
    // Make API call
  } finally {
    isRequesting = false;
  }
}
```

3. **Caching**: Store responses to avoid duplicate requests
```typescript
const responseCache = new Map<string, string>();

async function getCachedResponse(message: string) {
  if (responseCache.has(message)) {
    return responseCache.get(message);
  }
  
  const response = await fetch('/api/twin/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  responseCache.set(message, data.response);
  return data.response;
}
```

### Server-Side Optimization

1. **Token Limits**: Current settings balance cost and quality
   - Chat: 300 max tokens (~225 words)
   - Simulation: 250 max tokens (~190 words)

2. **Temperature**: Set to 0.7 for balanced responses
   - Lower (0.3-0.5): More focused, deterministic
   - Higher (0.8-1.0): More creative, varied

3. **Model Selection**: GPT-3.5-turbo for cost-effectiveness
   - Consider GPT-4 for higher quality (higher cost)
   - Update in `/lib/openai.ts` if needed

---

## Testing

### Manual Testing

Use cURL to test endpoints directly:

```bash
# Test AI Twin Chat
curl -X POST http://localhost:3000/api/twin/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, AI Twin!",
    "context": {
      "recoveryStatus": "recovery"
    }
  }'

# Test Decision Simulator
curl -X POST http://localhost:3000/api/twin/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "Should I go to that party?",
    "context": {
      "recoveryStatus": "recovery",
      "currentStreak": 30
    }
  }'
```

### Automated Testing

Example test with Jest and node-fetch:

```typescript
import fetch from 'node-fetch';

describe('AI Twin API', () => {
  it('should respond to chat messages', async () => {
    const response = await fetch('http://localhost:3000/api/twin/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('response');
    expect(typeof data.response).toBe('string');
  });

  it('should simulate decisions', async () => {
    const response = await fetch('http://localhost:3000/api/twin/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision: 'Test decision'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('goodPath');
    expect(data).toHaveProperty('badPath');
  });
});
```

---

## Troubleshooting

### Development Environment

**Problem**: API returns 503 error  
**Solution**: 
1. Check `.env.local` exists and contains `OPENAI_API_KEY`
2. Restart dev server: `npm run dev`
3. Verify key validity at [platform.openai.com](https://platform.openai.com)

**Problem**: CORS errors in browser  
**Solution**: 
- Ensure you're calling from the same origin
- For external calls, configure CORS in `next.config.js`

**Problem**: Slow response times  
**Solution**:
- Check OpenAI API status
- Reduce `max_tokens` in `/lib/openai.ts`
- Verify internet connection

### Production Environment

**Problem**: Environment variables not working  
**Solution**:
1. Set env vars in your hosting platform (Vercel, etc.)
2. Redeploy after adding variables
3. Check variable names match exactly (including `NEXT_PUBLIC_` prefix where needed)

**Problem**: High API costs  
**Solution**:
1. Monitor usage at [platform.openai.com/usage](https://platform.openai.com/usage)
2. Implement caching strategies
3. Add rate limiting
4. Review token limits

---

## Future Enhancements

### Planned Features

- **Authentication**: User-specific API access with JWT tokens
- **WebSocket Support**: Real-time streaming responses
- **Batch Endpoints**: Process multiple requests efficiently
- **Analytics**: Track API usage and response quality
- **Webhook Integration**: Event-driven notifications
- **GraphQL API**: Alternative to REST endpoints

### Community Contributions

We welcome contributions to improve the API:
- Enhanced error messages
- Additional context parameters
- Performance optimizations
- New endpoints for emerging features

---

## Resources

- **Main Repository**: [HustleCodeX Platform](https://github.com/DubjamMusic/hustlecodex-platform)
- **Setup Guide**: [NEXUS_RECOVERY_SETUP.md](./NEXUS_RECOVERY_SETUP.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **OpenAI Documentation**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **Next.js API Routes**: [nextjs.org/docs/api-routes](https://nextjs.org/docs/api-routes/introduction)

---

## Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review OpenAI API status page
- Join community discussions

## License

MIT License - See [LICENSE](../LICENSE) file for details.
