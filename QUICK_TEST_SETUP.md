# Shopify Form to Email Setup (10 Minutes)

## 🎯 **Goal:** Get your Shopify form sending emails to your specific address

## 🚀 Step-by-Step Setup

### **Step 1: Get Resend API Key (2 mins)**
1. Go to [resend.com](https://resend.com) and sign up
2. Create API Key (starts with `re_`)
3. Copy the key

### **Step 2: Update Webhook Code (1 min)**
Edit `api/contact.js` line 2-6:
```javascript
const CONFIG = {
  from: 'onboarding@resend.dev',        // ✅ Resend's default (no domain setup needed)
  to: ['your@email.com'],               // ⚠️ Change this to YOUR email
  name: 'Your Store',
  template: 'general'
};
```

### **Step 3: Deploy to Vercel (3 mins)**
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Add Environment Variable: `RESEND_API_KEY` = your Resend key
4. Deploy → Get webhook URL: `https://your-project.vercel.app/api/contact`

### **Step 4: Update Shopify Form (2 mins)**
1. Edit your form section in Shopify
2. Add webhook URL: `https://your-project.vercel.app/api/contact`
3. Save changes

### **Step 5: Test (2 mins)**
**Quick curl test:**
```bash
curl -X POST https://your-project.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"contact":{"email":"test@test.com","name":"Test Customer","message":"Test message"}}'
```

**Or test the actual form:**
- Fill out your Shopify form
- Submit and check your email

## ✅ Success Response:
```json
{"success": true, "message": "Email sent successfully", "id": "re_abc123"}
```

## 📧 Email You'll Receive:
```
FROM: onboarding@resend.dev
TO: your@email.com
REPLY-TO: customer@email.com
SUBJECT: New Your Store Form Submission

[All form data formatted nicely]
```

## 🔧 Common Issues:
- **"Email required"** → Make sure form has email field named `contact[email]`
- **"Authorization failed"** → Check Resend API key in Vercel environment variables
- **No emails** → Check spam folder, verify your email address in CONFIG
- **CORS errors** → Normal for cross-origin, form should still work

## 💰 Cost:
- **Vercel:** Free
- **Resend:** Free (3,000 emails/month)
- **Total:** $0

## 🎯 Done!
Your Shopify form now sends emails to your specific address without needing access to the store email. 