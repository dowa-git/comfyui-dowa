# DOWA Navigation Widget for ComfyUI

Professional navigation bar widget for ComfyUI with user authentication, workflow templates, and team collaboration features.

## Features

- **User Authentication**: JWT-based login system with secure token management
- **Navigation Bar**: Fixed top navigation bar with professional purple gradient design
- **User Menu**: Avatar, profile, settings, and logout functionality
- **Templates**: Quick access to workflow templates (coming soon)
- **Shared Workflows**: Team collaboration and workflow sharing (coming soon)
- **Responsive Design**: Mobile-friendly with adaptive layout

## Installation

### Method 1: Git Clone (Recommended)

```bash
cd /path/to/ComfyUI/custom_nodes
git clone https://github.com/dowa-git/comfyui-dowa.git
```

### Method 2: Manual Download

1. Download this repository as ZIP
2. Extract to `ComfyUI/custom_nodes/comfyui-dowa/`
3. Restart ComfyUI

## Requirements

- ComfyUI (latest version)
- API Gateway with authentication endpoints (required for login functionality)

### Gateway API Endpoints

The widget requires a compatible API gateway providing these endpoints:

```
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
POST   /api/auth/refresh         # Token refresh
GET    /api/navigation/user/me   # Get current user info
GET    /api/navigation/templates # List templates
GET    /api/navigation/shared    # List shared workflows
GET    /api/navigation/settings  # Get user settings
```

See the [API Documentation](docs/API.md) for detailed endpoint specifications.

## Usage

### Basic Usage

1. Add the "DOWA Navigation Bar" node to your workflow
2. The navigation bar will automatically appear at the top of the ComfyUI interface
3. Click "Login" to authenticate with your credentials
4. Access features through the navigation menu

### Node Configuration

The navigation node is designed to be invisible on the canvas:
- Size: `[0, 0]` (hidden)
- Always collapsed
- No visible inputs or outputs
- UI-only functionality

### Authentication Flow

```javascript
// Login
1. Click "Login" button in navigation bar
2. Enter username and password
3. Widget stores JWT token in localStorage
4. Navigation bar updates to show user menu

// Auto-refresh
- Tokens automatically refresh on 401 responses
- If refresh fails, user is prompted to login again

// Logout
- Click user avatar → "Logout"
- Clears all tokens and user data from localStorage
```

## Architecture

```
┌─────────────────────────────────────────────┐
│         DOWA Navigation Bar (Fixed)         │
│  [Logo]  [Templates] [Shared]  [User Menu]  │
└─────────────────────────────────────────────┘
                     │
                     ▼
        ┌───────────────────────┐
        │   API Gateway (8000)  │
        │  - Authentication     │
        │  - Navigation API     │
        │  - Workflow Proxy     │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  ComfyUI Backend      │
        │  - Workflow Execution │
        │  - Model Loading      │
        └───────────────────────┘
```

## File Structure

```
comfyui-dowa/
├── __init__.py                     # Node registration
├── navigation_node.py              # Python backend node
├── js/
│   ├── navigation_widget.js        # Main widget implementation
│   ├── auth_manager.js             # JWT authentication manager
│   ├── api_client.js               # API communication client
│   └── components/
│       └── login_dialog.js         # Login modal dialog
├── styles/
│   └── navigation.css              # Complete widget styling
├── README.md                       # This file
└── package.json                    # Node package metadata
```

## Customization

### Changing Colors

Edit `styles/navigation.css`:

```css
/* Navigation bar gradient */
.dowa-nav-bar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* User avatar gradient */
.dowa-user-avatar {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
```

### Changing Logo

Edit `js/navigation_widget.js` in the `createNavigationBar()` method:

```javascript
<div class="dowa-nav-logo">
    <svg class="dowa-logo-icon" width="24" height="24" viewBox="0 0 24 24">
        <!-- Your custom SVG here -->
    </svg>
    <span>Your Brand</span>
</div>
```

### Adding Custom Menu Items

In `js/navigation_widget.js`, modify the `buildAuthenticatedMenu()` method:

```javascript
buildAuthenticatedMenu() {
    return `
        <div class="dowa-nav-menu">
            <button class="dowa-nav-btn" data-action="custom-action">
                <svg>...</svg>
                <span>Custom Item</span>
            </button>
        </div>
    `;
}
```

Then add the handler in `setupEventListeners()`:

```javascript
case 'custom-action':
    this.handleCustomAction();
    break;
```

## API Integration

### Setting Custom Base URL

If your API gateway is on a different port or domain:

```javascript
// In js/api_client.js
constructor(baseURL = '/api/navigation') {
    this.baseURL = baseURL; // Change this to your gateway URL
}
```

### Custom Headers

Add custom headers in `js/api_client.js`:

```javascript
async request(endpoint, options = {}) {
    options.headers = {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'value',
        ...options.headers
    };
    // ...
}
```

## Development

### Local Development

```bash
# Watch for changes
cd /path/to/ComfyUI/custom_nodes/comfyui-dowa
npm run watch  # If using build tools

# Or simply edit files - ComfyUI will reload on browser refresh
```

### Testing

```bash
# Start ComfyUI in development mode
cd /path/to/ComfyUI
python main.py --listen --port 8188

# Open browser
open http://localhost:8188
```

### Debugging

Open browser console (F12) and look for:
```
🚀 Initializing DOWA Navigation Widget...
✅ DOWA Navigation Widget initialized
✅ User authenticated: username
```

Enable verbose logging in `js/navigation_widget.js`:

```javascript
async init() {
    console.log('[DOWA] Starting initialization...');
    await this.checkAuthStatus();
    console.log('[DOWA] Auth status:', this.isAuthenticated);
    // ...
}
```

## Troubleshooting

### Navigation bar not showing

1. Check browser console for errors
2. Verify the node is in the workflow (even though invisible)
3. Check that JavaScript files are loading: Network tab → `navigation_widget.js`

### Login not working

1. Verify API gateway is running and accessible
2. Check CORS settings on the gateway
3. Verify `/api/auth/login` endpoint exists
4. Check browser console for network errors

### Styles not applying

1. Clear browser cache (Ctrl+Shift+R)
2. Verify `styles/navigation.css` is loading
3. Check for CSS conflicts with ComfyUI styles

### Token refresh failing

1. Check that `/api/auth/refresh` endpoint is implemented
2. Verify refresh token is being stored in localStorage
3. Check token expiration times match frontend/backend

## Security Considerations

- **JWT Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
- **HTTPS Required**: Always use HTTPS in production to protect credentials
- **Token Expiration**: Implement reasonable token expiration times (15min access, 7day refresh)
- **CORS Configuration**: Properly configure CORS on the API gateway
- **XSS Protection**: User inputs are sanitized before rendering

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

This is a private project. For issues or feature requests, contact the development team.

## License

Proprietary - All rights reserved

## Credits

- **ComfyUI**: https://github.com/comfyanonymous/ComfyUI
- **Design**: Inspired by modern web application navigation patterns
- **Icons**: Inline SVG icons

## Changelog

### v1.0.0 (2025-11-17)
- Initial release
- JWT authentication system
- Navigation bar with user menu
- Login/logout functionality
- Template and shared workflow placeholders
- Responsive design
- Auto token refresh

## Support

For support and questions, contact the DOWA development team.

## Future Features

- [ ] Template management panel
- [ ] Settings dialog
- [ ] Shared workflows browser
- [ ] User profile management
- [ ] Team collaboration features
- [ ] Notification system
- [ ] Search functionality
- [ ] Keyboard shortcuts
