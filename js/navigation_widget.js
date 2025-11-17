/**
 * DOWA Navigation Widget
 * Main navigation bar component for ComfyUI
 */

import { app } from '../../../scripts/app.js';
import { api } from '../../../scripts/api.js';
import { AuthManager } from './auth_manager.js';
import { APIClient } from './api_client.js';
import { LoginDialog } from './components/login_dialog.js';

class DowaNavigationWidget {
    constructor() {
        this.authManager = new AuthManager();
        this.apiClient = new APIClient();
        this.apiClient.setAuthManager(this.authManager);

        this.currentUser = null;
        this.isAuthenticated = false;
        this.navBar = null;

        this.init();
    }

    async init() {
        // Load CSS styles
        this.loadStyles();

        // Check if user is already authenticated
        await this.checkAuthStatus();

        // Create navigation bar UI
        this.createNavigationBar();

        // Set up event listeners
        this.setupEventListeners();

        // Register as global for other components to access
        window.dowaNavigationWidget = this;

        console.log('✅ DOWA Navigation Widget initialized');
    }

    loadStyles() {
        // Load navigation CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '/extensions/comfyui-dowa/navigation.css';
        document.head.appendChild(link);
    }

    async checkAuthStatus() {
        if (this.authManager.isAuthenticated()) {
            try {
                const response = await this.apiClient.get('/user/me');
                if (response.ok) {
                    this.currentUser = await response.json();
                    this.isAuthenticated = true;
                    this.authManager.setCurrentUser(this.currentUser);
                    console.log('✅ User authenticated:', this.currentUser.username);
                } else {
                    // Token invalid
                    this.authManager.clearToken();
                    this.isAuthenticated = false;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                this.isAuthenticated = false;
            }
        } else {
            this.isAuthenticated = false;
        }
    }

    createNavigationBar() {
        // Remove existing nav bar if present
        if (this.navBar) {
            this.navBar.remove();
        }

        // Create navigation container
        const navBar = document.createElement('div');
        navBar.id = 'dowa-navigation-bar';
        navBar.className = 'dowa-nav-bar';

        navBar.innerHTML = `
            <div class="dowa-nav-left">
                <div class="dowa-nav-logo">
                    <svg class="dowa-logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.8"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>DOWA</span>
                </div>
                ${this.isAuthenticated ? this.buildAuthenticatedMenu() : ''}
            </div>
            <div class="dowa-nav-right">
                ${this.isAuthenticated ? this.buildUserMenu() : this.buildLoginButton()}
            </div>
        `;

        // Insert at top of ComfyUI
        const bodyCanvas = document.querySelector('body-canvas') || document.body;
        bodyCanvas.insertBefore(navBar, bodyCanvas.firstChild);

        // Adjust ComfyUI canvas position
        this.adjustCanvasPosition();

        this.navBar = navBar;
    }

    buildAuthenticatedMenu() {
        return `
            <div class="dowa-nav-menu">
                <button class="dowa-nav-btn" data-action="templates" title="Workflow Templates">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 2h5v5H2V2zm0 7h5v5H2V9zm7-7h5v5H9V2zm0 7h5v5H9V9z"/>
                    </svg>
                    <span>Templates</span>
                </button>
                <button class="dowa-nav-btn" data-action="shared" title="Shared Workflows">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm-9 8c0-2.21 3.58-4 8-4s8 1.79 8 4H2z"/>
                    </svg>
                    <span>Shared</span>
                </button>
            </div>
        `;
    }

    buildUserMenu() {
        const user = this.currentUser;
        const initials = user.display_name
            ? user.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : user.username[0].toUpperCase();

        return `
            <div class="dowa-user-menu">
                <button class="dowa-user-menu-trigger" data-action="toggle-user-menu">
                    <div class="dowa-user-avatar">${initials}</div>
                    <span class="dowa-user-name">${user.display_name || user.username}</span>
                    <svg class="dowa-chevron" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M6 8L2 4h8z"/>
                    </svg>
                </button>
                <div class="dowa-user-menu-dropdown" style="display:none;">
                    <div class="dowa-user-menu-header">
                        <div class="dowa-user-menu-info">
                            <div class="dowa-user-menu-name">${user.display_name || user.username}</div>
                            <div class="dowa-user-menu-email">${user.email || ''}</div>
                        </div>
                    </div>
                    <div class="dowa-menu-divider"></div>
                    <button class="dowa-menu-item" data-action="profile">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                            <path d="M2 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H2z"/>
                        </svg>
                        <span>Profile</span>
                    </button>
                    <button class="dowa-menu-item" data-action="settings">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
                        </svg>
                        <span>Settings</span>
                    </button>
                    <div class="dowa-menu-divider"></div>
                    <button class="dowa-menu-item" data-action="logout">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                            <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        `;
    }

    buildLoginButton() {
        return `
            <button class="dowa-nav-btn dowa-btn-primary" data-action="login">
                Login
            </button>
        `;
    }

    setupEventListeners() {
        // Delegate event handling to nav bar
        document.addEventListener('click', async (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl) return;

            const action = actionEl.dataset.action;

            switch (action) {
                case 'login':
                    await this.showLoginDialog();
                    break;
                case 'logout':
                    await this.handleLogout();
                    break;
                case 'toggle-user-menu':
                    this.toggleUserMenu();
                    break;
                case 'profile':
                    this.showProfileDialog();
                    break;
                case 'settings':
                    this.showSettingsDialog();
                    break;
                case 'templates':
                    this.showTemplatesPanel();
                    break;
                case 'shared':
                    this.showSharedWorkflows();
                    break;
            }
        });

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.querySelector('.dowa-user-menu');
            if (userMenu && !userMenu.contains(e.target)) {
                const dropdown = userMenu.querySelector('.dowa-user-menu-dropdown');
                if (dropdown) {
                    dropdown.style.display = 'none';
                }
            }
        });
    }

    toggleUserMenu() {
        const dropdown = document.querySelector('.dowa-user-menu-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    }

    async showLoginDialog() {
        const dialog = new LoginDialog(this.authManager, this.apiClient);
        dialog.onSuccess = async (user) => {
            this.currentUser = user;
            this.isAuthenticated = true;
            this.refreshNavigationBar();
            console.log('✅ Login successful:', user.username);
        };
        dialog.show();
    }

    async handleLogout() {
        await this.authManager.logout();
        this.currentUser = null;
        this.isAuthenticated = false;
        this.refreshNavigationBar();
        console.log('✅ Logged out');
    }

    showLoginRequired() {
        alert('Your session has expired. Please login again.');
        this.showLoginDialog();
    }

    showProfileDialog() {
        console.log('Profile dialog - TODO');
        alert('Profile management coming soon!');
    }

    showSettingsDialog() {
        console.log('Settings dialog - TODO');
        alert('Settings coming soon!');
    }

    showTemplatesPanel() {
        console.log('Templates panel - TODO');
        alert('Templates panel coming soon!');
    }

    showSharedWorkflows() {
        console.log('Shared workflows - TODO');
        alert('Shared workflows coming soon!');
    }

    refreshNavigationBar() {
        this.createNavigationBar();
    }

    adjustCanvasPosition() {
        // Push ComfyUI canvas down to make room for navigation
        const canvas = document.querySelector('.graph-canvas-container');
        if (canvas) {
            canvas.style.top = '50px'; // Height of navigation bar
        }

        // Also adjust body if needed
        const body = document.querySelector('body');
        if (body) {
            body.style.paddingTop = '50px';
        }
    }
}

// Register ComfyUI extension
app.registerExtension({
    name: "dowa.navigation",

    async setup() {
        // Initialize navigation widget when ComfyUI loads
        console.log('🚀 Initializing DOWA Navigation Widget...');
        new DowaNavigationWidget();
    },

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "DowaNavigationNode") {
            // Make the node invisible - all UI is in the navigation bar
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                if (onNodeCreated) {
                    onNodeCreated.apply(this, arguments);
                }

                // Hide the node from the canvas
                this.size = [0, 0];
                this.serialize_widgets = false;

                // Make it collapsible
                if (!this.flags) {
                    this.flags = {};
                }
                this.flags.collapsed = true;
            };
        }
    }
});

export { DowaNavigationWidget };
