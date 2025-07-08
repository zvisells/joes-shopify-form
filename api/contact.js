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

    // Ensure contact exists - handle cases where contact isn't defined
    const contact = jsonData.contact || (typeof jsonData === 'object' ? jsonData : {});
    
    console.log('=== CONTACT DATA DEBUG ===');
    console.log('jsonData:', JSON.stringify(jsonData, null, 2));
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
      console.log(`✅ EMAIL SENT SUCCESSFULLY for ${CONFIG.name}:`, result.id);
      console.log('=== SUCCESS RESPONSE ===');
      console.log('Email ID:', result.id);
      console.log('Timestamp:', new Date().toISOString());
      console.log('=======================');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully',
        id: result.id,
        timestamp: new Date().toISOString()
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
            
            // Handle product data specially
            if (typeof value === 'string' && value.startsWith('{') && value.includes('product_id')) {
              try {
                const productData = JSON.parse(value);
                return `
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #333; display: inline-block; min-width: 120px;">
                      ${label}:
                    </strong>
                    <div style="color: #666; margin-left: 120px; margin-top: 5px;">
                      <div style="background: #fff; padding: 10px; border-radius: 3px; border-left: 3px solid #007cba;">
                        <strong>${productData.product_name}</strong><br>
                        <span style="color: #666;">Variant: ${productData.variant_name}</span><br>
                        <span style="color: #666; font-family: monospace;">SKU: ${productData.sku}</span><br>
                        ${productData.price && productData.price !== '0' ? `<span style="color: #007cba; font-weight: bold;">Price: $${(productData.price/100).toFixed(2)}</span><br>` : ''}
                        <span style="color: #999; font-size: 12px;">Product ID: ${productData.product_id} | Variant ID: ${productData.variant_id}</span>
                      </div>
                    </div>
                  </div>
                `;
              } catch (e) {
                // If parsing fails, fall back to regular display
                return `
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #333; display: inline-block; min-width: 120px;">
                      ${label}:
                    </strong>
                    <span style="color: #666; white-space: pre-wrap;">${value}</span>
                  </div>
                `;
              }
            } else {
              // Regular field display
              const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
              
              return `
                <div style="margin-bottom: 15px;">
                  <strong style="color: #333; display: inline-block; min-width: 120px;">
                    ${label}:
                  </strong>
                  <span style="color: #666; white-space: pre-wrap;">${displayValue}</span>
                </div>
              `;
            }
          })
          .join('')}
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
        This email was sent from your website contact form.
      </p>
    </div>
  `;
} 