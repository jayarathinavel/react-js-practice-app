import { useState } from "react";
import api from "../../api/api";
import { apiCache, CACHE_KEYS } from "../../utils/apiCache";
import PropTypes from "prop-types";

export default function TaskEditor({ task, field, editingField, setEditingField, setTasks }) {
    const [editValue, setEditValue] = useState(task[field] || "");
    const [saving, setSaving] = useState(false);
    const isWorklogTask = task.reference?.startsWith("worklog-");
    const [originalValue] = useState(task[field] || "");

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.patch(`/task-manager/${task.id}`, { [field]: editValue });
            setTasks(prev =>
                prev.map(t => t.id === task.id ? res.data : t)
            );
            // Invalidate cache after editing a task
            apiCache.clear(CACHE_KEYS.TASKS);
            apiCache.clear(CACHE_KEYS.DASHBOARD);
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
            setEditingField(null);
        }
    };

    const handleKeyDown = (e, isTextarea) => {
        // Escape key - cancel editing without saving
        if (e.key === "Escape") {
            e.preventDefault();
            setEditValue(originalValue);
            setEditingField(null);
            return;
        }

        // Enter key for title (single line)
        if (e.key === "Enter" && !isTextarea) {
            e.preventDefault();
            handleSave();
            return;
        }

        // Ctrl+Enter for description (textarea)
        if (e.key === "Enter" && e.ctrlKey && isTextarea) {
            e.preventDefault();
            handleSave();
            return;
        }
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
            <div className="position-relative">
                <Component
                    type="text"
                    className="form-control form-control-sm mt-2"
                    value={editValue}
                    autoFocus
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={e => handleKeyDown(e, isTextarea)}
                    disabled={saving}
                    style={{ opacity: saving ? 0.6 : 1 }}
                />
                {saving && (
                    <small className="text-muted position-absolute" style={{ top: '100%', left: 0 }}>
                        Saving...
                    </small>
                )}
            </div>
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
