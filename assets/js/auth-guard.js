/**
 * Authentication Guard (Route Protection)
 * ============================================
 */

import authState from './auth-state.js';

const PROTECTED_ROUTES = {
    'profile-client.html': {
        authenticated: true,
        role: 'client',
        realNameStatus: null
    },
    'profile-developer.html': {
        authenticated: true,
        role: 'developer',
        realNameStatus: null
    },
    'create-task.html': {
        authenticated: true,
        role: 'client',
        realNameStatus: null
    },
    'accept-task.html': {
        authenticated: true,
        role: 'developer',
        realNameStatus: null
    },
    'profile-edit.html': {
        authenticated: true,
        role: null,
        realNameStatus: null
    },
    'message-detail.html': {
        authenticated: true,
        role: null,
        realNameStatus: null
    },
};

class AuthGuard {
    checkRoute(path) {
        const filename = path.split('/').pop() || 'index.html';
        const routeConfig = PROTECTED_ROUTES[filename];

        if (!routeConfig) {
            return { allowed: true };
        }

        if (routeConfig.authenticated && !authState.isAuthenticated) {
            return {
                allowed: false,
                reason: 'NOT_AUTHENTICATED',
                message: '请先登录',
                redirect: 'login.html'
            };
        }

        if (routeConfig.role && authState.currentUser?.role !== routeConfig.role) {
            return {
                allowed: false,
                reason: 'ROLE_MISMATCH',
                message: '您没有权限访问此页面',
                redirect: 'index.html'
            };
        }

        if (routeConfig.realNameStatus) {
            const currentStatus = authState.currentUser?.realNameStatus || 'not_started';
            if (currentStatus !== routeConfig.realNameStatus) {
                return {
                    allowed: false,
                    reason: 'REAL_NAME_REQUIRED',
                    message: '请先完成实名认证',
                    redirect: 'real-name-auth.html'
                };
            }
        }

        return { allowed: true };
    }

    init() {
        const checkResult = this.checkRoute(window.location.pathname);

        if (!checkResult.allowed) {
            let redirectUrl = checkResult.redirect;
            const currentPath = window.location.pathname;
            const searchParams = window.location.search;
            const hashParams = window.location.hash;
            const fullUrl = window.location.href;
            const returnParams = new URLSearchParams();

            returnParams.set('redirect', currentPath + searchParams + hashParams);
            redirectUrl += `?${returnParams.toString()}`;

            sessionStorage.setItem('auth_return_to', fullUrl);
            console.warn('Access denied:', checkResult.message);
            window.location.href = redirectUrl;
            return false;
        }

        return true;
    }

    getReturnPath() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get('redirect') || urlParams.get('returnTo');

        if (redirectParam && this.isSafeUrl(redirectParam)) {
            return redirectParam;
        }

        const returnTo = sessionStorage.getItem('auth_return_to');
        sessionStorage.removeItem('auth_return_to');

        if (returnTo && this.isSafeUrl(returnTo)) {
            return returnTo;
        }

        return null;
    }

    isSafeUrl(url) {
        try {
            const parsed = new URL(url, window.location.origin);
            return parsed.origin === window.location.origin;
        } catch (error) {
            return false;
        }
    }

    hasPermission(requiredRole = null, requiredStatus = null) {
        const checkResult = authState.checkPermission(requiredRole, requiredStatus);
        return checkResult.allowed;
    }

    toggleElementsByPermission(selector, requiredRole = null, requiredStatus = null) {
        const elements = document.querySelectorAll(selector);
        const hasPermission = this.hasPermission(requiredRole, requiredStatus);

        elements.forEach(element => {
            element.style.display = hasPermission ? '' : 'none';
        });
    }
}

const authGuard = new AuthGuard();
export default authGuard;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = authGuard;
}
