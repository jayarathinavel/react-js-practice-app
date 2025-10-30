import { useState } from "react";
import api from "../../api/api";
import TaskStatusDropdown from "./TaskStatusDropdown";
import TaskEditor from "./TaskEditor";
import PropTypes from "prop-types";

export default function TaskItem({ task, setTasks }) {
    const [editingField, setEditingField] = useState(null);

    const handleDelete = async () => {
        if (!globalThis.confirm("Delete this task?")) return;
        try {
            await api.delete(`/task-manager/${task.id}`);
            setTasks(prev => prev.filter(t => t.id !== task.id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete task");
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "pending": return "bg-warning text-dark";
            case "in-progress": return "bg-primary";
            case "completed": return "bg-success";
            default: return "bg-secondary";
        }
    };

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
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
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
        updatedAt: PropTypes.string.isRequired,
    }).isRequired,
    setTasks: PropTypes.func.isRequired,
};