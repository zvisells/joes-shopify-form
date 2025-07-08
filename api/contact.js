// Configuration for your form
const CONFIG = {
  from: 'onboarding@resend.dev',        // Resend's default domain (no verification needed)
  to: ['zvisells@gmail.com'],               // Replace with your email address
  name: 'Your Store',
  template: 'general'
};

export default async function handler(req, res) {
  // Set CORS headers to allow requests from any domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug everything about the request
    console.log('=== REQUEST DEBUG v4 - DEPLOYED AT:', new Date().toISOString(), '===');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body type:', typeof req.body);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'undefined');
    console.log('Body length:', req.body ? JSON.stringify(req.body).length : 'undefined');
    console.log('Raw body:', req.body);
    console.log('===================');
    
    // Parse JSON data
    let jsonData = {};
    
    // Validate req.body early to avoid accessing undefined properties
    if (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) {
      console.error('❌ VALIDATION FAILED: Empty or invalid request body');
      console.error('Body value:', req.body);
      console.error('Body type:', typeof req.body);
      console.error('Body keys:', req.body ? Object.keys(req.body) : 'no keys');
      return res.status(400).json({ 
        error: 'Empty or invalid request body',
        debug: { 
          body: req.body, 
          contentType: req.headers['content-type'],
          bodyType: typeof req.body,
          bodyKeys: req.body ? Object.keys(req.body) : 'no keys'
        }
      });
    }
    
    // Handle JSON data
    if (typeof req.body === 'object' && req.body !== null) {
      jsonData = req.body;
      console.log('✅ Using parsed JSON object:', jsonData);
    } else if (typeof req.body === 'string') {
      try {
        jsonData = JSON.parse(req.body);
        console.log('✅ Parsed JSON from string:', jsonData);
      } catch (e) {
        console.error('❌ JSON PARSE ERROR:', e);
        console.error('Raw body that failed:', req.body);
        return res.status(400).json({ 
          error: 'Invalid JSON format',
          bodyType: typeof req.body,
          body: req.body,
          parseError: e.message
        });
      }
    } else {
      console.error('❌ INVALID BODY FORMAT');
      console.error('Body type:', typeof req.body);
      console.error('Body value:', req.body);
      return res.status(400).json({ 
        error: 'Invalid body format',
        bodyType: typeof req.body,
        body: req.body
      });
    }

    console.log('Parsed jsonData:', jsonData);

    // ACCEPT ANY DATA STRUCTURE - HARDCODE EVERYTHING FOR TESTING
    console.log('=== ACCEPTING ANY REQUEST - HARDCODED MODE ===');
    console.log('jsonData:', JSON.stringify(jsonData, null, 2));
    console.log('jsonData keys:', Object.keys(jsonData));
    
    // Try multiple possible data locations
    const possibleData = jsonData.data || jsonData.contact || jsonData || {};
    console.log('Possible data found:', JSON.stringify(possibleData, null, 2));
    
    // HARDCODE EVERYTHING FOR TESTING
    const formData = {
      email: 'zvisells@gmail.com',
      'full-name': 'Test User',
      message: 'Test message from Shopify form',
      subject: 'Test Form Submission',
      timestamp: new Date().toISOString(),
      ...possibleData  // Add any actual form data on top
    };
    
    console.log('=== FINAL FORM DATA (HARDCODED) ===');
    console.log('Form data:', JSON.stringify(formData, null, 2));
    console.log('======================================');
    
    let email = formData.email;
    console.log('✅ EMAIL CONFIRMED:', email);
    
    // Add email to form data for consistency
    formData.email = email;

    // Prepare email content
    const emailContent = formatEmailHTML(formData, CONFIG);
    
    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: CONFIG.from,
        to: CONFIG.to,
        replyTo: formData.email,
        subject: formData.subject || `New ${CONFIG.name} Form Submission`,
        html: emailContent
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`Email sent for ${CONFIG.name}:`, result.id);
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully',
        id: result.id 
      });
    } else {
      console.error('Resend API error:', result);
      throw new Error(result.message || 'Email send failed');
    }

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
}

function formatEmailHTML(formData, config) {
  const timestamp = formData.timestamp || new Date().toISOString();
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
        New ${config.name} Form Submission
      </h2>
      
      <p style="color: #666; font-size: 14px;">
        <strong>Submitted:</strong> ${new Date(timestamp).toLocaleString()}
      </p>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        ${Object.entries(formData)
          .filter(([key]) => !['timestamp', 'subject'].includes(key))
          .map(([key, value]) => {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
            
            return `
              <div style="margin-bottom: 15px;">
                <strong style="color: #333; display: inline-block; min-width: 120px;">
                  ${label}:
                </strong>
                <span style="color: #666; white-space: pre-wrap;">${displayValue}</span>
              </div>
            `;
          })
          .join('')}
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
        This email was sent from your website contact form.
      </p>
    </div>
  `;
} 