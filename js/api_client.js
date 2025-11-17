/**
 * API Client for DOWA Navigation Widget
 * Handles all communication with the Gateway API
 */

export class APIClient {
    constructor(baseURL = '/api/navigation') {
        this.baseURL = baseURL;
        this.authManager = null;
    }

    setAuthManager(authManager) {
        this.authManager = authManager;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Add auth token if available
        const token = this.authManager?.getToken();
        if (token) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            };
        }

        // Add default headers
        options.headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, options);

            // Handle 401 - try to refresh token
            if (response.status === 401 && this.authManager) {
                const refreshed = await this.authManager.refreshToken();
                if (refreshed) {
                    // Retry request with new token
                    return this.request(endpoint, options);
                }
                // Token refresh failed - user needs to login again
                this.authManager.clearToken();
                window.dowaNavigationWidget?.showLoginRequired();
            }

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
