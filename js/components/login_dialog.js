/**
 * Login Dialog Component
 * Modal dialog for user authentication
 */

export class LoginDialog {
    constructor(authManager, apiClient) {
        this.authManager = authManager;
        this.apiClient = apiClient;
        this.onSuccess = null;
        this.dialog = null;
    }

    show() {
        if (this.dialog) {
            this.dialog.remove();
        }

        this.dialog = this.createDialog();
        document.body.appendChild(this.dialog);

        // Focus username field
        setTimeout(() => {
            this.dialog.querySelector('#dowa-login-username')?.focus();
        }, 100);
    }

    hide() {
        if (this.dialog) {
            this.dialog.remove();
            this.dialog = null;
        }
    }

    createDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'dowa-login-overlay';

        overlay.innerHTML = `
            <div class="dowa-login-dialog">
                <div class="dowa-login-header">
                    <h2>ComfyUI Login</h2>
                    <button class="dowa-login-close" aria-label="Close">&times;</button>
                </div>
                <form class="dowa-login-form" id="dowa-login-form">
                    <div class="dowa-form-group">
                        <label for="dowa-login-username">Username</label>
                        <input
                            type="text"
                            id="dowa-login-username"
                            name="username"
                            required
                            autocomplete="username"
                            placeholder="Enter your username"
                        />
                    </div>
                    <div class="dowa-form-group">
                        <label for="dowa-login-password">Password</label>
                        <input
                            type="password"
                            id="dowa-login-password"
                            name="password"
                            required
                            autocomplete="current-password"
                            placeholder="Enter your password"
                        />
                    </div>
                    <div class="dowa-login-error" style="display:none;"></div>
                    <div class="dowa-login-actions">
                        <button type="submit" class="dowa-btn dowa-btn-primary">
                            <span class="dowa-btn-text">Login</span>
                            <span class="dowa-btn-loading" style="display:none;">Logging in...</span>
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Event listeners
        overlay.querySelector('.dowa-login-close').addEventListener('click', () => {
            this.hide();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hide();
            }
        });

        overlay.querySelector('#dowa-login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e.target);
        });

        return overlay;
    }

    async handleLogin(form) {
        const username = form.username.value.trim();
        const password = form.password.value;
        const errorEl = form.querySelector('.dowa-login-error');
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.dowa-btn-text');
        const btnLoading = submitBtn.querySelector('.dowa-btn-loading');

        // Clear previous error
        errorEl.style.display = 'none';
        errorEl.textContent = '';

        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';

        try {
            const result = await this.authManager.login(username, password);

            if (result.success) {
                this.hide();
                if (this.onSuccess) {
                    this.onSuccess(result.user);
                }
            } else {
                errorEl.textContent = result.error || 'Login failed';
                errorEl.style.display = 'block';
            }
        } catch (error) {
            errorEl.textContent = 'Network error. Please try again.';
            errorEl.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }
}
