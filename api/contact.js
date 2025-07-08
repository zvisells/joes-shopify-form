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
    console.log('=== REQUEST DEBUG ===');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body type:', typeof req.body);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'undefined');
    console.log('===================');
    
    // Parse form data - FormData sends as multipart/form-data
    let formData = {};
    
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
    
    // Adjust FormData parsing to be more robust
    if (typeof req.body === 'object' && req.body !== null) {
      formData = req.body;
      console.log('Using parsed object:', formData);
    } else if (typeof req.body === 'string') {
      console.log('Parsing string body:', req.body);
      const pairs = req.body.split('&');
      formData = {};
      
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          const decodedKey = decodeURIComponent(key);
          const decodedValue = decodeURIComponent(value);
          
          if (decodedKey.startsWith('contact[') && decodedKey.endsWith(']')) {
            const fieldName = decodedKey.slice(8, -1);
            formData.contact = formData.contact || {};
            formData.contact[fieldName] = decodedValue;
          } else {
            formData[decodedKey] = decodedValue;
          }
        }
      }
      console.log('Parsed form data:', formData);
    } else {
      return res.status(400).json({ 
        error: 'Invalid body format',
        bodyType: typeof req.body,
        body: req.body
      });
    }

    console.log('Parsed formData:', formData);

    // Ensure contact exists - handle cases where contact isn't defined
    const contact = formData.contact || (typeof formData === 'object' ? formData : {});
    
    console.log('=== CONTACT DATA DEBUG ===');
    console.log('formData:', JSON.stringify(formData, null, 2));
    console.log('Extracted contact data:', JSON.stringify(contact, null, 2));
    console.log('All contact fields:', Object.keys(contact));
    console.log('Contact object keys:', contact ? Object.keys(contact) : 'undefined');
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
        availableFields: Object.keys(contact),
        contactData: contact
      });
    }
    
    // Add email to contact object for consistency
    contact.email = email;

    // Prepare email content
    const emailContent = formatEmailHTML(contact, CONFIG);
    
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
        replyTo: contact.email,
        subject: contact.subject || `New ${CONFIG.name} Form Submission`,
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

function formatEmailHTML(contact, config) {
  const timestamp = contact.timestamp || new Date().toISOString();
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
        New ${config.name} Form Submission
      </h2>
      
      <p style="color: #666; font-size: 14px;">
        <strong>Submitted:</strong> ${new Date(timestamp).toLocaleString()}
      </p>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        ${Object.entries(contact)
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