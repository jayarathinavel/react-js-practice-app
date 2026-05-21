import { useState, useEffect } from "react";
import api from "../../api/api";
import { apiCache, CACHE_KEYS } from "../../utils/apiCache";
import PropTypes from "prop-types";

export default function StatusEmojiPopover({ task, setTasks, currentEmoji }) {
    const [open, setOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Handle Escape key to close popover
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && open) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [open]);

    const statusOptions = [
        { value: "pending", label: "Pending", emoji: "⏳" },
        { value: "in-progress", label: "In Progress", emoji: "🚧" },
        { value: "completed", label: "Completed", emoji: "✅" },
        { value: "cancelled", label: "Cancelled", emoji: "❌" },
    ];

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await api.patch(`/task-manager/${task.id}`, { status: newStatus });
            setTasks(prev =>
                prev.map(t => t.id === task.id ? res.data : t)
            );
            // Invalidate all caches after changing task status
            apiCache.clear(CACHE_KEYS.TASKS);
            apiCache.clear(CACHE_KEYS.WORKLOGS);
            apiCache.clear(CACHE_KEYS.DASHBOARD);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status");
        } finally {
            setUpdating(false);
            setOpen(false);
        }
    };

    return (
        <span style={{ position: "relative", display: "inline-block" }}>
            <span
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                style={{
                    cursor: "pointer",
                    fontSize: "1.1em",
                    padding: "0 2px",
                    opacity: updating ? 0.5 : 1,
                    userSelect: "none",
                }}
                title={`Click to change status (current: ${task.status})`}
            >
                {updating ? "⏱️" : currentEmoji}
            </span>

            {open && !updating && (
                <>
                    {/* Backdrop to close popover when clicking outside */}
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                        }}
                    />
                    
                    {/* Popover */}
                    <div
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            marginTop: "4px",
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            padding: "8px",
                            zIndex: 1000,
                            minWidth: "120px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "4px", textAlign: "center" }}>
                            Change Status
                        </div>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            {statusOptions.map((status) => (
                                <button
                                    key={status.value}
                                    onClick={() => handleStatusChange(status.value)}
                                    style={{
                                        background: task.status === status.value ? "#e3f2fd" : "transparent",
                                        border: task.status === status.value ? "2px solid #2196f3" : "1px solid #ddd",
                                        borderRadius: "6px",
                                        padding: "6px",
                                        cursor: "pointer",
                                        fontSize: "1.3em",
                                        transition: "all 0.2s",
                                    }}
                                    title={status.label}
                                    onMouseEnter={(e) => {
                                        if (task.status !== status.value) {
                                            e.currentTarget.style.backgroundColor = "#f5f5f5";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (task.status !== status.value) {
                                            e.currentTarget.style.backgroundColor = "transparent";
                                        }
                                    }}
                                >
                                    {status.emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </span>
    );
}

StatusEmojiPopover.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
    }).isRequired,
    setTasks: PropTypes.func.isRequired,
    currentEmoji: PropTypes.string.isRequired,
};

// Made with Bob
