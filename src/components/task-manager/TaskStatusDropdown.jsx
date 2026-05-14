import { useState } from "react";
import api from "../../api/api";
import PropTypes from "prop-types";

export default function TaskStatusDropdown({ task, setTasks, getStatusBadgeClass }) {
    const [open, setOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    const statuses = [
        { value: "pending", label: "Pending" },
        { value: "in-progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
    ];

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await api.patch(`/task-manager/${task.id}`, { status: newStatus });
            setTasks(prev =>
                prev.map(t => t.id === task.id ? res.data : t)
            );
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setUpdating(false);
            setOpen(false);
        }
    };

    return (
        <div style={{ position: "relative" }}>
            <button
                type="button"
                className={`badge ${getStatusBadgeClass(task.status)} dropdown-toggle px-2 py-2 border-0`}
                style={{ cursor: "pointer", textTransform: "capitalize", opacity: updating ? 0.6 : 1 }}
                onClick={() => setOpen(!open)}
                disabled={updating}
            >
                {updating ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Updating...
                    </>
                ) : (
                    task.status.replace("-", " ")
                )}
            </button>

            {open && !updating && (
                <button
                    type="button"
                    className="dropdown-menu show shadow border-0"
                    style={{ position: "absolute", top: "120%", right: 0, zIndex: 10 }}
                    onMouseLeave={() => setOpen(false)}
                >
                    {statuses.map((s) => (
                        <button
                            key={s.value}
                            className={`dropdown-item${task.status === s.value ? " active" : ""}`}
                            onClick={() => handleStatusChange(s.value)}
                        >
                            {s.label}
                        </button>
                    ))}
                </button>
            )}
        </div>
    );
}

TaskStatusDropdown.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
    }).isRequired,
    setTasks: PropTypes.func.isRequired,
    getStatusBadgeClass: PropTypes.func.isRequired,
};
