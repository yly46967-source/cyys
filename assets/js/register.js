/**
 * [FILE] register.js
 * [POS] 注册页面交互逻辑 - 处理4步向导式注册流程
 * [IN] 用户输入 (手机号、验证码、密码、角色、姓名)
 * [OUT] 注册状态更新、页面跳转
 * [DEP] auth-state.js, verification-code.js, form-validator.js, notification.js
 * [SIDE EFFECT] 表单提交触发 API 调用、更新状态、页面跳转
 * [TEST] 手动测试: 验证4步注册流程、表单验证、步骤切换、成功跳转
 *
 * Register Page Logic
 * ============================================ */

// 从 window 获取依赖（由入口文件挂载）
let verificationCode = null;
let FormValidator = null;
let notification = null;
let authState = null;

// ============================================
// Elements
// ============================================
const elements = {
    registerForm: document.getElementById('registerForm'),
    steps: document.querySelectorAll('.progress-step'),
    stepContents: document.querySelectorAll('.step-content'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    submitBtn: document.getElementById('submitBtn'),
    phoneInput: document.querySelector('input[name="phone"]'),
    codeInput: document.querySelector('input[name="code"]'),
    passwordInput: document.querySelector('input[name="password"]'),
    confirmPasswordInput: document.querySelector('input[name="confirmPassword"]'),
    nameInput: document.querySelector('input[name="name"]'),
    roleInput: document.getElementById('roleInput'),
    agreedCheckbox: document.getElementById('agreedCheckbox'),
    sendCodeBtn: document.getElementById('sendCodeBtn'),
    roleCards: document.querySelectorAll('.role-card'),
    passwordStrength: document.getElementById('passwordStrength'),
    strengthFill: document.getElementById('strengthFill'),
    strengthLabel: document.getElementById('strengthLabel')
};

// ============================================
// State
// ============================================
let currentStep = 1;
const totalSteps = 4;
let selectedRole = null;
let isSubmitting = false;

// ============================================
// Initialization
// ============================================
function loadDependencies() {
    verificationCode = window.verificationCode;
    FormValidator = window.FormValidator;
    notification = window.notification;
    authState = window.authState;

    if (!verificationCode || !FormValidator || !notification || !authState) {
        console.error('[Register] 依赖对象未正确加载，请刷新页面重试');
        return false;
    }

    return true;
}

function init() {
    if (!elements.registerForm) return;
    if (!loadDependencies()) return;

    // 绑定事件
    elements.sendCodeBtn.addEventListener('click', handleSendCode);
    elements.phoneInput.addEventListener('input', handlePhoneInput);
    elements.passwordInput.addEventListener('input', handlePasswordInput);
    elements.prevBtn.addEventListener('click', handlePrevStep);
    elements.nextBtn.addEventListener('click', handleNextStep);
    elements.registerForm.addEventListener('submit', handleSubmit);

    // 角色卡片点击
    elements.roleCards.forEach(card => {
        card.addEventListener('click', () => handleRoleSelect(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleRoleSelect(card);
            }
        });
    });

    // 密码显示/隐藏切换
    document.querySelectorAll('.auth-form-password-toggle').forEach(btn => {
        btn.addEventListener('click', () => togglePasswordVisibility(btn));
    });

    // 设置验证码倒计时回调
    verificationCode.setCountdownCallback((remaining) => {
        updateSendCodeButton(remaining);
    });

    // 更新按钮状态
    updateButtons();
}

// ============================================
// Event Handlers
// ============================================

/**
 * 处理手机号输入
 */
function handlePhoneInput() {
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

    const phoneValidation = FormValidator.validatePhone(phone);
    if (!phoneValidation.valid) {
        showFieldError('phone', phoneValidation.message);
        return;
    }

    clearFieldError('phone');

    // 发送验证码（倒计时已在 verification-code.js 中启动）
    await verificationCode.sendCode(
        phone,
        'register',
        (data) => {
            notification.success('验证码已发送');
            console.log('验证码已发送:', data);
        },
        (error) => {
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
    if (remaining > 0) {
        elements.sendCodeBtn.textContent = `${remaining}秒后重试`;
        elements.sendCodeBtn.disabled = true;
    } else {
        elements.sendCodeBtn.textContent = '发送验证码';
        elements.sendCodeBtn.disabled = false;
    }
}

/**
 * 处理密码输入
 */
function handlePasswordInput() {
    const password = elements.passwordInput.value;
    clearFieldError('password');

    if (password.length === 0) {
        elements.passwordStrength.style.display = 'none';
        return;
    }

    const strength = FormValidator.getPasswordStrength(password);
    elements.passwordStrength.style.display = 'block';
    elements.strengthFill.style.width = `${strength.percent}%`;
    elements.strengthFill.style.backgroundColor = strength.color;
    elements.strengthLabel.textContent = `密码强度：${strength.label}`;
}

/**
 * 处理角色选择
 */
function handleRoleSelect(card) {
    const role = card.dataset.role;
    selectedRole = role;
    elements.roleInput.value = role;

    // 更新 UI
    elements.roleCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    clearFieldError('role');
}

/**
 * 处理上一步
 */
function handlePrevStep() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

/**
 * 处理下一步
 */
function handleNextStep() {
    if (!validateCurrentStep()) return;

    if (currentStep < totalSteps) {
        goToStep(currentStep + 1);
    }
}

/**
 * 跳转到指定步骤
 */
function goToStep(step) {
    // 更新进度指示器
    elements.steps.forEach((stepEl, index) => {
        const stepNumber = index + 1;
        stepEl.classList.remove('active', 'completed');
        if (stepNumber < step) {
            stepEl.classList.add('completed');
        } else if (stepNumber === step) {
            stepEl.classList.add('active');
        }
    });

    // 更新内容区域
    elements.stepContents.forEach((content, index) => {
        const contentStep = parseInt(content.dataset.step);
        content.classList.remove('active');
        if (contentStep === step) {
            content.classList.add('active');
        }
    });

    currentStep = step;
    updateButtons();
}

/**
 * 更新按钮状态
 */
function updateButtons() {
    // 上一步按钮
    elements.prevBtn.style.display = currentStep > 1 ? 'block' : 'none';

    // 下一步/提交按钮
    if (currentStep === totalSteps) {
        elements.nextBtn.style.display = 'none';
        elements.submitBtn.style.display = 'block';
    } else {
        elements.nextBtn.style.display = 'block';
        elements.submitBtn.style.display = 'none';
    }
}

/**
 * 验证当前步骤
 */
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return validateStep1();
        case 2:
            return validateStep2();
        case 3:
            return validateStep3();
        case 4:
            return validateStep4();
        default:
            return true;
    }
}

