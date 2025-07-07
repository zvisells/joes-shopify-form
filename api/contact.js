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
    // Parse form data - FormData sends as multipart/form-data
    let formData = {};
    
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw request body:', req.body);
    
    // FormData from fetch() sends as multipart/form-data
    // Vercel should parse this automatically, but let's handle it manually
    if (req.body && typeof req.body === 'object') {
      // Vercel might have already parsed it
      formData = req.body;
    } else if (req.body && typeof req.body === 'string') {
      // Parse manually if it's a string
      const pairs = req.body.split('&');
      
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          // Decode URL-encoded values
          const decodedKey = decodeURIComponent(key);
          const decodedValue = decodeURIComponent(value);
          
          // Handle nested contact[field] format
          if (decodedKey.startsWith('contact[') && decodedKey.endsWith(']')) {
            const fieldName = decodedKey.slice(8, -1); // Remove 'contact[' and ']'
            if (!formData.contact) formData.contact = {};
            formData.contact[fieldName] = decodedValue;
          } else {
            formData[decodedKey] = decodedValue;
          }
        }
      }
    }

    console.log('Parsed formData:', formData);

    // Extract contact data
    const contact = formData.contact || formData;
    
    console.log('Extracted contact data:', contact);
    console.log('All contact fields:', Object.keys(contact));
    
    // Find email field - check multiple possible names
    let email = contact.email;
    if (!email) {
      // Check for other possible email field names
      const emailFields = Object.keys(contact).filter(key => 
        key.toLowerCase().includes('email') || 
        key.toLowerCase().includes('e-mail')
      );
      if (emailFields.length > 0) {
        email = contact[emailFields[0]];
        console.log('Found email in field:', emailFields[0], email);
      }
    }
    
    console.log('Final email value:', email);
    
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