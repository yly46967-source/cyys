/**
 * [FILE] profile-edit-main.js
 * [POS] 用户资料编辑页面主逻辑 - 协调资料编辑功能
 * [IN] URL 参数（from 来源页面）
 * [OUT] DOM 更新、页面跳转、离开拦截
 * [DEP] auth-guard.js, auth-state.js, user-service.js, profile-editor.js, notification.js
 * [SIDE EFFECT] DOM 操作、API 调用、页面跳转
 * [TEST] 测试资料编辑、保存、跳转、离开拦截
 *
 * Profile Edit Page Main Logic
 * ============================================ */

import authGuard from './auth-guard.js';
import authState from './auth-state.js';
import userService from './user-service.js';
import notification from './notification.js';
import './shared-layout.js';

// ============================================
// 资料编辑页面类
// ============================================
class ProfileEditPage {
    constructor() {
        this.container = document.querySelector('.profile-edit-container');
        this.formData = {
            extension: {
                avatar: '',
                bio: '',
                location: '',
                website: '',
                company: { name: '', creditCode: '' },
                title: '',
                skills: []
            }
        };
        this.hasUnsavedChanges = false;
        this.user = null;

        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        try {
            // 1. 路由守卫检查
            if (!authGuard.init()) {
                return; // 未登录，已被重定向
            }

            // 2. 初始化共享布局
            window.authState = authState;
            this.initSharedLayout();

            // 3. 读取来源参数
            const urlParams = new URLSearchParams(window.location.search);
            const from = urlParams.get('from') || 'overview';
            sessionStorage.setItem('profile_edit_from', from);

            // 4. 加载用户数据
            await this.loadUserData();

            // 5. 渲染表单
            this.renderForm();

            // 6. 绑定事件
            this.bindEvents();

            // 7. 设置离开拦截
            this.setupLeaveInterception();

        } catch (error) {
            console.error('Profile edit page init error:', error);
            notification.show('页面加载失败，请刷新重试', 'error');
        }
    }