/**
 * 验证步骤1：手机验证
 */
function validateStep1() {
    let valid = true;

    // 验证手机号
    const phone = elements.phoneInput.value.trim();
    const phoneValidation = FormValidator.validatePhone(phone);
    if (!phoneValidation.valid) {
        showFieldError('phone', phoneValidation.message);
        valid = false;
    }

    // 验证验证码
    const code = elements.codeInput.value.trim();
    const codeValidation = FormValidator.validateCode(code);
    if (!codeValidation.valid) {
        showFieldError('code', codeValidation.message);
        valid = false;
    }

    return valid;
}

/**
 * 验证步骤2：设置密码
 */
function validateStep2() {
    let valid = true;

    const password = elements.passwordInput.value;
    const confirmPassword = elements.confirmPasswordInput.value;

    // 验证密码
    const passwordValidation = FormValidator.validatePassword(password);
    if (!passwordValidation.valid) {
        showFieldError('password', passwordValidation.message);
        valid = false;
    }

    // 验证确认密码
    const confirmValidation = FormValidator.validateConfirmPassword(password, confirmPassword);
    if (!confirmValidation.valid) {
        showFieldError('confirmPassword', confirmValidation.message);
        valid = false;
    }

    return valid;
}

/**
 * 验证步骤3：角色选择
 */
function validateStep3() {
    if (!selectedRole) {
        showFieldError('role', '请选择您的角色');
        return false;
    }
    clearFieldError('role');
    return true;
}

/**
 * 验证步骤4：基本信息
 */
function validateStep4() {
    let valid = true;

    // 验证姓名
    const name = elements.nameInput.value.trim();
    const nameValidation = FormValidator.validateName(name);
    if (!nameValidation.valid) {
        showFieldError('name', nameValidation.message);
        valid = false;
    }

    // 验证协议同意
    if (!elements.agreedCheckbox.checked) {
        notification.error('请阅读并同意用户协议和隐私政策');
        valid = false;
    }

    return valid;
}

/**
 * 处理表单提交
 */
async function handleSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateCurrentStep()) return;

    isSubmitting = true;
    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = '注册中...';

    // 获取表单数据
    const formData = new FormData(elements.registerForm);
    const userData = {
        phone: formData.get('phone').trim(),
        code: formData.get('code').trim(),
        password: formData.get('password'),
        role: formData.get('role'),
        name: formData.get('name').trim()
    };

    // 执行注册
    const result = await window.authState.onRegister(userData);

    if (result.success) {
        notification.success('注册成功！即将跳转到登录页...');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } else {
        notification.error(result.error);
        isSubmitting = false;
        elements.submitBtn.disabled = false;
        elements.submitBtn.textContent = '确认注册';
    }
}

/**
 * 切换密码可见性
 */
function togglePasswordVisibility(btn) {
    const targetId = btn.dataset.target;
    const input = document.querySelector(`input[name="${targetId}"]`);

    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
        `;
    } else {
        input.type = 'password';
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        `;
    }
}

// ============================================
// UI Helpers
// ============================================

/**
 * 显示字段错误
 */
function showFieldError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);
    const inputElement = document.querySelector(`input[name="${field}"]`);

    if (errorElement) {
        errorElement.textContent = message;
    }
    if (inputElement) {
        inputElement.classList.add('auth-form-input--error');
    }
}

/**
 * 清除字段错误
 */
function clearFieldError(field) {
    const errorElement = document.getElementById(`${field}Error`);
    const inputElement = document.querySelector(`input[name="${field}"]`);

    if (errorElement) {
        errorElement.textContent = '';
    }
    if (inputElement) {
        inputElement.classList.remove('auth-form-input--error');
    }
}

// 导出 init 函数供入口文件使用
export { init };
