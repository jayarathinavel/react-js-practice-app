import { useState } from "react";
import api from "../../api/api";
import PropTypes from "prop-types";

export default function TaskEditor({ task, field, editingField, setEditingField, setTasks }) {
    const [editValue, setEditValue] = useState(task[field] || "");

    const handleSave = async () => {
        try {
            await api.patch(`/task-manager/${task.id}`, { [field]: editValue });
            setTasks(prev =>
                prev.map(t => t.id === task.id ? { ...t, [field]: editValue } : t)
            );
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
        setEditingField(null);
    };

    if (editingField === `${task.id}-${field}`) {
        const isTextarea = field === "description";
        const Component = isTextarea ? "textarea" : "input";

        return (
            <Component
                type="text"
                className="form-control form-control-sm mt-2"
                value={editValue}
                autoFocus
                onChange={e => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={e => e.key === "Enter" && handleSave()}
            />
        );
    }

    return (
        <div
            className={field === "title" ? "fw-semibold" : "text-muted mt-2"}
            style={{ cursor: "pointer", width: "75%" }}
            onClick={() => setEditingField(`${task.id}-${field}`)}
        >
            {task[field] || <em>{field === "title" ? "(Untitled Task)" : "No description"}</em>}
        </div>
    );
}

TaskEditor.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
        description: PropTypes.string,
        status: PropTypes.string.isRequired,
        updatedAt: PropTypes.string.isRequired,
    }).isRequired,
    field: PropTypes.string.isRequired,
    editingField: PropTypes.string,
    setEditingField: PropTypes.func.isRequired,
    setTasks: PropTypes.func.isRequired,
};