    /**
     * 初始化共享布局
     */
    initSharedLayout() {
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initNavbar();
                this.initFooter();
            });
        } else {
            this.initNavbar();
            this.initFooter();
        }
    }

    /**
     * 初始化导航栏
     */
    initNavbar() {
        const navbar = document.querySelector('[data-layout="navbar"]');
        if (!navbar) return;

        // 注入当前用户信息
        if (authState.currentUser) {
            navbar.dataset.currentUser = JSON.stringify(authState.currentUser);
        }

        // 触发导航栏渲染（如果有 shared-layout.js）
        if (typeof window.renderNavbar === 'function') {
            window.renderNavbar();
        }
    }

    /**
     * 初始化页脚
     */
    initFooter() {
        const footer = document.querySelector('[data-layout="footer"]');
        if (!footer) return;

        // 触发页脚渲染（如果有 shared-layout.js）
        if (typeof window.renderFooter === 'function') {
            window.renderFooter();
        }
    }

    /**
     * 加载用户数据
     */
    async loadUserData() {
        try {
            this.user = await userService.getUserProfile();

            // 构建表单数据
            this.formData = {
                name: this.user.name || '',
                extension: {
                    avatar: this.user.extension?.avatar || '',
                    bio: this.user.extension?.bio || '',
                    location: this.user.extension?.location || '',
                    website: this.user.extension?.website || '',
                    company: this.user.extension?.company || { name: '', creditCode: '' },
                    title: this.user.extension?.title || '',
                    skills: this.user.extension?.skills || []
                }
            };

        } catch (error) {
            console.error('Load user data error:', error);
            throw error;
        }
    }

    /**
     * 渲染表单
     */
    renderForm() {
        // 填充基本信息
        const nameInput = document.getElementById('name');
        const bioInput = document.getElementById('bio');
        const locationInput = document.getElementById('location');
        const websiteInput = document.getElementById('website');

        if (nameInput) nameInput.value = this.formData.name || '';
        if (bioInput) bioInput.value = this.formData.extension.bio || '';
        if (locationInput) locationInput.value = this.formData.extension.location || '';
        if (websiteInput) websiteInput.value = this.formData.extension.website || '';

        // 渲染头像预览
        this.renderAvatarPreview();

        // 渲染角色专属字段
        this.renderRoleSpecificFields();
    }

    /**
     * 渲染头像预览
     */
    renderAvatarPreview() {
        const avatarPreview = document.getElementById('avatarPreview');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        const avatarUrl = this.formData.extension.avatar;

        if (avatarUrl) {
            avatarPreview.src = avatarUrl;
            avatarPreview.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        } else {
            avatarPreview.style.display = 'none';
            avatarPlaceholder.style.display = 'flex';
        }
    }

    /**
     * 渲染角色专属字段
     */
    renderRoleSpecificFields() {
        const roleSectionTitle = document.getElementById('roleSectionTitle');
        const roleSpecificFields = document.getElementById('roleSpecificFields');
        const role = this.user?.role || 'client';

        if (role === 'client') {
            roleSectionTitle.textContent = '公司信息';
            roleSpecificFields.innerHTML = this.getClientFieldsHTML();
        } else {
            roleSectionTitle.textContent = '专业技能';
            roleSpecificFields.innerHTML = this.getDeveloperFieldsHTML();
        }

        // 重新绑定技能标签事件（如果是开发者）
        if (role === 'developer') {
            this.bindSkillsEvents();
        }
    }

    /**
     * 获取客户字段 HTML
     */
    getClientFieldsHTML() {
        const company = this.formData.extension.company || { name: '', creditCode: '' };

        return `
            <div class="form-group">
                <label for="companyName" class="form-label">公司名称 <span class="required">*</span></label>
                <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    class="form-input"
                    value="${company.name || ''}"
                    required
                    maxlength="100"
                    placeholder="请输入公司名称">
            </div>

            <div class="form-group">
                <label for="creditCode" class="form-label">统一社会信用代码 <span class="required">*</span></label>
                <input
                    type="text"
                    id="creditCode"
                    name="creditCode"
                    class="form-input"
                    value="${company.creditCode || ''}"
                    required
                    maxlength="18"
                    placeholder="请输入统一社会信用代码">
                <span class="form-hint">18 位字符</span>
            </div>
        `;
    }

    /**
     * 获取开发者字段 HTML
     */
    getDeveloperFieldsHTML() {
        const skills = this.formData.extension.skills || [];

        return `
            <div class="form-group">
                <label for="title" class="form-label">职位</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    class="form-input"
                    value="${this.formData.extension.title || ''}"
                    maxlength="50"
                    placeholder="例如：前端开发工程师">
                <span class="form-hint">最多 50 个字符</span>
            </div>

            <div class="form-group">
                <label class="form-label">技能标签</label>
                <div class="skills-input-container">
                    <input
                        type="text"
                        id="skillInput"
                        class="form-input"
                        placeholder="输入技能后按回车添加">
                    <div class="skills-list" id="skillsList">
                        ${skills.map(skill => `
                            <span class="skill-tag" data-skill="${skill}">
                                ${skill}
                                <button type="button" class="skill-remove" data-skill="${skill}">×</button>
                            </span>
                        `).join('')}
                    </div>
                </div>
                <span class="form-hint">输入技能名称后按 Enter 添加</span>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 返回按钮
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.handleBack());
        }

        // 保存按钮
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSave();
            });
        }

        // 取消按钮
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCancel();
            });
        }

        // 表单输入变化监听
        const form = document.getElementById('profileEditForm');
        if (form) {
            form.addEventListener('input', () => {
                this.hasUnsavedChanges = true;
            });
        }

        // 头像上传
        const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
        const avatarInput = document.getElementById('avatarInput');

        if (uploadAvatarBtn && avatarInput) {
            uploadAvatarBtn.addEventListener('click', () => {
                avatarInput.click();
            });

            avatarInput.addEventListener('change', (e) => {
                this.handleAvatarUpload(e);
            });
        }
    }

    /**
     * 绑定技能标签事件
     */
    bindSkillsEvents() {
        const skillInput = document.getElementById('skillInput');
        if (skillInput) {
            skillInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addSkill(skillInput.value.trim());
                    skillInput.value = '';
                }
            });
        }

        const skillRemoveBtns = document.querySelectorAll('.skill-remove');
        skillRemoveBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeSkill(btn.dataset.skill);
            });
        });
    }

    /**
     * 添加技能标签
     */
    addSkill(skill) {
        if (!skill) return;
        if (this.formData.extension.skills.includes(skill)) return;

        this.formData.extension.skills.push(skill);
        this.hasUnsavedChanges = true;
        this.renderSkills();
        this.bindSkillsEvents();
    }

    /**
     * 删除技能标签
     */
    removeSkill(skill) {
        this.formData.extension.skills = this.formData.extension.skills.filter(s => s !== skill);
        this.hasUnsavedChanges = true;
        this.renderSkills();
        this.bindSkillsEvents();
    }

    /**
     * 渲染技能标签
     */
    renderSkills() {
        const skillsList = document.getElementById('skillsList');
        if (!skillsList) return;

        const skills = this.formData.extension.skills || [];
        skillsList.innerHTML = skills.map(skill => `
            <span class="skill-tag" data-skill="${skill}">
                ${skill}
                <button type="button" class="skill-remove" data-skill="${skill}">×</button>
            </span>
        `).join('');
    }

    /**
     * 处理头像上传
     */
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            notification.show('不支持的文件格式，请使用 JPG、PNG 或 WebP', 'error');
            return;
        }

        // 验证文件大小
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            notification.show('文件大小不能超过 2MB', 'error');
            return;
        }

        // 创建本地预览 URL
        const previewUrl = URL.createObjectURL(file);
        this.formData.extension.avatar = previewUrl;
        this.hasUnsavedChanges = true;

        // 更新预览
        this.renderAvatarPreview();

        notification.show('头像已选择，请保存以生效', 'success');
    }

    /**
     * 处理保存
     */
    async handleSave() {
        // 表单验证
        if (!this.validateForm()) {
            return;
        }

        try {
            // 显示加载状态
            const saveBtn = document.getElementById('saveBtn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '保存中...';
            saveBtn.disabled = true;

            // 收集表单数据
            this.collectFormData();

            // 调用 API 保存
            const updatedUser = await userService.updateUserProfile({
                name: this.formData.name,
                extension: this.formData.extension
            });

            // 更新 auth-state
            if (authState.currentUser) {
                authState.currentUser = {
                    ...authState.currentUser,
                    ...updatedUser
                };
            }

            this.hasUnsavedChanges = false;

            // 移除离开拦截
            this.removeLeaveInterception();

            // 显示成功提示
            notification.show('保存成功', 'success');

            // 2秒后返回
            setTimeout(() => {
                this.goBackToProfile();
            }, 2000);

        } catch (error) {
            console.error('Save error:', error);
            notification.show(error.message || '保存失败，请稍后重试', 'error');

            // 恢复按钮状态
            const saveBtn = document.getElementById('saveBtn');
            saveBtn.textContent = '保存';
            saveBtn.disabled = false;
        }
    }

    /**
     * 收集表单数据
     */
    collectFormData() {
        const form = document.getElementById('profileEditForm');
        const formData = new FormData(form);
        const role = this.user?.role || 'client';

        // 基本信息
        this.formData.name = formData.get('name') || '';
        this.formData.extension.bio = formData.get('bio') || '';
        this.formData.extension.location = formData.get('location') || '';
        this.formData.extension.website = formData.get('website') || '';

        // 角色专属字段
        if (role === 'client') {
            this.formData.extension.company = {
                name: formData.get('companyName') || '',
                creditCode: formData.get('creditCode') || ''
            };
        } else {
            this.formData.extension.title = formData.get('title') || '';
        }
    }

    /**
     * 表单验证
     */
    validateForm() {
        const form = document.getElementById('profileEditForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        return true;
    }

    /**
     * 处理取消
     */
    handleCancel() {
        if (this.hasUnsavedChanges) {
            const confirmed = confirm('您有未保存的修改，确定要离开吗？');
            if (!confirmed) {
                return;
            }
        }
        this.goBackToProfile();
    }

    /**
     * 处理返回
     */
    handleBack() {
        this.handleCancel();
    }

    /**
     * 返回用户中心
     */
    goBackToProfile() {
        const user = authState.currentUser;
        const role = user?.role || 'client';
        const from = sessionStorage.getItem('profile_edit_from') || 'overview';

        sessionStorage.removeItem('profile_edit_from');

        window.location.href = `profile-${role}.html#${from}`;
    }

    /**
     * 设置离开拦截
     */
    setupLeaveInterception() {
        // beforeunload 事件（刷新、关闭标签页）
        this.beforeUnloadHandler = (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '您有未保存的修改，确定要离开吗？';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }

    /**
     * 移除离开拦截
     */
    removeLeaveInterception() {
        if (this.beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
        }
    }
}

// ============================================
// 页面初始化
// ============================================
const profileEditPage = new ProfileEditPage();

export default profileEditPage;
