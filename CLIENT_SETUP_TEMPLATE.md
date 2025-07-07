# Client Setup Template

Use this checklist to set up each client with their own isolated webhook system.

## 📋 Pre-Setup Information Needed

- **Client Name:** _____________
- **Domain:** _____________
- **Email Recipients:** _____________
- **From Email:** noreply@clientdomain.com
- **Business Type:** _____________

## 🚀 Setup Steps (15 minutes)

### Step 1: GitHub Repository
- [ ] Create new repo: `webhook-{clientname}`
- [ ] Copy files from template:
  - [ ] `api/contact.js` (update client config)
  - [ ] `package.json`
  - [ ] `WEBHOOK_SETUP.md`

### Step 2: Resend Account
- [ ] Go to resend.com
- [ ] Sign up with: `{clientname}+resend@youragency.com`
- [ ] Create API key
- [ ] Add client's domain (if they have one)
- [ ] Save API key: `re_________________`

### Step 3: Vercel Account
- [ ] Go to vercel.com  
- [ ] Sign up with: `{clientname}+vercel@youragency.com`
- [ ] Connect GitHub repo
- [ ] Add environment variable: `RESEND_API_KEY`
- [ ] Deploy project
- [ ] Save webhook URL: `https://__________.vercel.app/api/contact`

### Step 4: Client Configuration
Update `api/contact.js` with client-specific settings:

```javascript
// Replace the generic config with:
const CLIENT_CONFIG = {
  from: 'noreply@{clientdomain}.com',
  to: ['{recipient1}@{clientdomain}.com', '{recipient2}@{clientdomain}.com'],
  name: '{Client Business Name}',
  template: '{business-type}' // e.g., 'retail', 'services', 'ecommerce'
};
```

### Step 5: Shopify Form Setup
- [ ] Add webhook URL to form section settings
- [ ] Test form submission
- [ ] Verify email delivery
- [ ] Check spam folders

### Step 6: Handover (Optional)
- [ ] Create client documentation
- [ ] Share Vercel dashboard access (if requested)
- [ ] Provide Resend dashboard access (if requested)  
- [ ] Set up billing/usage monitoring

## 📊 Client Tracking Sheet

| Client | Webhook URL | Resend Account | Vercel Account | Monthly Emails | Status |
|--------|-------------|----------------|----------------|----------------|--------|
| Fabric Store | https://fabric-webhook.vercel.app/api/contact | fabricstore+resend@agency.com | fabricstore+vercel@agency.com | ~500 | Active |
| Jewelry Co | https://jewelry-webhook.vercel.app/api/contact | jewelry+resend@agency.com | jewelry+vercel@agency.com | ~200 | Active |

## 💰 Cost Structure

### Free Tier Per Client:
- **Vercel:** Free (very generous limits)
- **Resend:** 3,000 emails/month free
- **Total Cost:** $0/month per client
- **Your Revenue:** $25-50/month per client

### When Client Exceeds Free Tier:
- **Resend Pro:** $20/month (50k emails)
- **Pass cost to client:** Charge $35-50/month
- **Your margin:** $15-30/month profit

## 🔧 Maintenance (Monthly)

- [ ] Check email usage across all clients
- [ ] Monitor Vercel function performance  
- [ ] Review any delivery issues
- [ ] Update client configurations as needed
- [ ] Invoice clients for service

## 🚨 Troubleshooting Common Issues

### Form Not Submitting
1. Check CORS headers in webhook
2. Verify webhook URL is correct
3. Test webhook directly with curl

### Emails Not Delivering  
1. Check Resend dashboard for bounces
2. Verify domain configuration
3. Check client's spam folder
4. Ensure sender reputation is good

### Rate Limiting
1. Check if client exceeded free tier
2. Upgrade to Resend Pro plan
3. Update billing with client

## 📈 Scaling Strategy

### 1-5 Clients: Individual Free Accounts
- Most cost-effective
- Easy management
- Professional isolation

### 6+ Clients: Consider Consolidation
- Shared Resend Pro account
- Cost efficiency analysis
- Bulk billing discounts

### Enterprise Clients: Custom Solutions
- Dedicated infrastructure
- Premium pricing
- White-label options 