import { useState } from "react";
import TaskItem from "./TaskItem";
import TaskManagerHelp from "./TaskManagerHelp";
import api from "../../api/api";
import { apiCache, CACHE_KEYS } from "../../utils/apiCache";
import PropTypes from "prop-types";

export default function TaskList({ tasks, setTasks, error }) {
    const [addingTask, setAddingTask] = useState(false);

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

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
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

            {error && <div className="alert alert-danger text-center">{error}</div>}

            {tasks.length === 0 ? (
                <p className="text-center text-muted">No tasks yet — create your first one!</p>
            ) : (
                <ul className="list-unstyled">
                    {tasks.map(t => (
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