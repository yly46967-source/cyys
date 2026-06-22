/**
 * My Tasks Data Service Layer
 * ============================================
 */

import authState from './auth-state.js';

function getRepository() {
    if (typeof window !== 'undefined' && window.taskRuntimeRepository) {
        return window.taskRuntimeRepository;
    }

    throw new Error('taskRuntimeRepository is not available');
}

function clearTaskCacheIfNeeded() {
    if (typeof window !== 'undefined' && typeof window.clearTaskCache === 'function') {
        window.clearTaskCache();
    }
}

class MyTasksService {
    async getMyTasks(params = {}) {
        const repository = getRepository();
        const currentUser = authState.currentUser;
        const role = params.role || currentUser?.role || 'client';
        const status = params.status;
        const page = params.page || 1;
        const limit = params.limit || 10;

        await new Promise(resolve => setTimeout(resolve, 120));

        let tasks = await repository.getProfileTasks(role, currentUser);

        if (status && status !== 'all') {
            tasks = tasks.filter(task => {
                if (role === 'client') {
                    return task.status === status;
                }

                return task.developerExtension?.applicationStatus === status ||
                    (status === 'completed' && task.status === 'closed');
            });
        }

        const start = (page - 1) * limit;
        const paginatedTasks = tasks.slice(start, start + limit);

        return {
            tasks: paginatedTasks,
            pagination: {
                page,
                limit,
                total: tasks.length,
                totalPages: Math.ceil(tasks.length / limit) || 1
            }
        };
    }

    async closeTask(taskId) {
        const repository = getRepository();
        await new Promise(resolve => setTimeout(resolve, 120));

        const task = await repository.closeTask(taskId);
        clearTaskCacheIfNeeded();

        return {
            success: true,
            data: {
                task,
                message: '任务已关闭'
            }
        };
    }

    async applyForTask(taskId, data) {
        const repository = getRepository();
        await new Promise(resolve => setTimeout(resolve, 120));

        const application = await repository.createApplication(taskId, data, authState.currentUser);
        clearTaskCacheIfNeeded();

        return {
            success: true,
            data: {
                application,
                message: '申请已提交'
            }
        };
    }

    async withdrawApplication(taskId) {
        const repository = getRepository();
        await new Promise(resolve => setTimeout(resolve, 120));

        const application = await repository.withdrawApplication(taskId, authState.currentUser?.id);
        clearTaskCacheIfNeeded();

        return {
            success: true,
            data: {
                application,
                message: '申请已撤回'
            }
        };
    }

    async toggleFavorite(taskId, isFavorite) {
        const repository = getRepository();
        await new Promise(resolve => setTimeout(resolve, 80));

        const favorites = repository.toggleFavorite(taskId, authState.currentUser?.id, isFavorite);

        return {
            success: true,
            data: {
                favorites,
                isFavorite,
                message: isFavorite ? '已收藏' : '已取消收藏'
            }
        };
    }
}

const myTasksService = new MyTasksService();
export default myTasksService;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = myTasksService;
}
