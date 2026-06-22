import authState from './auth-state.js';
import authGuard from './auth-guard.js';
import { initTaskPage } from './task-page-auth.js';
import notification from './notification.js';
import FormValidator from './form-validator.js';

const state = {
    isSubmitting: false,
    draftData: null
};

const elements = {
    form: document.getElementById('createTaskForm'),
    editor: document.getElementById('createTaskEditor'),
    preview: document.getElementById('createTaskPreview'),
    category: document.getElementById('createTaskCategory'),
    deliveryMode: document.getElementById('createTaskDeliveryMode'),
    stackOptions: document.getElementById('createTaskStacks'),
    requirementsList: document.getElementById('requirementsList'),
    deliverablesList: document.getElementById('deliverablesList'),
    previewBtn: document.getElementById('createTaskPreviewBtn'),
    editBtn: document.getElementById('createTaskEditBtn'),
    publishBtn: document.getElementById('createTaskPublishBtn'),
    cancelBtn: document.getElementById('createTaskCancelBtn'),
    addRequirementBtn: document.getElementById('addRequirementBtn'),
    addDeliverableBtn: document.getElementById('addDeliverableBtn'),
    stackError: document.getElementById('createTaskStacksError'),
    requirementsError: document.getElementById('requirementsError'),
    deliverablesError: document.getElementById('deliverablesError'),
    previewTitle: document.getElementById('previewTaskTitle'),
    previewSummary: document.getElementById('previewTaskSummary'),
    previewDescription: document.getElementById('previewTaskDescription'),
    previewMeta: document.getElementById('previewTaskMeta'),
    previewStacks: document.getElementById('previewTaskStacks'),
    previewRequirements: document.getElementById('previewTaskRequirements'),
    previewDeliverables: document.getElementById('previewTaskDeliverables'),
    previewBudget: document.getElementById('previewTaskBudget'),
    previewDuration: document.getElementById('previewTaskDuration'),
    previewDeadline: document.getElementById('previewTaskDeadline'),
    previewDeliveryMode: document.getElementById('previewTaskDeliveryMode')
};

