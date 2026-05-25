import api from "../api/api"

export async function fetchTasks() {
    try {
        const res = await api.get("/task-manager");
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to fetch tasks");
    }
}

/**
 * Sort tasks based on the selected sort option
 * @param {Array} tasks - Array of tasks to sort
 * @param {string} sortBy - Sort option: 'newest', 'oldest', 'title', 'status'
 * @returns {Array} Sorted tasks
 */
export function sortTasks(tasks, sortBy) {
    const tasksCopy = [...tasks];
    
    switch (sortBy) {
        case 'newest':
            return tasksCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'oldest':
            return tasksCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'title':
            return tasksCopy.sort((a, b) => {
                const titleA = (a.title || '').toLowerCase();
                const titleB = (b.title || '').toLowerCase();
                return titleA.localeCompare(titleB);
            });
        case 'status':
            // Order: pending -> in-progress -> completed -> cancelled
            const statusOrder = { 'pending': 1, 'in-progress': 2, 'completed': 3, 'cancelled': 4 };
            return tasksCopy.sort((a, b) => {
                return (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
            });
        default:
            return tasksCopy;
    }
}

/**
 * Filter tasks based on status
 * @param {Array} tasks - Array of tasks to filter
 * @param {string} filterStatus - Filter option: 'all', 'pending', 'in-progress', 'completed', 'cancelled', 'hide-completed'
 * @returns {Array} Filtered tasks
 */
export function filterTasks(tasks, filterStatus) {
    switch (filterStatus) {
        case 'all':
            return tasks;
        case 'pending':
            return tasks.filter(task => task.status === 'pending');
        case 'in-progress':
            return tasks.filter(task => task.status === 'in-progress');
        case 'completed':
            return tasks.filter(task => task.status === 'completed');
        case 'cancelled':
            return tasks.filter(task => task.status === 'cancelled');
        case 'hide-completed':
            return tasks.filter(task => task.status !== 'completed');
        default:
            return tasks;
    }
}

/**
 * Apply both sorting and filtering to tasks
 * @param {Array} tasks - Array of tasks
 * @param {string} sortBy - Sort option
 * @param {string} filterStatus - Filter option
 * @returns {Array} Sorted and filtered tasks
 */
export function applySortAndFilter(tasks, sortBy, filterStatus) {
    const filtered = filterTasks(tasks, filterStatus);
    return sortTasks(filtered, sortBy);
}
