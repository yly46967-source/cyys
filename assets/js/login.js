/**
 * [FILE] login.js
 * [POS] 登录页面交互逻辑 - 处理登录表单提交、验证码发送
 * [IN] 用户输入 (手机号、验证码、记住我)
 * [OUT] 登录状态更新、页面跳转
 * [DEP] auth-state.js, verification-code.js, form-validator.js, notification.js
 * [SIDE EFFECT] 表单提交触发 API 调用、更新状态、页面跳转
 * [TEST] 手动测试: 验证登录流程、表单验证、错误提示、成功跳转
 *
 * Login Page Logic
 * ============================================ */

// ============================================
// State
// ============================================
let isSubmitting = false;
let elements = {};

// ============================================
// Initialization
// ============================================

// ============================================
// Initialization
// ============================================
function init() {
    // 从 window 获取依赖（延迟加载，确保已挂载）
    const verificationCode = window.verificationCode;
    const FormValidator = window.FormValidator;
    const notification = window.notification;
    const authState = window.authState;

    // 检查依赖是否可用
    if (!verificationCode || !FormValidator || !notification || !authState) {
        console.error('[Login] 依赖对象未正确加载，请刷新页面重试');
        console.error('[Login] verificationCode:', verificationCode);
        console.error('[Login] FormValidator:', FormValidator);
        console.error('[Login] notification:', notification);
        console.error('[Login] authState:', authState);
        return;
    }

    // 获取 DOM 元素
    elements = {
        loginForm: document.getElementById('loginForm'),
        phoneInput: document.querySelector('input[name="phone"]'),
        codeInput: document.querySelector('input[name="code"]'),
        rememberMeCheckbox: document.getElementById('rememberMe'),
        sendCodeBtn: document.getElementById('sendCodeBtn'),
        loginBtn: document.getElementById('loginBtn'),
        phoneError: document.getElementById('phoneError'),
        codeError: document.getElementById('codeError')
    };

    if (!elements.loginForm) return;

    // 绑定事件
    elements.sendCodeBtn.addEventListener('click', handleSendCode);
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.phoneInput.addEventListener('input', handlePhoneInput);

    // 设置验证码倒计时回调
    verificationCode.setCountdownCallback((remaining) => {
        updateSendCodeButton(remaining);
    });

    // 检查是否有返回路径
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('redirect') || urlParams.get('returnTo');
    if (returnTo) {
        console.log('登录后返回:', returnTo);
    }
}

// ============================================
// Event Handlers
// ============================================

/**
 * 处理手机号输入
 */
function handlePhoneInput() {
    // 清除手机号错误
    elements.phoneError.textContent = '';
    elements.phoneInput.classList.remove('auth-form-input--error');

    // 限制只能输入数字
    const value = elements.phoneInput.value.replace(/\D/g, '');
    if (value !== elements.phoneInput.value) {
        elements.phoneInput.value = value;
    }
}

/**
 * 处理发送验证码
 */
async function handleSendCode() {
    const phone = elements.phoneInput.value.trim();

    // 验证手机号
    const phoneValidation = FormValidator.validatePhone(phone);
    if (!phoneValidation.valid) {
        showPhoneError(phoneValidation.message);
        return;
    }

    // 清除之前的错误
    clearPhoneError();

    // 发送验证码（倒计时已在 verification-code.js 中启动）
    await verificationCode.sendCode(
        phone,
        'login',
        (data) => {
            // 成功
            notification.success('验证码已发送');
            console.log('验证码已发送:', data);
        },
        (error) => {
            // 失败
            if (!error.isCountdown) {
                notification.error(error.message);
            }
        }
    );
}

/**
 * 更新发送验证码按钮
 */
function updateSendCodeButton(remaining) {
    if (!elements.sendCodeBtn) return;

    if (remaining > 0) {
        elements.sendCodeBtn.textContent = `${remaining}秒后重试`;
        elements.sendCodeBtn.disabled = true;
    } else {
        elements.sendCodeBtn.textContent = '发送验证码';
        elements.sendCodeBtn.disabled = false;
    }
}

/**
 * 处理登录提交
 */
async function handleLogin(e) {
    e.preventDefault();

    if (isSubmitting) return;

    // 获取表单数据
    const formData = new FormData(elements.loginForm);
    const phone = formData.get('phone').trim();
    const code = formData.get('code').trim();
    const rememberMe = formData.get('rememberMe') === 'on';

    // 验证表单
    let hasError = false;

    // 验证手机号
    const phoneValidation = FormValidator.validatePhone(phone);
    if (!phoneValidation.valid) {
        showPhoneError(phoneValidation.message);
        hasError = true;
    }

    // 验证验证码
    const codeValidation = FormValidator.validateCode(code);
    if (!codeValidation.valid) {
        showCodeError(codeValidation.message);
        hasError = true;
    }

    if (hasError) return;

    // 开始提交
    isSubmitting = true;
    elements.loginBtn.disabled = true;
    elements.loginBtn.textContent = '登录中...';

    // 执行登录
    const result = await window.authState.onLoginSuccess(phone, code, rememberMe);

    if (result.success) {
        // 登录成功
        notification.success('登录成功！');

        // 获取返回路径（支持 redirect 和 returnTo 两种参数）
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get('redirect') || urlParams.get('returnTo');

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
            if (returnTo) {
                window.location.href = returnTo;
            } else {
                // 根据角色跳转到不同的个人中心
                const user = result.user;
                if (user.role === 'client') {
                    window.location.href = 'profile-client.html';
                } else {
                    window.location.href = 'profile-developer.html';
                }
            }
        }, 500);

    } else {
        // 登录失败
        notification.error(result.error);
        isSubmitting = false;
        elements.loginBtn.disabled = false;
        elements.loginBtn.textContent = '登录';
    }
}

// ============================================
// UI Helpers
// ============================================

/**
 * 显示手机号错误
 */
function showPhoneError(message) {
    elements.phoneError.textContent = message;
    elements.phoneInput.classList.add('auth-form-input--error');
}

/**
 * 清除手机号错误
 */
function clearPhoneError() {
    elements.phoneError.textContent = '';
    elements.phoneInput.classList.remove('auth-form-input--error');
}

/**
 * 显示验证码错误
 */
function showCodeError(message) {
    elements.codeError.textContent = message;
    elements.codeInput.classList.add('auth-form-input--error');
}

/**
 * 清除验证码错误
 */
function clearCodeError() {
    elements.codeError.textContent = '';
    elements.codeInput.classList.remove('auth-form-input--error');
}

// 导出 init 函数供入口文件使用
export { init };