function getRepository() {
    if (window.taskRuntimeRepository) {
        return window.taskRuntimeRepository;
    }

    throw new Error('taskRuntimeRepository is not available');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getOptionLabel(options, value) {
    const option = options.find(item => item.value === value);
    return option?.label || value;
}

function getFormOptions() {
    return {
        categories: window.CATEGORY_OPTIONS || [],
        stacks: window.STACK_OPTIONS || [],
        deliveryModes: window.DELIVERY_MODE_OPTIONS || []
    };
}

function renderSelectOptions() {
    const { categories, deliveryModes, stacks } = getFormOptions();

    elements.category.innerHTML = categories.map(option => (
        `<option value="${option.value}">${option.label}</option>`
    )).join('');

    elements.deliveryMode.innerHTML = deliveryModes.map(option => (
        `<option value="${option.value}">${option.label}</option>`
    )).join('');

    elements.stackOptions.innerHTML = stacks.map(option => `
        <label class="task-form-check">
            <input type="checkbox" name="stacks" value="${option.value}">
            <span>${option.label}</span>
        </label>
    `).join('');
}

function createListRow(type, value = '') {
    const placeholder = type === 'requirements' ? 'Requirement item' : 'Deliverable item';

    return `
        <div class="task-form-list-row">
            <input
                type="text"
                class="form-input"
                data-list-input="${type}"
                value="${escapeHtml(value)}"
                placeholder="${placeholder}"
            >
            <button type="button" class="btn btn-secondary" data-remove-list-item="${type}">Remove</button>
        </div>
    `;
}

function renderList(type, values = ['']) {
    const container = type === 'requirements' ? elements.requirementsList : elements.deliverablesList;
    container.innerHTML = values.map(value => createListRow(type, value)).join('');
}

function readListValues(type) {
    return Array.from(document.querySelectorAll(`[data-list-input="${type}"]`))
        .map(input => input.value.trim())
        .filter(Boolean);
}

function collectFormData() {
    return {
        title: elements.form.title.value.trim(),
        category: elements.form.category.value,
        summary: elements.form.summary.value.trim(),
        description: elements.form.description.value.trim(),
        stacks: Array.from(elements.form.querySelectorAll('input[name="stacks"]:checked')).map(input => input.value),
        deliveryMode: elements.form.deliveryMode.value,
        budgetMin: Number(elements.form.budgetMin.value),
        budgetMax: Number(elements.form.budgetMax.value),
        durationDays: Number(elements.form.durationDays.value),
        deadline: elements.form.deadline.value,
        requirements: readListValues('requirements'),
        deliverables: readListValues('deliverables')
    };
}

function clearCustomErrors() {
    elements.stackError.textContent = '';
    elements.requirementsError.textContent = '';
    elements.deliverablesError.textContent = '';
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
    clearCustomErrors();

    const fieldChecks = [
        ['title', FormValidator.validateTaskTitle(data.title)],
        ['summary', FormValidator.validateTaskSummary(data.summary)],
        ['description', FormValidator.validateTaskDescription(data.description)],
        ['budgetMin', FormValidator.validatePositiveInteger(data.budgetMin, 'Budget min')],
        ['budgetMax', FormValidator.validatePositiveInteger(data.budgetMax, 'Budget max')],
        ['durationDays', FormValidator.validatePositiveInteger(data.durationDays, 'Duration')],
        ['deadline', FormValidator.validateFutureDate(data.deadline)]
    ];

    let valid = true;

    fieldChecks.forEach(([field, result]) => {
        if (!result.valid) {
            valid = false;
            showFieldError(field, result.message);
        }
    });

    const budgetRangeCheck = FormValidator.validateBudgetRange(data.budgetMin, data.budgetMax);
    if (!budgetRangeCheck.valid) {
        valid = false;
        showFieldError('budgetMax', budgetRangeCheck.message);
    }

    if (!data.category) {
        valid = false;
        showFieldError('category', 'Category is required');
    }

    if (!data.deliveryMode) {
        valid = false;
        showFieldError('deliveryMode', 'Delivery mode is required');
    }

    const stackCheck = FormValidator.validateStringArray(data.stacks, 'Stack', 1);
    if (!stackCheck.valid) {
        valid = false;
        elements.stackError.textContent = stackCheck.message;
    }

    const requirementsCheck = FormValidator.validateStringArray(data.requirements, 'Requirements', 1);
    if (!requirementsCheck.valid) {
        valid = false;
        elements.requirementsError.textContent = requirementsCheck.message;
    }

    const deliverablesCheck = FormValidator.validateStringArray(data.deliverables, 'Deliverables', 1);
    if (!deliverablesCheck.valid) {
        valid = false;
        elements.deliverablesError.textContent = deliverablesCheck.message;
    }

    return valid;
}

function renderPreview(data) {
    const { categories, deliveryModes, stacks } = getFormOptions();

    elements.previewTitle.textContent = data.title;
    elements.previewSummary.textContent = data.summary;
    elements.previewDescription.textContent = data.description;
    elements.previewBudget.textContent = `¥${data.budgetMin.toLocaleString()} - ¥${data.budgetMax.toLocaleString()}`;
    elements.previewDuration.textContent = `${data.durationDays} days`;
    elements.previewDeadline.textContent = new Date(data.deadline).toLocaleDateString('zh-CN');
    elements.previewDeliveryMode.textContent = getOptionLabel(deliveryModes, data.deliveryMode);
    elements.previewMeta.innerHTML = `
        <span class="task-preview-pill">${getOptionLabel(categories, data.category)}</span>
        <span class="task-preview-pill">recruiting</span>
    `;
    elements.previewStacks.innerHTML = data.stacks
        .map(value => `<span class="task-preview-tag">${escapeHtml(getOptionLabel(stacks, value))}</span>`)
        .join('');
    elements.previewRequirements.innerHTML = data.requirements.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    elements.previewDeliverables.innerHTML = data.deliverables.map(item => `<li>${escapeHtml(item)}</li>`).join('');
}

function showEditor() {
    elements.editor.classList.remove('task-form-hidden');
    elements.preview.classList.add('task-form-hidden');
}

function showPreview() {
    elements.editor.classList.add('task-form-hidden');
    elements.preview.classList.remove('task-form-hidden');
}

function getBackTarget() {
    if (document.referrer) {
        try {
            const ref = new URL(document.referrer);
            if (ref.origin === window.location.origin) {
                return ref.pathname + ref.search + ref.hash;
            }
        } catch (error) {
            console.warn('Invalid referrer:', error);
        }
    }

    return 'task-hall.html';
}

function handleCancel() {
    window.location.href = getBackTarget();
}

function handlePreview() {
    const data = collectFormData();

    if (!validateFormData(data)) {
        notification.error('Please fix the form errors first.');
        return;
    }

    state.draftData = data;
    renderPreview(data);
    showPreview();
}

async function handlePublish() {
    if (!state.draftData || state.isSubmitting) {
        return;
    }

    state.isSubmitting = true;
    elements.publishBtn.disabled = true;

    try {
        const createdTask = await getRepository().createTask(state.draftData, authState.currentUser);
        if (typeof window.clearTaskCache === 'function') {
            window.clearTaskCache();
        }

        notification.success('Task created.');
        window.location.href = `task-detail.html?id=${encodeURIComponent(createdTask.id)}&from=create`;
    } catch (error) {
        console.error('Failed to create task:', error);
        notification.error(error.message || 'Failed to publish task.');
    } finally {
        state.isSubmitting = false;
        elements.publishBtn.disabled = false;
    }
}

function bindEvents() {
    elements.previewBtn.addEventListener('click', handlePreview);
    elements.editBtn.addEventListener('click', showEditor);
    elements.publishBtn.addEventListener('click', handlePublish);
    elements.cancelBtn.addEventListener('click', handleCancel);
    elements.addRequirementBtn.addEventListener('click', () => {
        elements.requirementsList.insertAdjacentHTML('beforeend', createListRow('requirements'));
    });
    elements.addDeliverableBtn.addEventListener('click', () => {
        elements.deliverablesList.insertAdjacentHTML('beforeend', createListRow('deliverables'));
    });

    document.addEventListener('click', event => {
        const removeType = event.target.dataset.removeListItem;
        if (!removeType) return;

        const container = removeType === 'requirements' ? elements.requirementsList : elements.deliverablesList;
        const rows = container.querySelectorAll('.task-form-list-row');
        if (rows.length <= 1) {
            const input = rows[0]?.querySelector('input');
            if (input) input.value = '';
            return;
        }

        event.target.closest('.task-form-list-row')?.remove();
    });
}

function initDeadlineMin() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    elements.form.deadline.min = `${yyyy}-${mm}-${dd}`;
}

function initPage() {
    window.authState = authState;
    if (!authGuard.init()) {
        return;
    }

    initTaskPage({ activePage: 'task-hall' });
    renderSelectOptions();
    renderList('requirements');
    renderList('deliverables');
    initDeadlineMin();
    bindEvents();
    showEditor();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
