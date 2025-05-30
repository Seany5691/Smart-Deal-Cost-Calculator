# Smart Deal Cost Calculator

A comprehensive web application for calculating and managing deal costs, including hardware, connectivity, licensing, and settlement calculations. This application features a modern UI with a tabbed interface and supports PDF generation for quotes and proposals.

## Features

- **Deal Details Management**: Configure customer information, installation details, term, and escalation
- **Hardware Selection**: Choose from a list of hardware items with customizable quantities
- **Connectivity Options**: Select from various connectivity solutions
- **Licensing Management**: Add licensing options to your deal
- **Settlement Calculator**: Calculate settlement amounts based on dates, rental amounts, and escalation
- **Total Cost Summary**: View a comprehensive breakdown of all costs
- **PDF Generation**: Generate detailed PDF reports, proposals, and deal packs
- **Admin Panel**: Manage users and configure items and pricing
- **Offline Support**: Use the application even when offline
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

### Frontend
- React 18 with TypeScript
- Chakra UI for the user interface
- Zustand for state management
- React Router for navigation
- React Hook Form for form handling
- jsPDF and PDF-lib for PDF generation
- Service Worker for offline support

### Backend
- Node.js with Express
- JWT for authentication
- RESTful API endpoints
- File-based storage (config.json and users.json)

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. For production build:
   ```
   npm run build
   ```

## PDF Templates

The application uses two PDF templates for generating documents:
- `SI Proposal Form.pdf`: Template for generating proposals
- `Deal Pack.pdf`: Template for generating deal packs

To replace these templates:
1. Create your PDF with form fields using the same field names as in the existing templates
2. Save the new PDF in the `client/public/` directory with the same filename

## Default Login Credentials

- Admin User:
  - Username: admin
  - Password: admin123

- Regular User:
  - Username: user
  - Password: user123

## Offline Support

The application works offline and will sync changes when back online. When offline:
- All calculator functions work normally
- Changes to admin settings are stored locally
- PDF generation works (except for custom templates)

## Customization

### Adding New Hardware/Connectivity/Licensing Items
1. Log in as an admin
2. Navigate to the Admin Panel
3. Select the appropriate tab (Hardware, Connectivity, or Licensing)
4. Click "Add Item" and fill in the details

### Modifying Scales and Costs
1. Log in as an admin
2. Navigate to the Admin Panel
3. Select the "Scales & Costs" tab
4. Modify the values and click "Save All Changes"

## Troubleshooting

### PDF Generation Issues
- Ensure the PDF templates are available in the `client/public/` directory
- Check that all required fields are filled in before generating PDFs

### Offline Mode Problems
- Check if the application is registered as a PWA
- Clear browser cache and reload if issues persist

### Login Problems
- Verify the server is running
- Check the credentials in `server/config/users.json`

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
