/**
 * [FILE] profile-editor.js
 * [POS] 个人资料编辑组件 - 模态框形式的资料编辑器
 * [IN] 用户数据
 * [OUT] 更新后的用户数据
 * [DEP] user-service.js, profile-config.js
 * [SIDE EFFECT] 修改 DOM，发送网络请求
 * [TEST] 验证表单校验、头像上传、保存功能
 *
 * Profile Editor Component
 * ============================================
 */

import userService from './user-service.js';
import { VALIDATION_RULES, getRoleConfig } from './profile-config.js';

// ============================================
// Profile Editor Class
// ============================================

class ProfileEditor {
    constructor(options = {}) {
        this.role = options.role || 'client';
        this.modal = document.getElementById('profileEditorModal');
        this.form = document.getElementById('profileEditForm');
        this.userData = null;
        this.hasUnsavedChanges = false;
        this.originalData = null;

        // 绑定事件
        this.init();
    }

    /**
     * 初始化编辑器
     */
    init() {
        if (!this.modal || !this.form) {
            console.error('ProfileEditor: Modal or form not found');
            return;
        }

        this.bindModalEvents();
    }

    /**
     * 打开编辑器
     * @param {Object} userData - 用户数据
     */
    open(userData) {
        this.userData = userData;
        this.originalData = JSON.parse(JSON.stringify(userData));
        this.hasUnsavedChanges = false;

        this.renderForm();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭编辑器
     * @param {boolean} checkUnsaved - 是否检查未保存修改
     */
    close(checkUnsaved = true) {
        if (checkUnsaved && this.hasUnsavedChanges) {
            if (!confirm('您有未保存的修改，确定要关闭吗？')) {
                return;
            }
        }

        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.form.reset();
        this.hasUnsavedChanges = false;
    }

    /**
     * 渲染表单
     */
    renderForm() {
        const extension = this.userData.extension || {};
        const config = getRoleConfig(this.role);

        let formHtml = `
            <!-- 头像上传 -->
            <div class="profile-form-group">
                <label class="profile-form-label">头像</label>
                <div class="profile-avatar-upload">
                    <img
                        src="${extension.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}"
                        alt="头像预览"
                        class="profile-avatar-preview"
                        id="avatarPreview"
                    >
                    <div>
                        <input type="file" id="avatarInput" accept="image/jpeg,image/png,image/webp" style="display: none;">
                        <button type="button" class="profile-avatar-upload-btn" id="avatarUploadBtn">
                            选择图片
                        </button>
                        <p style="font-size: 12px; color: var(--color-text-tertiary); margin-top: 4px;">
                            支持 JPG、PNG、WebP，最大 2MB
                        </p>
                    </div>
                </div>
            </div>

            <!-- 姓名 -->
            <div class="profile-form-group">
                <label for="userName" class="profile-form-label">姓名 *</label>
                <input
                    type="text"
                    id="userName"
                    name="name"
                    class="profile-form-input"
                    value="${this.escapeHtml(this.userData.name)}"
                    required
                    minlength="2"
                    maxlength="20"
                    data-validate="name"
                >
            </div>

            <!-- 简介 -->
            <div class="profile-form-group">
                <label for="userBio" class="profile-form-label">简介</label>
                <textarea
                    id="userBio"
                    name="bio"
                    class="profile-form-textarea"
                    maxlength="200"
                    placeholder="介绍一下自己..."
                    data-validate="bio"
                >${this.escapeHtml(extension.bio || '')}</textarea>
                <small style="color: var(--color-text-tertiary);">${(extension.bio || '').length}/200</small>
            </div>

            <!-- 地区 -->
            <div class="profile-form-group">
                <label for="userLocation" class="profile-form-label">地区</label>
                <input
                    type="text"
                    id="userLocation"
                    name="location"
                    class="profile-form-input"
                    value="${this.escapeHtml(extension.location || '')}"
                    maxlength="50"
                    placeholder="例如：北京"
                    data-validate="location"
                >
            </div>

            <!-- 个人网站 -->
            <div class="profile-form-group">
                <label for="userWebsite" class="profile-form-label">个人网站</label>
                <input
                    type="url"
                    id="userWebsite"
                    name="website"
                    class="profile-form-input"
                    value="${this.escapeHtml(extension.website || '')}"
                    placeholder="https://example.com"
                    data-validate="website"
                >
            </div>
        `;

        // 客户专用字段
        if (this.role === 'client') {
            formHtml += `
                <!-- 公司名称 -->
                <div class="profile-form-group">
                    <label for="companyName" class="profile-form-label">公司名称</label>
                    <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        class="profile-form-input"
                        value="${this.escapeHtml(extension.company?.name || '')}"
                        placeholder="请输入公司名称"
                    >
                </div>

                <!-- 统一社会信用代码 -->
                <div class="profile-form-group">
                    <label for="companyCreditCode" class="profile-form-label">统一社会信用代码</label>
                    <input
                        type="text"
                        id="companyCreditCode"
                        name="companyCreditCode"
                        class="profile-form-input"
                        value="${this.escapeHtml(extension.company?.creditCode || '')}"
                        placeholder="请输入统一社会信用代码"
                        pattern="[0-9A-Z]{18}"
                    >
                </div>

                <!-- 职位 -->
                <div class="profile-form-group">
                    <label for="userTitle" class="profile-form-label">职位</label>
                    <input
                        type="text"
                        id="userTitle"
                        name="title"
                        class="profile-form-input"
                        value="${this.escapeHtml(extension.title || '')}"
                        placeholder="例如：技术总监"
                    >
                </div>
            `;
        }

        // 开发者专用字段
        if (this.role === 'developer') {
            const skills = extension.skills || [];
            formHtml += `
                <!-- 技能标签 -->
                <div class="profile-form-group">
                    <label class="profile-form-label">技能标签（最多5个）</label>
                    <div id="skillsContainer">
                        ${skills.map(skill => `
                            <span class="skill-tag" data-skill="${this.escapeHtml(skill)}">
                                ${this.escapeHtml(skill)}
                                <button type="button" class="skill-remove" data-skill="${this.escapeHtml(skill)}">×</button>
                            </span>
                        `).join('')}
                    </div>
                    <div style="margin-top: 8px;">
                        <input
                            type="text"
                            id="skillInput"
                            class="profile-form-input"
                            placeholder="输入技能后按回车添加"
                            maxlength="20"
                        >
                        <small style="color: var(--color-text-tertiary);">例如：React、Vue、Python 等</small>
                    </div>
                </div>
            `;
        }

        this.form.innerHTML = formHtml;
        this.bindFormEvents();
    }

    /**
     * 绑定模态框事件
     */
    bindModalEvents() {
        // 关闭按钮
        const closeBtn = document.getElementById('closeModalBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close(true));
        }

        // 取消按钮
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close(true));
        }

