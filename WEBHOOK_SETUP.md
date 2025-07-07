# Custom Webhook Setup Guide

This guide will help you deploy your own webhook endpoint for the Shopify form to send emails via Resend.

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Resend API Key
1. Go to [resend.com](https://resend.com) and create account
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `re_`)

### Step 2: Deploy to Vercel
1. **Fork this repo** or create new repo with these files:
   - `api/contact.js`
   - `package.json`

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) 
   - Sign up with GitHub
   - Import your repository

3. **Add Environment Variable:**
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add: `RESEND_API_KEY` = your Resend API key

4. **Deploy:**
   - Vercel auto-deploys when you push to GitHub
   - Your webhook URL: `https://your-project.vercel.app/api/contact`

### Step 3: Configure Your Domain (Optional but Recommended)
1. **Add domain to Resend:**
   - Resend → Domains → Add Domain
   - Follow DNS setup instructions

2. **Update webhook code:**
   - Change `noreply@yourdomain.com` to your actual domain
   - Change `sales@yourdomain.com` to your email

### Step 4: Update Shopify Form
1. **Edit your form section**
2. **Add webhook URL:** `https://your-project.vercel.app/api/contact`
3. **Save and test**

## 🎯 **Benefits You Get:**

### ✅ **Professional Emails**
```html
Subject: New Curtain Order Inquiry
From: noreply@yourstore.com
Reply-To: customer@email.com

New Form Submission
Submitted: January 15, 2024 at 3:45 PM

Customer Name: John Smith
Email: john@email.com
Fabric Selection: Velvet Curtain Fabric - Navy Blue (ID: 123/456)
Window Width: 48 inches
Window Height: 84 inches
Special Instructions: Need blackout lining
```

### ✅ **Reliable Delivery**
- No "form submission errors"
- Delivery confirmations
- Professional email templates
- Spam-resistant sending

### ✅ **Full Control**
- Custom recipients per form
- Different email templates
- Form data validation
- Submission logging

## 🛠️ **Customization:**

### Change Recipients
```javascript
// In api/contact.js, line 45
to: ['sales@yourstore.com', 'orders@yourstore.com']
```

### Custom Email Template
```javascript
// Modify the formatEmailHTML function
function formatEmailHTML(contact) {
  return `
    <h1>🪟 New Curtain Order!</h1>
    <p>Customer: ${contact.name}</p>
    <p>Fabric: ${contact.fabric_selection}</p>
    <p>Dimensions: ${contact.width}" x ${contact.height}"</p>
  `;
}
```

### Multiple Recipients by Form Type
```javascript
// Dynamic recipients based on form data
let recipients;
if (contact.inquiry_type === 'Custom Curtains') {
  recipients = ['curtains@yourstore.com'];
} else if (contact.inquiry_type === 'Bulk Orders') {
  recipients = ['wholesale@yourstore.com'];
} else {
  recipients = ['info@yourstore.com'];
}
```

## 🔧 **Troubleshooting:**

### Form Not Submitting
1. Check browser console for errors
2. Verify webhook URL is correct
3. Test webhook directly with curl:
```bash
curl -X POST https://your-project.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"contact":{"email":"test@test.com","name":"Test"}}'
```

### Emails Not Sending
1. Check Vercel function logs
2. Verify RESEND_API_KEY is set
3. Ensure your domain is verified in Resend
4. Check spam folder

### CORS Errors
The webhook includes CORS headers for cross-origin requests from your Shopify store.

## 💰 **Costs:**
- **Vercel:** Free (generous limits)
- **Resend:** Free tier (3,000 emails/month)
- **Total:** $0/month for most stores

## 🔒 **Security:**
- ✅ API key hidden in environment variables
- ✅ CORS configured for your domain
- ✅ Input validation and sanitization
- ✅ Rate limiting via Vercel
- ✅ No sensitive data in client code

## 📈 **Scaling:**
- **3,000+ emails/month:** Upgrade Resend plan
- **High traffic:** Vercel Pro plan
- **Multiple stores:** Use same webhook for all

Your webhook is production-ready and will handle thousands of form submissions reliably! 