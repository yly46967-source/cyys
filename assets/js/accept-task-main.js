import authState from './auth-state.js';
import authGuard from './auth-guard.js';
import { initTaskPage } from './task-page-auth.js';
import notification from './notification.js';
import FormValidator from './form-validator.js';

const state = {
    taskId: null,
    task: null,
    application: null,
    isSubmitting: false
};

const elements = {
    loading: document.getElementById('acceptTaskLoading'),
    error: document.getElementById('acceptTaskError'),
    blocked: document.getElementById('acceptTaskBlocked'),
    content: document.getElementById('acceptTaskContent'),
    errorText: document.getElementById('acceptTaskErrorText'),
    blockedTitle: document.getElementById('acceptTaskBlockedTitle'),
    blockedText: document.getElementById('acceptTaskBlockedText'),
    summary: document.getElementById('acceptTaskSummary'),
    form: document.getElementById('acceptTaskForm'),
    submitBtn: document.getElementById('acceptTaskSubmitBtn')
};

function getRepository() {
    if (window.taskRuntimeRepository) {
        return window.taskRuntimeRepository;
    }

    throw new Error('taskRuntimeRepository is not available');
}

function getTaskIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('taskId');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showView(name) {
    elements.loading.classList.add('task-form-hidden');
    elements.error.classList.add('task-form-hidden');
    elements.blocked.classList.add('task-form-hidden');
    elements.content.classList.add('task-form-hidden');
    elements[name].classList.remove('task-form-hidden');
}

function renderTaskSummary(task) {
    const categoryLabel = window.getCategoryInfo?.(task.category)?.label || task.category;

    elements.summary.innerHTML = `
        <div class="task-summary-card">
            <div class="task-preview-header">
                <div>
                    <h2 class="task-preview-title">${escapeHtml(task.title)}</h2>
                    <div class="task-summary-meta">
                        <span class="task-summary-pill">${escapeHtml(categoryLabel)}</span>
                        <span class="task-summary-pill">recruiting</span>
                    </div>
                </div>
            </div>
            <div class="task-summary-block">
                <h3 class="task-summary-block__title">Task summary</h3>
                <p class="task-summary-text">${escapeHtml(task.summary || '')}</p>
            </div>
            <div class="task-summary-block">
                <h3 class="task-summary-block__title">Details</h3>
                <p class="task-summary-text">${escapeHtml(task.description || task.summary || '')}</p>
            </div>
            <div class="task-preview-info">
                <div class="task-preview-info__item">
                    <span class="task-preview-info__label">Budget</span>
                    <strong class="task-preview-info__value">¥${task.budgetMin.toLocaleString()} - ¥${task.budgetMax.toLocaleString()}</strong>
                </div>
                <div class="task-preview-info__item">
                    <span class="task-preview-info__label">Duration</span>
                    <strong class="task-preview-info__value">${task.durationDays} days</strong>
                </div>
                <div class="task-preview-info__item">
                    <span class="task-preview-info__label">Deadline</span>
                    <strong class="task-preview-info__value">${new Date(task.deadline).toLocaleDateString('zh-CN')}</strong>
                </div>
                <div class="task-preview-info__item">
                    <span class="task-preview-info__label">Stacks</span>
                    <strong class="task-preview-info__value">${escapeHtml((task.stacks || []).join(' / '))}</strong>
                </div>
            </div>
        </div>
    `;
}

function showError(message) {
    elements.errorText.textContent = message;
    showView('error');
}

function showBlocked(title, message) {
    elements.blockedTitle.textContent = title;
    elements.blockedText.textContent = message;
    showView('blocked');
}

function showFieldError(fieldName, message) {
    const input = elements.form.querySelector(`[name="${fieldName}"]`);
    if (!input) return;

    input.classList.add('form-input--error');
    let errorElement = input.parentNode.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'form-error';
        input.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function validateFormData(data) {
    FormValidator.clearFormErrors(elements.form);

    const priceResult = FormValidator.validatePositiveInteger(data.quotedPrice, 'Quote');
    const durationResult = FormValidator.validatePositiveInteger(data.estimatedDuration, 'Duration');
    const proposalResult = FormValidator.validateProposal(data.proposal);

    let valid = true;

    if (!priceResult.valid) {
        valid = false;
        showFieldError('quotedPrice', priceResult.message);
    }

    if (!durationResult.valid) {
        valid = false;
        showFieldError('estimatedDuration', durationResult.message);
    }

    if (!proposalResult.valid) {
        valid = false;
        showFieldError('proposal', proposalResult.message);
    }

    return valid;
}

function collectFormData() {
    return {
        quotedPrice: Number(elements.form.quotedPrice.value),
        estimatedDuration: Number(elements.form.estimatedDuration.value),
        proposal: elements.form.proposal.value.trim()
    };
}

async function handleSubmit(event) {
    event.preventDefault();

    if (state.isSubmitting) {
        return;
    }

    const data = collectFormData();
    if (!validateFormData(data)) {
        notification.error('Please fix the form errors first.');
        return;
    }

    state.isSubmitting = true;
    elements.submitBtn.disabled = true;

    try {
        await getRepository().createApplication(state.taskId, data, authState.currentUser);
        if (typeof window.clearTaskCache === 'function') {
            window.clearTaskCache();
        }

        notification.success('Application submitted.');
        window.location.href = `task-detail.html?id=${encodeURIComponent(state.taskId)}&applied=1`;
    } catch (error) {
        console.error('Failed to submit application:', error);
        notification.error(error.message || 'Failed to submit application.');
    } finally {
        state.isSubmitting = false;
        elements.submitBtn.disabled = false;
    }
}

async function initContent() {
    state.taskId = getTaskIdFromUrl();
    if (!state.taskId) {
        showError('Missing taskId parameter.');
        return;
    }

    try {
        state.task = await getRepository().getTaskById(state.taskId);
        if (!state.task) {
            showError('Task not found.');
            return;
        }

        state.application = await getRepository().getCurrentUserApplication(state.taskId, authState.currentUser?.id);

        if (state.task.status !== 'recruiting') {
            showBlocked('Application blocked', 'This task is no longer open for applications.');
            return;
        }

        if (state.application) {
            const statusMap = {
                pending: 'You already submitted an application for this task.',
                accepted: 'Your application has already been accepted.',
                rejected: 'This task already has a processed application for your account.',
                withdrawn: 'This task already has a withdrawn application for your account.'
            };
            showBlocked('Existing application', statusMap[state.application.status] || 'This task already has an application for your account.');
            return;
        }

        renderTaskSummary(state.task);
        elements.form.addEventListener('submit', handleSubmit);
        showView('content');
    } catch (error) {
        console.error('Failed to initialize accept task page:', error);
        showError('Page initialization failed.');
    }
}

function initPage() {
    window.authState = authState;
    if (!authGuard.init()) {
        return;
    }

    initTaskPage({ activePage: 'task-hall' });
    showView('loading');
    initContent();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
