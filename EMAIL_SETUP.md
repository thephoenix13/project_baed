# Bae'd Waitlist - Email System Setup

## Overview
The waitlist form now sends two emails when a user signs up:
1. **Welcome email** to the user (from welcome@baed.site)
2. **Notification email** to signup@baed.site with signup details

The system also detects duplicate signups and shows a different message while still sending the email.

## Setup Steps

### 1. Set up Resend (Email Service)
1. Go to https://resend.com and create an account
2. Add your domain `baed.site` to Resend
3. Verify your domain by adding the required DNS records
4. Generate an API key from the dashboard

### 2. Set up Upstash Redis (Data Storage)
1. Go to https://console.upstash.com/ and create an account
2. Create a new Redis database (free tier: 10,000 commands/day)
3. Copy the **REST URL** and **REST Token** from the database details
4. These will be used as environment variables

### 3. Configure Environment Variables in Vercel
Go to your Vercel project settings → Environment Variables and add:

```
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=welcome@baed.site
NOTIFY_EMAIL=signup@baed.site
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 4. DNS Records for Email
Add these DNS records for baed.site:

**For Resend (Email Sending):**
- Add the MX, SPF, DKIM, and DMARC records as instructed by Resend

**Example SPF record:**
```
v=spf1 include:_spf.resend.im ~all
```

### 5. Deploy
Push your changes to git:
```bash
git add .
git commit -m "Add email system with duplicate detection"
git push
```

Vercel will automatically deploy the new API endpoint.

## How Duplicate Detection Works

When a user signs up:
1. The system checks if their email already exists in Redis
2. **If new signup:**
   - Stores their data in Redis
   - Sends welcome email: "Thanks for joining the waitlist!"
   - Sends notification: "New waitlist signup — email@example.com"
   - Shows green success message on the form

3. **If duplicate signup:**
   - Updates their data in Redis
   - Sends welcome email: "You're already on the waitlist!"
   - Sends notification: "Duplicate waitlist signup — email@example.com"
   - Shows amber warning message: "You're already on the list! We've still sent you an email."

## Testing
1. Fill out the waitlist form with a new email
2. Check that you receive the welcome email
3. Check that signup@baed.site receives the notification email
4. Try signing up again with the same email
5. Verify you see the "already on the list" message
6. Check that you still receive an email
7. Check that the notification email says "Duplicate waitlist signup"

## Files Changed
- `api/waitlist.ts` - Updated with Redis storage and duplicate detection
- `src/App.tsx` - Updated form to handle duplicate responses
- `.env.example` - Added Upstash Redis environment variables

## Notes
- All waitlist data is stored in Upstash Redis (persistent, survives redeployments)
- The welcome email includes both HTML (styled) and plain text versions
- The notification email is plain text with name, email, mobile, and IST timestamp
- Reply-To is set on the notification email so you can reply directly to the user
- All emails are sent from welcome@baed.site
- Duplicate signups still trigger emails but with different messaging
