import { useState, useMemo, useEffect } from "react";
import TaskItem from "./TaskItem";
import TaskManagerHelp from "./TaskManagerHelp";
import api from "../../api/api";
import { apiCache, CACHE_KEYS } from "../../utils/apiCache";
import { applySortAndFilter } from "../../utils/taskMangerUtils";
import PropTypes from "prop-types";

const STORAGE_KEYS = {
    SORT_BY: 'taskManager_sortBy',
    FILTER_STATUS: 'taskManager_filterStatus'
};

export default function TaskList({ tasks, setTasks, error }) {
    const [addingTask, setAddingTask] = useState(false);
    
    // Initialize state from localStorage or use defaults
    const [sortBy, setSortBy] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.SORT_BY) || 'newest';
    });
    
    const [filterStatus, setFilterStatus] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.FILTER_STATUS) || 'hide-completed';
    });

    // Persist sortBy to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SORT_BY, sortBy);
    }, [sortBy]);

    // Persist filterStatus to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.FILTER_STATUS, filterStatus);
    }, [filterStatus]);

    const handleAddTask = async () => {
        setAddingTask(true);
        try {
            const newTask = { title: "", description: "", status: "pending" };
            const res = await api.post("/task-manager", newTask);
            setTasks(prev => [res.data, ...prev]);
            // Invalidate cache after adding a task
            apiCache.clear(CACHE_KEYS.TASKS);
            apiCache.clear(CACHE_KEYS.DASHBOARD);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add task");
        } finally {
            setAddingTask(false);
        }
    };

    // Apply sorting and filtering
    const displayedTasks = useMemo(() => {
        return applySortAndFilter(tasks, sortBy, filterStatus);
    }, [tasks, sortBy, filterStatus]);

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-semibold mb-0">📋 Task Manager</h2>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleAddTask}
                        disabled={addingTask}
                    >
                        {addingTask ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Adding...
                            </>
                        ) : (
                            <>📝 Add Task</>
                        )}
                    </button>
                    <TaskManagerHelp />
                </div>
            </div>

            {/* Compact Sorting and Filtering Controls */}
            <div className="d-flex gap-2 mb-4 flex-wrap align-items-center">
                <div className="d-flex align-items-center gap-2 bg-light rounded px-3 py-2 border">
                    <span className="text-muted small" style={{ fontSize: '0.85rem' }}>🔄 Sort:</span>
                    <select
                        className="form-select form-select-sm border-0 bg-transparent"
                        style={{ width: 'auto', fontSize: '0.85rem', padding: '0.25rem 1.5rem 0.25rem 0.5rem' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort tasks"
                    >
                        <option value="newest">⬇️ Newest</option>
                        <option value="oldest">⬆️ Oldest</option>
                        <option value="title">🔤 Title</option>
                        <option value="status">📊 Status</option>
                    </select>
                </div>
                
                <div className="d-flex align-items-center gap-2 bg-light rounded px-3 py-2 border">
                    <span className="text-muted small" style={{ fontSize: '0.85rem' }}>🔍 Filter:</span>
                    <select
                        className="form-select form-select-sm border-0 bg-transparent"
                        style={{ width: 'auto', fontSize: '0.85rem', padding: '0.25rem 1.5rem 0.25rem 0.5rem' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        aria-label="Filter tasks by status"
                    >
                        <option value="all">📋 All</option>
                        <option value="hide-completed">👁️ Hide Completed</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="in-progress">🔄 In Progress</option>
                        <option value="completed">✅ Completed</option>
                        <option value="cancelled">❌ Cancelled</option>
                    </select>
                </div>

                {/* Task count indicator */}
                <span className="text-muted small ms-auto" style={{ fontSize: '0.85rem' }}>
                    {displayedTasks.length} {displayedTasks.length === 1 ? 'task' : 'tasks'}
                </span>
            </div>

            {error && <div className="alert alert-danger text-center">{error}</div>}

            {displayedTasks.length === 0 ? (
                <p className="text-center text-muted">
                    {tasks.length === 0
                        ? "No tasks yet — create your first one!"
                        : "No tasks match the current filters."}
                </p>
            ) : (
                <ul className="list-unstyled">
                    {displayedTasks.map(t => (
                        <TaskItem key={t.id} task={t} setTasks={setTasks} />
                    ))}
                </ul>
            )}
        </>
    );
}

TaskList.propTypes = {
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string,
            description: PropTypes.string,
            status: PropTypes.string,
            updatedAt: PropTypes.string,
        })
    ).isRequired,
    setTasks: PropTypes.func.isRequired,
    error: PropTypes.string,
};