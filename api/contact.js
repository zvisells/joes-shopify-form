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
    console.log('=== REQUEST DEBUG v2 ===');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body type:', typeof req.body);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'undefined');
    console.log('===================');
    
    // Parse JSON data
    let jsonData = {};
    
    // Validate req.body early to avoid accessing undefined properties
    if (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) {
      console.error('Empty or invalid request body');
      return res.status(400).json({ 
        error: 'Empty or invalid request body',
        debug: { 
          body: req.body, 
          contentType: req.headers['content-type'],
          bodyType: typeof req.body
        }
      });
    }
    
    // Handle JSON data
    if (typeof req.body === 'object' && req.body !== null) {
      jsonData = req.body;
      console.log('Using parsed JSON object:', jsonData);
    } else if (typeof req.body === 'string') {
      try {
        jsonData = JSON.parse(req.body);
        console.log('Parsed JSON from string:', jsonData);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        return res.status(400).json({ 
          error: 'Invalid JSON format',
          bodyType: typeof req.body,
          body: req.body
        });
      }
    } else {
      return res.status(400).json({ 
        error: 'Invalid body format',
        bodyType: typeof req.body,
        body: req.body
      });
    }

    console.log('Parsed jsonData:', jsonData);

    // Ensure data exists - handle cases where data isn't defined
    const formData = jsonData.data || (typeof jsonData === 'object' ? jsonData : {});
    
    console.log('=== FORM DATA DEBUG ===');
    console.log('jsonData:', JSON.stringify(jsonData, null, 2));
    console.log('Extracted form data:', JSON.stringify(formData, null, 2));
    console.log('All form fields:', Object.keys(formData));
    console.log('Form data object keys:', formData ? Object.keys(formData) : 'undefined');
    console.log('========================');
    
    // TEMPORARILY HARDCODE EMAIL FOR TESTING
    let email = 'zvisells@gmail.com';
    console.log('=== EMAIL SEARCH DEBUG ===');
    console.log('HARDCODED EMAIL FOR TESTING:', email);
    console.log('========================');
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required',
        availableFields: Object.keys(formData),
        formData: formData
      });
    }
    
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