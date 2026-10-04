# Bae'd Waitlist - Email System Setup

## Overview
The waitlist form now sends two emails when a user signs up:
1. **Welcome email** to the user (from welcome@baed.site)
2. **Notification email** to signup@baed.site with signup details

## Setup Steps

### 1. Set up Resend (Email Service)
1. Go to https://resend.com and create an account
2. Add your domain `baed.site` to Resend
3. Verify your domain by adding the required DNS records
4. Generate an API key from the dashboard

### 2. Configure Environment Variables in Vercel
Go to your Vercel project settings → Environment Variables and add:

```
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=welcome@baed.site
NOTIFY_EMAIL=signup@baed.site
```

### 3. DNS Records for Email
Add these DNS records for baed.site:

**For Resend (Email Sending):**
- Add the MX, SPF, DKIM, and DMARC records as instructed by Resend

**Example SPF record:**
```
v=spf1 include:_spf.resend.im ~all
```

### 4. Deploy
Push your changes to git:
```bash
git add .
git commit -m "Add email system for waitlist signups"
git push
```

Vercel will automatically deploy the new API endpoint.

## Testing
1. Fill out the waitlist form on your live site
2. Check that you receive the welcome email
3. Check that signup@baed.site receives the notification email
4. Verify the notification email has Reply-To set to the user's email

## Files Changed
- `api/waitlist.ts` - New serverless function for handling signups
- `src/App.tsx` - Updated form to POST to API
- `.env.example` - Environment variables template

## Notes
- The welcome email includes both HTML (styled) and plain text versions
- The notification email is plain text with name, email, mobile, and IST timestamp
- Reply-To is set on the notification email so you can reply directly to the user
- All emails are sent from welcome@baed.site
