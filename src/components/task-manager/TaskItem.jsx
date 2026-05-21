import { useState } from "react";
import api from "../../api/api";
import TaskStatusDropdown from "./TaskStatusDropdown";
import TaskEditor from "./TaskEditor";
import { apiCache, CACHE_KEYS } from "../../utils/apiCache";
import PropTypes from "prop-types";

export default function TaskItem({ task, setTasks }) {
    const [editingField, setEditingField] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!globalThis.confirm("Delete this task?")) return;
        setDeleting(true);
        try {
            await api.delete(`/task-manager/${task.id}`);
            setTasks(prev => prev.filter(t => t.id !== task.id));
            // Invalidate cache after deleting a task
            apiCache.clear(CACHE_KEYS.TASKS);
            apiCache.clear(CACHE_KEYS.DASHBOARD);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete task");
            setDeleting(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "pending": return "bg-warning text-dark";
            case "in-progress": return "bg-primary";
            case "completed": return "bg-success";
            case "cancelled": return "bg-danger";
            default: return "bg-secondary";
        }
    };

    const isWorklogTask = task.reference?.startsWith("worklog-");

    return (
        <li className="card mb-3 shadow-sm border-light">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <TaskEditor
                        task={task}
                        field="title"
                        editingField={editingField}
                        setEditingField={setEditingField}
                        setTasks={setTasks}
                    />

                    <TaskStatusDropdown
                        task={task}
                        setTasks={setTasks}
                        getStatusBadgeClass={getStatusBadgeClass}
                    />
                </div>

                <TaskEditor
                    task={task}
                    field="description"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    setTasks={setTasks}
                />

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-secondary">
                        Updated: {new Date(task.updatedAt).toLocaleString()}
                    </small>
                    {
                        isWorklogTask ? (
                            <span
                                className="badge rounded-pill text-bg-secondary"
                                style={{ fontSize: "0.65rem", padding: "0.25em 0.5em" }}
                                title="This task is linked to a worklog and cannot be deleted or edited."
                            >
                                Worklog Task
                            </span>
                        ) : (
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        )
                    }
                </div>
            </div>
        </li>
    );
}

TaskItem.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
        description: PropTypes.string,
        status: PropTypes.string.isRequired,
        reference: PropTypes.string,
        updatedAt: PropTypes.string.isRequired,
    }).isRequired,
    setTasks: PropTypes.func.isRequired,
};