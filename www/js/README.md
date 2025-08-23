# JavaScript Files Structure

This directory contains the separated JavaScript functionality for the Sonic AI application.

## Files Overview

### 1. `token-manager.js`
- **Purpose**: Handles authentication token management
- **Features**:
  - Token storage and retrieval
  - Automatic token refresh
  - Authentication state management
  - Redirect logic for authenticated/unauthenticated users

### 2. `model-service.js`
- **Purpose**: Handles all API calls related to voice models
- **Features**:
  - Uses token manager for authentication
  - API endpoints for free models, shop models, and user orders
  - Error handling and logging
  - No mock data - only real API calls

### 3. `model-ui-controller.js`
- **Purpose**: Manages all UI interactions and DOM manipulation
- **Features**:
  - Event listeners for all UI elements
  - Model card creation and rendering
  - Search and filtering functionality
  - Tab switching logic
  - Model selection handling

### 4. `app-init.js`
- **Purpose**: Application initialization and global setup
- **Features**:
  - Global app configuration
  - Common utilities
  - App-wide event handling

## How They Work Together

1. **HTML loads scripts in order**:
   - `token-manager.js` - Sets up authentication
   - `app-init.js` - Initializes app
   - `model-service.js` - Sets up API service
   - `model-ui-controller.js` - Initializes UI and functionality

2. **Authentication Flow**:
   - Token manager checks if user is authenticated
   - If not authenticated, redirects to auth page
   - If authenticated, UI controller initializes

3. **API Calls**:
   - UI controller uses model service for all API calls
   - Model service uses token manager for authentication
   - All requests include proper authorization headers

4. **Error Handling**:
   - Service layer handles API errors
   - UI controller shows appropriate error messages
   - Token manager handles authentication errors

## Benefits of This Structure

- **Separation of Concerns**: Each file has a specific responsibility
- **Maintainability**: Easier to debug and modify specific functionality
- **Reusability**: Services can be used by other parts of the application
- **Testability**: Each component can be tested independently
- **No Mock Data**: All functionality uses real API endpoints
- **Proper Authentication**: Uses token manager for all authenticated requests

## Usage

The HTML file simply includes these scripts in the correct order, and the application automatically initializes when the DOM is loaded. No additional setup is required.
