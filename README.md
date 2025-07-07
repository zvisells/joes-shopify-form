# Custom Shopify Form Section

A comprehensive, customizable form section for Shopify Dawn theme with advanced field types, responsive design, and cart integration.

## Features

### ✅ Field Types
- **Text Fields** - Standard text input
- **Email Fields** - Email validation built-in
- **Textarea** - Multi-line text input with configurable rows
- **Dropdown** - Select from comma-separated options
- **Multi-Checkbox** - Multiple selections from comma-separated options
- **Boolean Checkbox** - Single checkbox for agreements/confirmations
- **Product Search** - Search and select products with variants

### ✅ Advanced Features
- **Responsive Field Widths** - Set field width by percentage (25%, 50%, 75%, 100%)
- **Auto-wrapping** - Fields wrap based on container width and field percentages
- **Product Search** - Real-time search with autocomplete and variant selection
- **Timestamp** - Automatically adds submission timestamp
- **Required Field Validation** - Client-side and server-side validation
- **Custom Recipients** - Set specific email recipients
- **Custom Subject Lines** - Configure email subject lines
- **Success/Error Messages** - Customizable user feedback

### ✅ Design
- **Dawn Theme Integration** - Uses Dawn's color scheme and design tokens
- **CSS Custom Properties** - Uses root variables like `rgba(var(--color-background))`
- **Responsive Design** - Mobile-first approach with breakpoints
- **Accessible** - Proper labels, fieldsets, and ARIA attributes

## Installation

1. Copy the `sections/custom-form.liquid` file to your Dawn theme's `sections/` directory
2. In your Shopify admin, go to **Online Store > Themes > Customize**
3. Add the "Custom Form" section to any template
4. Configure the fields and settings as needed

## Configuration

### Section Settings
- **Heading** - Form title
- **Description** - Form description (rich text)
- **Recipient Email** - Where submissions are sent (defaults to store email)
- **Subject Line** - Email subject for submissions
- **Submit Button Text** - Customize button text
- **Success/Error Messages** - User feedback messages
- **Color Scheme** - Match your theme colors
- **Padding** - Section spacing

### Field Settings
Each field type has these common settings:
- **Label** - Field display name
- **Field Name** - Internal name for form data
- **Required** - Make field mandatory
- **Field Width** - Percentage width (25%, 50%, 75%, 100%)

### Field-Specific Settings
- **Dropdown/Multi-Checkbox**: Comma-separated options
- **Textarea**: Number of rows
- **Email**: Auto-validation
- **Product Search**: Real-time search with variant selection

## Email Storage & Handling

### Shopify Native (Current Setup)
This form uses **Shopify's native contact form system** which:
- ✅ **Sends emails immediately** to your specified recipient
- ✅ **Zero setup required** - works out of the box
- ✅ **No monthly costs** - completely free
- ✅ **No vendor lock-in** - stays within Shopify ecosystem
- ❌ **Does NOT store submissions** - no email history in admin
- ❌ **No file upload support** - removed for compatibility

### Alternative Solutions (If Needed Later)

#### Option 1: Resend
- **Pros**: Stores emails, delivery analytics, file uploads
- **Cons**: External service, monthly cost, vendor dependency
- **When to use**: If you need submission history or file uploads

#### Option 2: Shopify Apps
- **Pros**: Built for Shopify, easy setup
- **Cons**: Monthly subscription, limited customization
- **When to use**: If you want simple email storage without custom development

### Current Implementation
The form submits to Shopify's `/contact` endpoint and:
- Sends emails to the recipient you specify
- Includes timestamp and selected product details
- Handles all field types including product search
- Provides immediate email delivery without storage

## Usage Examples

### Basic Contact Form
```liquid
<!-- Add blocks in theme editor -->
- Text Field: "Full Name" (50% width, required)
- Email Field: "Email" (50% width, required)  
- Textarea: "Message" (100% width, required)
- Boolean: "Subscribe to newsletter" (100% width)
```

### Product Inquiry Form
```liquid
<!-- Add blocks in theme editor -->
- Text Field: "Name" (50% width, required)
- Email Field: "Email" (50% width, required)
- Dropdown: "Product Interest" (50% width, required)
  Options: "Product A, Product B, Product C"
- Multi-Checkbox: "Features of Interest" (50% width)
  Options: "Feature 1, Feature 2, Feature 3"
- Textarea: "Additional Details" (100% width)
```

### Custom Curtain Order Form
```liquid
<!-- Perfect for fabric stores -->
- Text Field: "Customer Name" (50% width, required)
- Email Field: "Email" (50% width, required)
- Product Search: "Fabric Selection" (100% width, required)
- Dropdown: "Curtain Type" (50% width, required)
  Options: "Panels, Valances, Cafe Curtains, Roman Shades"
- Text Field: "Window Width (inches)" (25% width, required)
- Text Field: "Window Height (inches)" (25% width, required)
- Dropdown: "Fullness" (25% width, required)
  Options: "1.5x, 2x, 2.5x, 3x"
- Multi-Checkbox: "Features" (25% width)
  Options: "Blackout Lining, Thermal Lining, Grommets, Rod Pocket"
- Textarea: "Special Instructions" (100% width)
```

## Technical Details

### Field Width Logic
Fields use CSS flexbox with percentage widths:
- Container: `display: flex; flex-wrap: wrap;`
- Fields: `width: X%; min-width: 250px;`
- Mobile: All fields become 100% width

### Product Search Integration
The JavaScript uses Shopify's search API to find products and variants:
```json
{
  "product_id": "123456789",
  "variant_id": "987654321", 
  "product_title": "Velvet Curtain Fabric",
  "variant_title": "Navy Blue / 54 inch width"
}
```

**Search Process:**
1. User types in search field (minimum 2 characters)
2. Calls `/search/suggest.json?q={query}&resources[type]=product`
3. Displays products with all available variants
4. User selects specific variant
5. Stores product + variant data in hidden field

### Checkbox Arrays
Multi-checkbox fields are automatically converted to comma-separated values:
- Input: `["Option 1", "Option 3"]`
- Output: `"Option 1, Option 3"`



## Browser Support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Customization

### CSS Variables Used
```css
--color-foreground
--color-background
--color-accent
--color-success
--color-error
--border-radius
```

### Adding Custom Field Types
1. Add new case in Liquid template
2. Add corresponding block type in schema
3. Update JavaScript validation if needed

## Troubleshooting

### Form Not Submitting
- Check required fields are filled
- Verify recipient email is set
- Check browser console for errors

### Styling Issues
- Ensure Dawn theme CSS variables are available
- Check for conflicting CSS rules
- Verify field width percentages add up correctly



## Support

For issues or questions:
1. Check browser console for JavaScript errors
2. Verify all required fields are configured
3. Test with Dawn theme's default settings
4. Check Shopify's contact form documentation

## License

This form section is designed for use with Shopify Dawn theme. Modify as needed for your specific requirements. 