/**
 * [FILE] task-runtime-repository.js
 * [POS] 任务运行时仓储 - 统一管理任务与申请的种子数据、运行时增量和本地持久化
 * [IN] tasks.mock.json, task-applications.mock.json, 当前登录用户、表单提交数据
 * [OUT] 统一任务/申请查询结果
 * [DEP] fetch, localStorage
 * [SIDE EFFECT] 读写 localStorage
 * [TEST] 校验创建任务、创建申请、关闭任务、收藏同步与刷新恢复
 *
 * Task Runtime Repository
 * ============================================
 */

(function () {
    const STORAGE_KEYS = {
        TASKS: 'techcraft_runtime_tasks',
        APPLICATIONS: 'techcraft_runtime_task_applications',
        FAVORITES: 'techcraft_runtime_task_favorites',
        VERSION: 'techcraft_runtime_task_version'
    };

    let seedTasksPromise = null;
    let seedApplicationsPromise = null;
    let memoryVersion = Number(localStorage.getItem(STORAGE_KEYS.VERSION) || '0');

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function safeParse(value, fallback) {
        if (!value) return fallback;

        try {
            return JSON.parse(value);
        } catch (error) {
            console.error('[TaskRuntimeRepository] Failed to parse JSON:', error);
            return fallback;
        }
    }

    async function loadSeedTasks() {
        if (!seedTasksPromise) {
            seedTasksPromise = fetch('./mock-data/tasks.mock.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load tasks seed: ${response.status}`);
                    }
                    return response.json();
                })
                .then(tasks => tasks.map(task => ({
                    ...task,
                    source: 'seed'
                })))
                .catch(error => {
                    seedTasksPromise = null;
                    throw error;
                });
        }

        return clone(await seedTasksPromise);
    }

    async function loadSeedApplications() {
        if (!seedApplicationsPromise) {
            seedApplicationsPromise = fetch('./mock-data/task-applications.mock.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load applications seed: ${response.status}`);
                    }
                    return response.json();
                })
                .then(applications => applications.map(application => ({
                    ...application,
                    source: 'seed'
                })))
                .catch(error => {
                    seedApplicationsPromise = null;
                    throw error;
                });
        }

        return clone(await seedApplicationsPromise);
    }

    function getRuntimeTasks() {
        return safeParse(localStorage.getItem(STORAGE_KEYS.TASKS), []);
    }

    function saveRuntimeTasks(tasks) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        bumpVersion();
    }

    function getRuntimeApplications() {
        return safeParse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS), []);
    }

    function saveRuntimeApplications(applications) {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
        bumpVersion();
    }

    function getFavoriteMap() {
        return safeParse(localStorage.getItem(STORAGE_KEYS.FAVORITES), {});
    }

    function saveFavoriteMap(favorites) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        bumpVersion();
    }

    function bumpVersion() {
        memoryVersion += 1;
        localStorage.setItem(STORAGE_KEYS.VERSION, String(memoryVersion));
    }

    function getVersion() {
        const storedVersion = Number(localStorage.getItem(STORAGE_KEYS.VERSION) || '0');
        if (storedVersion > memoryVersion) {
            memoryVersion = storedVersion;
        }
        return memoryVersion;
    }

    function invalidate() {
        bumpVersion();
    }

    async function getAllTasks() {
        const [seedTasks, runtimeTasks] = await Promise.all([
            loadSeedTasks(),
            Promise.resolve(getRuntimeTasks())
        ]);

        return [...seedTasks, ...clone(runtimeTasks)];
    }

    async function getTaskById(taskId) {
        if (!taskId) return null;

        const tasks = await getAllTasks();
        return clone(tasks.find(task => task.id === taskId) || null);
    }

    async function getAllApplications() {
        const [seedApplications, runtimeApplications] = await Promise.all([
            loadSeedApplications(),
            Promise.resolve(getRuntimeApplications())
        ]);

        return [...seedApplications, ...clone(runtimeApplications)];
    }

    async function getApplicationsByTaskId(taskId) {
        const applications = await getAllApplications();
        return applications
            .filter(application => application.taskId === taskId)
            .sort((a, b) => new Date(b.appliedAt || b.createdAt || 0) - new Date(a.appliedAt || a.createdAt || 0));
    }

    async function getCurrentUserApplication(taskId, userId) {
        if (!taskId || !userId) return null;

        const applications = await getApplicationsByTaskId(taskId);
        return applications.find(application =>
            application.applicantUserId === userId || application.applicantId === userId
        ) || null;
    }

    function buildPublisherName(currentUser) {
        return currentUser?.extension?.company?.name || currentUser?.name || '未命名客户';
    }

    function buildPublisher(task) {
        return task.publisher || {
            id: task.publisherUserId || 'publisher-runtime',
            name: task.clientName || '未命名客户',
            avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TC',
            verified: false,
            rating: null,
            reviewCount: 0,
            publishedCount: 0,
            completionRate: 0
        };
    }

    async function createTask(payload, currentUser) {
        const runtimeTasks = getRuntimeTasks();
        const now = new Date().toISOString();
        const publisherName = buildPublisherName(currentUser);
        const nextTask = {
            id: `task-runtime-${Date.now()}`,
            title: payload.title,
            clientName: publisherName,
            summary: payload.summary,
            category: payload.category,
            stacks: clone(payload.stacks || []),
            deliveryMode: payload.deliveryMode,
            budgetMin: payload.budgetMin,
            budgetMax: payload.budgetMax,
            durationDays: payload.durationDays,
            deadline: payload.deadline,
            status: 'recruiting',
            updatedAt: now,
            description: payload.description,
            requirements: clone(payload.requirements || []),
            deliverables: clone(payload.deliverables || []),
            publishedAt: now,
            publisherUserId: currentUser?.id || null,
            publisher: {
                id: currentUser?.id || `publisher-${Date.now()}`,
                name: publisherName,
                avatar: currentUser?.avatar || currentUser?.extension?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Client',
                verified: currentUser?.realNameStatus === 'verified',
                rating: currentUser?.stats?.rating || null,
                reviewCount: 0,
                publishedCount: (currentUser?.stats?.postedTasks || 0) + 1,
                completionRate: 0
            },
            source: 'runtime'
        };

        runtimeTasks.unshift(nextTask);
        saveRuntimeTasks(runtimeTasks);

        return clone(nextTask);
    }

    async function createApplication(taskId, payload, currentUser) {
        const task = await getTaskById(taskId);
        if (!task) {
            throw new Error('任务不存在');
        }

        if (task.status !== 'recruiting') {
            throw new Error('当前任务不可申请');
        }

        const existingApplication = await getCurrentUserApplication(taskId, currentUser?.id);
        if (existingApplication) {
            throw new Error('您已提交过该任务的申请');
        }

        const runtimeApplications = getRuntimeApplications();
        const nextApplication = {
            id: `app-runtime-${Date.now()}`,
            taskId,
            applicantId: currentUser?.id || `applicant-${Date.now()}`,
            applicantUserId: currentUser?.id || null,
            applicantName: currentUser?.name || '未命名开发者',
            applicantAvatar: currentUser?.avatar || currentUser?.extension?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Developer',
            status: 'pending',
            proposal: payload.proposal,
            estimatedDuration: payload.estimatedDuration,
            quotedPrice: payload.quotedPrice,
            appliedAt: new Date().toISOString(),
            taskStatusSnapshot: task.status,
            source: 'runtime'
        };

        runtimeApplications.unshift(nextApplication);
        saveRuntimeApplications(runtimeApplications);

        return clone(nextApplication);
    }

    async function closeTask(taskId) {
        const runtimeTasks = getRuntimeTasks();
        const runtimeIndex = runtimeTasks.findIndex(task => task.id === taskId);
        const now = new Date().toISOString();

        if (runtimeIndex >= 0) {
            runtimeTasks[runtimeIndex] = {
                ...runtimeTasks[runtimeIndex],
                status: 'closed',
                updatedAt: now
            };
            saveRuntimeTasks(runtimeTasks);
            return clone(runtimeTasks[runtimeIndex]);
        }

        const seedTask = await getTaskById(taskId);
        if (!seedTask) {
            throw new Error('任务不存在');
        }

        const shadowTask = {
            ...seedTask,
            status: 'closed',
            updatedAt: now,
            source: 'runtime-shadow'
        };

        runtimeTasks.unshift(shadowTask);
        saveRuntimeTasks(runtimeTasks);

        return clone(shadowTask);
    }

    async function withdrawApplication(taskId, userId) {
        const runtimeApplications = getRuntimeApplications();
        const runtimeIndex = runtimeApplications.findIndex(application =>
            application.taskId === taskId && application.applicantUserId === userId
        );

        if (runtimeIndex >= 0) {
            runtimeApplications[runtimeIndex] = {
                ...runtimeApplications[runtimeIndex],
                status: 'withdrawn'
            };
            saveRuntimeApplications(runtimeApplications);
            return clone(runtimeApplications[runtimeIndex]);
        }

        const existing = await getCurrentUserApplication(taskId, userId);
        if (!existing) {
            throw new Error('未找到可撤回的申请');
        }

        const withdrawnShadow = {
            ...existing,
            id: `app-runtime-withdrawn-${Date.now()}`,
            applicantUserId: userId,
            status: 'withdrawn',
            source: 'runtime-shadow'
        };

        runtimeApplications.unshift(withdrawnShadow);
        saveRuntimeApplications(runtimeApplications);
        return clone(withdrawnShadow);
    }

    function getFavoriteTaskIds(userId) {
        const favoriteMap = getFavoriteMap();
        return clone(favoriteMap[userId] || []);
    }

    function toggleFavorite(taskId, userId, isFavorite) {
        const favoriteMap = getFavoriteMap();
        const favoriteIds = new Set(favoriteMap[userId] || []);

        if (isFavorite) {
            favoriteIds.add(taskId);
        } else {
            favoriteIds.delete(taskId);
        }

        favoriteMap[userId] = Array.from(favoriteIds);
        saveFavoriteMap(favoriteMap);
        return favoriteMap[userId];
    }

    function buildTaskSummary(task) {
        return {
            budget: {
                min: task.budgetMin,
                max: task.budgetMax
            },
            description: task.description || task.summary || '',
            skills: clone(task.stacks || [])
        };
    }

    async function getOwnedClientTasks(currentUser) {
        const tasks = await getAllTasks();
        const companyName = currentUser?.extension?.company?.name;
        const ownedTasks = tasks.filter(task =>
            task.publisherUserId === currentUser?.id ||
            (companyName && task.clientName === companyName) ||
            task.publisher?.id === currentUser?.id
        );

        return ownedTasks;
    }

    async function getDeveloperTaskRelations(currentUser) {
        const [tasks, applications] = await Promise.all([getAllTasks(), getAllApplications()]);
        const matchedApplications = applications.filter(application =>
            application.applicantUserId === currentUser?.id || application.applicantId === currentUser?.id
        );

        return matchedApplications
            .map(application => {
                const task = tasks.find(item => item.id === application.taskId);
                if (!task) return null;
                return {
                    task,
                    application
                };
            })
            .filter(Boolean);
    }

    async function getProfileTasks(role, currentUser) {
        if (role === 'client') {
            const ownedTasks = await getOwnedClientTasks(currentUser);
            const applications = await getAllApplications();

            return ownedTasks.map(task => {
                const taskApplications = applications.filter(application => application.taskId === task.id);
                return {
                    id: task.id,
                    title: task.title,
                    ...buildTaskSummary(task),
                    status: task.status,
                    createdAt: task.publishedAt || task.updatedAt,
                    deadline: task.deadline,
                    clientExtension: {
                        applicationsCount: taskApplications.length,
                        unreadApplications: 0,
                        hiredDeveloperId: null,
                        hiredDeveloperName: null,
                        milestonesCompleted: 0,
                        totalMilestones: 0,
                        version: 1,
                        canEdit: task.status === 'recruiting',
                        canClose: task.status !== 'closed',
                        canReopen: false
                    }
                };
            });
        }

        const relations = await getDeveloperTaskRelations(currentUser);
        const favoriteIds = new Set(getFavoriteTaskIds(currentUser?.id));

        return relations.map(({ task, application }) => ({
            id: task.id,
            title: task.title,
            ...buildTaskSummary(task),
            status: task.status,
            createdAt: task.publishedAt || task.updatedAt,
            deadline: task.deadline,
            developerExtension: {
                applicationStatus: application.status,
                applicationDate: application.appliedAt,
                proposedBudget: application.quotedPrice,
                proposedDuration: application.estimatedDuration,
                coverLetter: application.proposal,
                isFavorite: favoriteIds.has(task.id),
                canWithdraw: application.status === 'pending',
                canMarkComplete: application.status === 'accepted' && task.status === 'in-progress',
                version: 1
            }
        }));
    }

    const repository = {
        STORAGE_KEYS,
        getVersion,
        invalidate,
        getAllTasks,
        getTaskById,
        getAllApplications,
        getApplicationsByTaskId,
        getCurrentUserApplication,
        createTask,
        createApplication,
        closeTask,
        withdrawApplication,
        getFavoriteTaskIds,
        toggleFavorite,
        getProfileTasks,
        buildPublisher
    };

    window.taskRuntimeRepository = repository;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = repository;
    }
})();
