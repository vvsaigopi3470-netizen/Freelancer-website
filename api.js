// ===========================
// API Client for Backend Integration
// ===========================

class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.accessToken = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
    }

    /**
     * Make an API request
     */
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add authorization header if token exists
        if (this.accessToken && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers,
            });

            // Handle token expiration
            if (response.status === 401 && this.refreshToken && !options.skipRefresh) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry the original request
                    return this.request(endpoint, { ...options, skipRefresh: true });
                } else {
                    // Refresh failed, logout user
                    this.logout();
                    window.location.href = 'login.html';
                    throw new Error('Session expired. Please login again.');
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.detail || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        try {
            const response = await fetch(`${this.baseURL}/auth/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: this.refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.access;
                localStorage.setItem('access_token', data.access);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    /**
     * User Registration
     */
    async register(userData) {
        const data = await this.request('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
            skipAuth: true,
        });
        return data;
    }

    /**
     * User Login
     */
    async login(email, password) {
        const data = await this.request('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            skipAuth: true,
        });

        if (data.access) {
            this.accessToken = data.access;
            this.refreshToken = data.refresh;
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    }

    /**
     * User Logout
     */
    async logout() {
        try {
            if (this.refreshToken) {
                await this.request('/auth/logout/', {
                    method: 'POST',
                    body: JSON.stringify({ refresh_token: this.refreshToken }),
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            this.accessToken = null;
            this.refreshToken = null;
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser() {
        return this.request('/auth/me/');
    }

    /**
     * Update current user
     */
    async updateCurrentUser(userData) {
        return this.request('/auth/me/', {
            method: 'PATCH',
            body: JSON.stringify(userData),
        });
    }

    /**
     * Create freelancer profile
     */
    async createFreelancerProfile(profileData) {
        return this.request('/freelancers/profiles/', {
            method: 'POST',
            body: JSON.stringify(profileData),
        });
    }

    /**
     * Get freelancer profile
     */
    async getFreelancerProfile(id) {
        return this.request(`/freelancers/profiles/${id}/`);
    }

    /**
     * Update freelancer profile
     */
    async updateFreelancerProfile(id, profileData) {
        return this.request(`/freelancers/profiles/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(profileData),
        });
    }

    /**
     * Upload profile picture
     */
    async uploadProfilePicture(profileId, file) {
        const formData = new FormData();
        formData.append('profile_picture', file);

        return fetch(`${this.baseURL}/freelancers/profiles/${profileId}/upload_picture/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
            },
            body: formData,
        }).then(res => res.json());
    }

    /**
     * Create recruiter profile
     */
    async createRecruiterProfile(profileData) {
        return this.request('/recruiters/profiles/', {
            method: 'POST',
            body: JSON.stringify(profileData),
        });
    }

    /**
     * Get jobs list
     */
    async getJobs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/jobs/?${queryString}`);
    }

    /**
     * Create job posting
     */
    async createJob(jobData) {
        return this.request('/jobs/', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
    }

    /**
     * Apply to job
     */
    async applyToJob(jobId, applicationData) {
        return this.request(`/jobs/${jobId}/apply/`, {
            method: 'POST',
            body: JSON.stringify(applicationData),
        });
    }

    /**
     * Get notifications
     */
    async getNotifications() {
        return this.request('/notifications/');
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(notificationId) {
        return this.request(`/notifications/${notificationId}/mark_read/`, {
            method: 'POST',
        });
    }

    /**
     * Get analytics dashboard
     */
    async getAnalyticsDashboard() {
        return this.request('/analytics/dashboard/');
    }

    /**
     * Track analytics event
     */
    async trackEvent(eventType, metadata = {}) {
        return this.request('/analytics/track_event/', {
            method: 'POST',
            body: JSON.stringify({ event_type: eventType, metadata }),
        });
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.accessToken;
    }

    /**
     * Get stored user data
     */
    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}

// Create global API instance
const api = new APIClient();

// ===========================
// Helper Functions
// ===========================

/**
 * Show message to user
 */
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

/**
 * Check authentication and redirect if needed
 */
function requireAuth() {
    if (!api.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Get user role
 */
function getUserRole() {
    const user = api.getUser();
    return user ? user.role : null;
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
