# Mayna Sound - Authentication System

This is a Capacitor mobile application with a complete authentication system that follows the existing design patterns.

## Features

### Authentication Flow
1. **Phone Number Check** - User enters phone number to check if account exists
2. **Login** - Existing users can login with password
3. **Registration** - New users can create account with verification code
4. **Token Management** - Automatic token refresh and secure storage

### API Integration
- Uses the SeekTir API endpoints
- Handles authentication tokens (JWT)
- Automatic token refresh on expiration
- Error handling and user feedback

## Files Structure

```
www/
├── index.html          # Main account settings page (requires authentication)
├── auth.html           # Authentication page (login/register)
├── js/
│   └── api-service.js  # Reusable API service module
└── README.md          # This documentation
```

## API Endpoints Used

### Authentication
- `POST /v2/user` - Check if user exists
- `POST /v2/login` - User login
- `POST /v2/send-code` - Send verification code
- `POST /v2/register` - User registration

### User Profile (Future)
- `GET /v2/user/profile` - Get user profile
- `PUT /v2/user/profile` - Update user profile
- `POST /v2/user/change-password` - Change password

## Usage

### Starting the App
1. Open `auth.html` in a web browser
2. Enter your phone number
3. Follow the authentication flow based on whether you're a new or existing user

### Authentication Flow

#### For Existing Users:
1. Enter phone number → Check user exists
2. Enter password → Login
3. Redirected to main app

#### For New Users:
1. Enter phone number → Check user doesn't exist
2. Create password → Send verification code
3. Enter verification code → Complete registration
4. Redirected to main app

### Token Management
- Access tokens are automatically stored in localStorage
- Tokens are automatically refreshed when expired
- Logout clears all tokens and redirects to auth page

## Styling

The authentication system uses the same design patterns as the existing account settings page:
- Consistent color scheme (#007bff primary, #f4f7f6 background)
- Same form styling and button designs
- Responsive layout with max-width container
- Loading states and error/success messages
- Font Awesome icons for visual elements

## Security Features

- JWT token-based authentication
- Automatic token refresh
- Secure token storage in localStorage
- Input validation and sanitization
- Error handling for failed API calls

## Development

### Adding New API Calls
Use the `ApiService` class in `js/api-service.js`:

```javascript
const apiService = new ApiService();

// Make authenticated API calls
const result = await apiService.makeRequest('/your-endpoint', data);
```

### Authentication Check
Add to any page that requires authentication:

```javascript
function checkAuthentication() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        window.location.href = 'auth.html';
    }
}
```

## Testing

### Quick Start (Recommended)
1. Install dependencies: `npm install`
2. Start local server: `npm start`
3. Open: `http://localhost:3000`
4. Test with these phone numbers:
   - `09393070813` - Existing user (for login testing)
   - `09120906471` - New user (for registration testing)

### Troubleshooting "Failed to fetch" Error

The "Failed to fetch" error is caused by CORS (Cross-Origin Resource Sharing) restrictions when making requests from a local HTML file to an external API. Here are the solutions:

#### Option 1: Use CORS Browser Extension (Easiest)
1. Install "CORS Unblock" or "Allow CORS: Access-Control-Allow-Origin" extension
2. Enable the extension and refresh your page
3. Test your authentication flow

#### Option 2: Disable CORS in Chrome (Development Only)
1. Run `start-chrome-no-cors.bat` (Windows) or use this command:
   ```bash
   chrome --disable-web-security --user-data-dir="/tmp/chrome_dev"
   ```
2. Open your HTML files in this Chrome instance

#### Option 3: Test API Directly
Open `test-direct-api.html` to test the API endpoints and verify connectivity.

#### Option 4: Use Local Server (Alternative)
```bash
npm install
npm start
```
Then open `http://localhost:3000`

### Debug Information
- Open browser console (F12) to see detailed API request logs
- Check the network tab for failed requests
- Use the test page to verify API connectivity

## Future Enhancements

- User profile management
- Password reset functionality
- Social media login
- Biometric authentication
- Offline support
- Push notifications
