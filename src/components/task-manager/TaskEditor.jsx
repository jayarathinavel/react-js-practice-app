import { useState } from "react";
import api from "../../api/api";
import PropTypes from "prop-types";

export default function TaskEditor({ task, field, editingField, setEditingField, setTasks }) {
    const [editValue, setEditValue] = useState(task[field] || "");
    const isWorklogTask = task.reference?.startsWith("worklog-");

    const handleSave = async () => {
        try {
            const res = await api.patch(`/task-manager/${task.id}`, { [field]: editValue });
            setTasks(prev =>
                prev.map(t => t.id === task.id ? res.data : t)
            );
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
        setEditingField(null);
    };

    if (editingField === `${task.id}-${field}`) {
        if (isWorklogTask) return (
            <div
                className={field === "title" ? "fw-semibold" : "text-muted mt-2"}
                title="This field cannot be edited for worklog tasks."
            >
                {task[field] || <em>{field === "title" ? "(Untitled Task)" : "No description"}</em>}
            </div>
        );
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
            style={{ cursor: isWorklogTask ? "not-allowed" : "pointer", width: "75%" }}
            onClick={() => {
                if (!isWorklogTask) setEditingField(`${task.id}-${field}`);
            }}
            title={isWorklogTask ? "This field cannot be edited for worklog tasks." : ""}

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
        reference: PropTypes.string
    }).isRequired,
    field: PropTypes.string.isRequired,
    editingField: PropTypes.string,
    setEditingField: PropTypes.func.isRequired,
    setTasks: PropTypes.func.isRequired,
};
