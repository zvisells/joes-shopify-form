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
  let htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 5px;">
      <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
        New ${config.name} Form Submission
      </h2>
      <p style="color: #666; font-size: 14px;">
        <strong>Submitted:</strong> ${new Date(timestamp).toLocaleString()}
      </p>

      <h3 style="color: #333; border-top: 2px solid #eee; padding-top: 20px; margin-top: 20px;">Customer Details</h3>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
        ${Object.entries(contact)
          .filter(([key]) => !['timestamp', 'subject', 'items'].includes(key)) // Filter out items array here
          .map(([key, value]) => `<p style="margin: 5px 0;"><strong>${key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}:</strong> ${value}</p>`)
          .join('')
        }
      </div>
      
      <h3 style="color: #333; border-top: 2px solid #eee; padding-top: 20px; margin-top: 20px;">Quote Items</h3>
  `;

  if (contact.items && contact.items.length > 0) {
    htmlBody += `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;" border="1">
        <thead style="background-color: #f2f2f2;">
          <tr>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Dimensions</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Fabric</th>
          </tr>
        </thead>
        <tbody>
    `;

    contact.items.forEach(item => {
      const fabricData = item.fabric && typeof item.fabric === 'string' && item.fabric.startsWith('{') 
        ? JSON.parse(item.fabric) 
        : { product_name: 'N/A', variant_name: '', sku: '', image: '' };
      
      htmlBody += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title || 'N/A'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.width || '?'} in. W x ${item.height || '?'} in. H</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td style="width: 60px; padding-right: 10px; vertical-align: top;">
                  <img src="${fabricData.image}" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </td>
                <td style="vertical-align: top;">
                  <strong>${fabricData.product_name}</strong><br>
                  <small style="color: #555;">${fabricData.variant_name} (SKU: ${fabricData.sku})</small>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    });

    htmlBody += `
        </tbody>
      </table>
    `;
  } else {
    htmlBody += "<p>No line items were submitted.</p>";
  }

  htmlBody += `
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
        This email was sent from your website contact form.
      </p>
    </div>
  `;

  return htmlBody;
} 