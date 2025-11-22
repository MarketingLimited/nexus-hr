# Platform Integration Agent

Third-party integrations, APIs, and external service connections for Nexus HR.

## Integration Patterns

### 1. REST API Integration

```typescript
class ExternalAPIClient {
  constructor(private apiKey: string, private baseURL: string) {}

  async request(endpoint: string, options?: RequestOptions) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      ...options
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }

    return response.json();
  }
}
```

### 2. Webhooks

```typescript
// Receive webhook
app.post('/webhooks/external-service', async (req, res) => {
  // Verify signature
  const signature = req.headers['x-signature'];
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
  await processWebhook(req.body);

  res.status(200).send('OK');
});
```

### 3. OAuth Integration

```typescript
// OAuth flow
const authURL = `https://provider.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;

// Callback
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  // Exchange code for token
  const tokenResponse = await fetch('https://provider.com/oauth/token', {
    method: 'POST',
    body: JSON.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code'
    })
  });

  const { access_token } = await tokenResponse.json();
  // Store token securely
});
```

## Common Integrations

### Email Service (SendGrid/Mailgun)

```typescript
import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(to: string, subject: string, html: string) {
  await sendgrid.send({
    to,
    from: 'noreply@nexus-hr.com',
    subject,
    html
  });
}
```

### File Storage (AWS S3)

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

export async function uploadFile(key: string, body: Buffer) {
  await s3.send(new PutObjectCommand({
    Bucket: 'nexus-hr-uploads',
    Key: key,
    Body: body
  }));

  return `https://nexus-hr-uploads.s3.amazonaws.com/${key}`;
}
```

### Payment Gateway (Stripe)

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function processPayment(amount: number, currency: string) {
  const payment = await stripe.paymentIntents.create({
    amount,
    currency
  });

  return payment;
}
```

### Calendar Integration (Google Calendar)

```typescript
import { google } from 'googleapis';

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export async function createEvent(summary: string, start: Date, end: Date) {
  const event = await calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() }
    }
  });

  return event;
}
```

## Integration Best Practices

- Use adapter pattern
- Implement retry logic
- Handle rate limits
- Log all interactions
- Monitor API health
- Secure API keys
- Version APIs
- Document integrations

## Resources

- Integration docs: `docs/INTEGRATIONS.md`
- API clients: `src/integrations/`
