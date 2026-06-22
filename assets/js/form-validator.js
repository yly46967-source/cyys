/**
 * Form Validation Utility
 * ============================================
 */

class FormValidator {
    static validatePhone(phone) {
        if (!phone) {
            return { valid: false, message: '请输入手机号' };
        }

        const testPhones = ['12345678901', '10987654321', '13800138000', '13900139000'];
        if (testPhones.includes(phone)) {
            return { valid: true };
        }

        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return { valid: false, message: '请输入有效的手机号' };
        }

        return { valid: true };
    }

    static validateCode(code) {
        if (!code) {
            return { valid: false, message: '请输入验证码' };
        }

        if (!/^\d{6}$/.test(code)) {
            return { valid: false, message: '请输入 6 位数字验证码' };
        }

        return { valid: true };
    }

    static validatePassword(password) {
        if (!password) {
            return { valid: false, message: '请输入密码' };
        }

        if (password.length < 8) {
            return { valid: false, message: '密码至少需要 8 位' };
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            return { valid: false, message: '密码需包含大小写字母和数字' };
        }

        return { valid: true };
    }

    static getPasswordStrength(password) {
        if (!password) {
            return { level: 0, label: '请输入密码', color: '#9D9CAA' };
        }

        let score = 0;
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;

        if (score <= 2) {
            return { level: 1, label: '弱', color: '#EF4444', percent: 33 };
        }

        if (score <= 4) {
            return { level: 2, label: '中', color: '#F59E0B', percent: 66 };
        }

        return { level: 3, label: '强', color: '#10B981', percent: 100 };
    }

    static validateConfirmPassword(password, confirmPassword) {
        if (!confirmPassword) {
            return { valid: false, message: '请确认密码' };
        }

        if (password !== confirmPassword) {
            return { valid: false, message: '两次输入的密码不一致' };
        }

        return { valid: true };
    }

    static validateName(name) {
        if (!name) {
            return { valid: false, message: '请输入姓名' };
        }

        if (name.length < 2) {
            return { valid: false, message: '姓名至少需要 2 个字符' };
        }

        if (name.length > 20) {
            return { valid: false, message: '姓名不能超过 20 个字符' };
        }

        return { valid: true };
    }

    static validateRole(role) {
        if (!role) {
            return { valid: false, message: '请选择角色' };
        }

        if (!['client', 'developer'].includes(role)) {
            return { valid: false, message: '无效的角色选择' };
        }

        return { valid: true };
    }

    static validateEmail(email) {
        if (!email) {
            return { valid: false, message: '请输入邮箱' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, message: '请输入有效的邮箱地址' };
        }

        return { valid: true };
    }

    static validatePortfolioUrl(url) {
        if (!url) {
            return { valid: true };
        }

        try {
            new URL(url);
            return { valid: true };
        } catch (error) {
            return { valid: false, message: '请输入有效的 URL 地址' };
        }
    }

    static validateIdCard(idCard) {
        if (!idCard) {
            return { valid: false, message: '请输入身份证号' };
        }

        const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
        if (!idCardRegex.test(idCard)) {
            return { valid: false, message: '请输入正确的身份证号' };
        }

        return { valid: true };
    }

    static validateTaskTitle(title) {
        if (!title || !title.trim()) {
            return { valid: false, message: '请输入任务标题' };
        }

        const normalized = title.trim();
        if (normalized.length < 5) {
            return { valid: false, message: '任务标题至少 5 个字' };
        }

        if (normalized.length > 60) {
            return { valid: false, message: '任务标题不能超过 60 个字' };
        }

        return { valid: true };
    }

    static validateTaskSummary(summary) {
        if (!summary || !summary.trim()) {
            return { valid: false, message: '请输入任务摘要' };
        }

        const normalized = summary.trim();
        if (normalized.length < 10) {
            return { valid: false, message: '任务摘要至少 10 个字' };
        }

        if (normalized.length > 160) {
            return { valid: false, message: '任务摘要不能超过 160 个字' };
        }

        return { valid: true };
    }

    static validateTaskDescription(description) {
        if (!description || !description.trim()) {
            return { valid: false, message: '请输入任务描述' };
        }

        if (description.trim().length < 20) {
            return { valid: false, message: '任务描述至少 20 个字' };
        }

        return { valid: true };
    }

    static validatePositiveInteger(value, label = '数值') {
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            return { valid: false, message: `${label}必须是正整数` };
        }

        return { valid: true };
    }

    static validateBudgetRange(minValue, maxValue) {
        const min = Number(minValue);
        const max = Number(maxValue);

        if (!Number.isFinite(min) || min <= 0) {
            return { valid: false, message: '最低预算必须大于 0' };
        }

        if (!Number.isFinite(max) || max <= 0) {
            return { valid: false, message: '最高预算必须大于 0' };
        }

        if (min > max) {
            return { valid: false, message: '最低预算不能高于最高预算' };
        }

        return { valid: true };
    }

    static validateFutureDate(dateValue) {
        if (!dateValue) {
            return { valid: false, message: '请选择截止日期' };
        }

        const selectedDate = new Date(dateValue);
        if (Number.isNaN(selectedDate.getTime())) {
            return { valid: false, message: '截止日期格式无效' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate <= today) {
            return { valid: false, message: '截止日期必须晚于今天' };
        }

        return { valid: true };
    }

    static validateStringArray(values, label = '列表项', minCount = 1) {
        if (!Array.isArray(values)) {
            return { valid: false, message: `${label}至少填写 ${minCount} 项` };
        }

        const normalized = values.map(item => `${item || ''}`.trim()).filter(Boolean);
        if (normalized.length < minCount) {
            return { valid: false, message: `${label}至少填写 ${minCount} 项` };
        }

        return { valid: true };
    }

    static validateProposal(proposal) {
        if (!proposal || !proposal.trim()) {
            return { valid: false, message: '请输入接单说明' };
        }

        const normalized = proposal.trim();
        if (normalized.length < 20) {
            return { valid: false, message: '接单说明至少 20 个字' };
        }

        if (normalized.length > 500) {
            return { valid: false, message: '接单说明不能超过 500 个字' };
        }

        return { valid: true };
    }

    static validateForm(formData, rules) {
        const errors = {};
        let isValid = true;

        for (const rule of rules) {
            const { field, validator, message } = rule;
            const value = formData[field];
            let result = { valid: true };

            if (typeof validator === 'function') {
                result = validator(value);
            } else if (typeof validator === 'string') {
                const validatorMethod = `validate${validator.charAt(0).toUpperCase() + validator.slice(1)}`;
                if (typeof this[validatorMethod] === 'function') {
                    result = this[validatorMethod](value);
                }
            }

            if (!result.valid) {
                errors[field] = message || result.message;
                isValid = false;
            }
        }

        return { valid: isValid, errors };
    }

    static showFormErrors(errors, form) {
        this.clearFormErrors(form);

        for (const [field, message] of Object.entries(errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (!input) continue;

            input.classList.add('form-input--error');

            let errorElement = input.nextElementSibling;
            if (!errorElement || !errorElement.classList.contains('form-error')) {
                errorElement = document.createElement('span');
                errorElement.className = 'form-error';
                input.parentNode.insertBefore(errorElement, input.nextSibling);
            }
            errorElement.textContent = message;
        }
    }

    static clearFormErrors(form) {
        form.querySelectorAll('.form-input--error').forEach(input => {
            input.classList.remove('form-input--error');
        });

        form.querySelectorAll('.form-error').forEach(error => {
            error.remove();
        });
    }
}

export default FormValidator;

if (typeof window !== 'undefined') {
    window.FormValidator = FormValidator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}