        // 点击遮罩关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close(true);
            }
        });

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close(true);
            }
        });

        // 表单提交
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // 监听表单变化
        this.form.addEventListener('input', () => {
            this.hasUnsavedChanges = true;
        });

        // beforeunload 事件
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges && this.modal.classList.contains('active')) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    /**
     * 绑定表单事件
     */
    bindFormEvents() {
        // 头像上传
        const avatarInput = document.getElementById('avatarInput');
        const avatarUploadBtn = document.getElementById('avatarUploadBtn');
        const avatarPreview = document.getElementById('avatarPreview');

        if (avatarUploadBtn && avatarInput) {
            avatarUploadBtn.addEventListener('click', () => avatarInput.click());

            avatarInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await this.handleAvatarUpload(file, avatarPreview);
                }
            });
        }

        // 简介字数统计
        const bioInput = document.getElementById('userBio');
        if (bioInput) {
            bioInput.addEventListener('input', (e) => {
                const count = e.target.value.length;
                const counter = e.target.nextElementSibling;
                if (counter) {
                    counter.textContent = `${count}/200`;
                }
            });
        }

        // 技能标签输入（开发者）
        if (this.role === 'developer') {
            const skillInput = document.getElementById('skillInput');
            const skillsContainer = document.getElementById('skillsContainer');

            if (skillInput && skillsContainer) {
                skillInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addSkill(skillInput.value, skillsContainer);
                        skillInput.value = '';
                    }
                });

                skillsContainer.addEventListener('click', (e) => {
                    if (e.target.classList.contains('skill-remove')) {
                        this.removeSkill(e.target.dataset.skill, skillsContainer);
                    }
                });
            }
        }
    }

    /**
     * 处理头像上传
     */
    async handleAvatarUpload(file, previewElement) {
        try {
            // 前端验证
            const rules = VALIDATION_RULES.avatar;

            if (!rules.allowedTypes.includes(file.type)) {
                alert('不支持的文件格式，请使用 JPG、PNG 或 WebP');
                return;
            }

            if (file.size > rules.maxSize) {
                alert('文件大小不能超过 2MB');
                return;
            }

            // 压缩图片
            const compressedFile = await this.compressImage(file, rules.maxWidth, rules.maxHeight);

            // 上传
            const result = await userService.uploadAvatar(compressedFile);

            if (result.success) {
                previewElement.src = result.data.url;
                this.hasUnsavedChanges = true;
            } else {
                alert('上传失败：' + result.message);
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            alert('上传失败：' + error.message);
        }
    }

    /**
     * 压缩图片
     */
    compressImage(file, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // 计算缩放比例
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: file.type }));
                    }, file.type, 0.8);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * 添加技能标签
     */
    addSkill(skill, container) {
        skill = skill.trim();
        if (!skill) return;

        const skills = Array.from(container.querySelectorAll('.skill-tag')).map(el => el.dataset.skill);

        if (skills.length >= 5) {
            alert('最多只能添加5个技能标签');
            return;
        }

        if (skills.includes(skill)) {
            alert('该技能已存在');
            return;
        }

        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.dataset.skill = skill;
        tag.innerHTML = `
            ${this.escapeHtml(skill)}
            <button type="button" class="skill-remove" data-skill="${this.escapeHtml(skill)}">×</button>
        `;

        container.appendChild(tag);
        this.hasUnsavedChanges = true;
    }

    /**
     * 移除技能标签
     */
    removeSkill(skill, container) {
        const tag = container.querySelector(`.skill-tag[data-skill="${this.escapeHtml(skill)}"]`);
        if (tag) {
            tag.remove();
            this.hasUnsavedChanges = true;
        }
    }

    /**
     * 处理表单提交
     */
    async handleSubmit(e) {
        e.preventDefault();

        // 验证表单
        if (!this.validateForm()) {
            return;
        }

        // 收集表单数据
        const formData = this.collectFormData();

        // 禁用提交按钮
        const submitBtn = document.getElementById('saveProfileBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = '保存中...';

        try {
            const updatedUser = await userService.updateUserProfile(formData);

            this.hasUnsavedChanges = false;
            this.close(false);

            // 触发更新事件
            this.dispatchEvent('profile-updated', updatedUser);

            alert('资料保存成功！');
        } catch (error) {
            console.error('Save profile error:', error);
            alert('保存失败：' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '保存';
        }
    }

    /**
     * 验证表单
     */
    validateForm() {
        const nameInput = document.getElementById('userName');
        const websiteInput = document.getElementById('userWebsite');

        // 验证姓名
        if (nameInput) {
            const name = nameInput.value.trim();
            if (name.length < 2 || name.length > 20) {
                alert('姓名长度应为 2-20 个字符');
                nameInput.focus();
                return false;
            }
        }

        // 验证网站
        if (websiteInput && websiteInput.value) {
            const website = websiteInput.value.trim();
            try {
                const url = new URL(website);
                if (!['http:', 'https:'].includes(url.protocol)) {
                    alert('请输入有效的网址（以 http:// 或 https:// 开头）');
                    websiteInput.focus();
                    return false;
                }
            } catch (e) {
                alert('请输入有效的网址');
                websiteInput.focus();
                return false;
            }
        }

        return true;
    }

    /**
     * 收集表单数据
     */
    collectFormData() {
        const formData = {
            extension: {}
        };

        // 基础字段
        const nameInput = document.getElementById('userName');
        if (nameInput) {
            formData.name = nameInput.value.trim();
        }

        const bioInput = document.getElementById('userBio');
        if (bioInput) {
            formData.extension.bio = bioInput.value.trim();
        }

        const locationInput = document.getElementById('userLocation');
        if (locationInput) {
            formData.extension.location = locationInput.value.trim();
        }

        const websiteInput = document.getElementById('userWebsite');
        if (websiteInput) {
            formData.extension.website = websiteInput.value.trim();
        }

        // 客户专用字段
        if (this.role === 'client') {
            const companyNameInput = document.getElementById('companyName');
            const companyCreditCodeInput = document.getElementById('companyCreditCode');
            const titleInput = document.getElementById('userTitle');

            formData.extension.company = {};
            if (companyNameInput) {
                formData.extension.company.name = companyNameInput.value.trim();
            }
            if (companyCreditCodeInput) {
                formData.extension.company.creditCode = companyCreditCodeInput.value.trim();
            }
            if (titleInput) {
                formData.extension.title = titleInput.value.trim();
            }
        }

        // 开发者专用字段
        if (this.role === 'developer') {
            const skillTags = document.querySelectorAll('.skill-tag');
            formData.extension.skills = Array.from(skillTags).map(tag => tag.dataset.skill);
        }

        return formData;
    }

    /**
     * 分发事件
     */
    dispatchEvent(name, data) {
        const event = new CustomEvent(name, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * HTML 转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// Export
// ============================================

export default ProfileEditor;

// Also expose to window for non-module usage
if (typeof window !== 'undefined') {
    window.ProfileEditor = ProfileEditor;
}
