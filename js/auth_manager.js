/**
 * Authentication Manager for DOWA Navigation Widget
 * Handles JWT tokens and authentication state
 */

export class AuthManager {
    constructor() {
        this.tokenKey = 'dowa_auth_token';
        this.refreshKey = 'dowa_refresh_token';
        this.userKey = 'dowa_current_user';
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    getRefreshToken() {
        return localStorage.getItem(this.refreshKey);
    }

    setRefreshToken(token) {
        localStorage.setItem(this.refreshKey, token);
    }

    getCurrentUser() {
        const userJson = localStorage.getItem(this.userKey);
        return userJson ? JSON.parse(userJson) : null;
    }

    setCurrentUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    clearToken() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshKey);
        localStorage.removeItem(this.userKey);
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return false;

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.setToken(data.access_token);
                if (data.refresh_token) {
                    this.setRefreshToken(data.refresh_token);
                }
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        return false;
    }

    async login(username, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.setToken(data.access_token);
                if (data.refresh_token) {
                    this.setRefreshToken(data.refresh_token);
                }
                this.setCurrentUser(data.user);
                return { success: true, user: data.user };
            } else {
                const error = await response.json();
                return { success: false, error: error.detail || 'Login failed' };
            }
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            this.clearToken();
        }
    }
}
