import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [statusDropdownTask, setStatusDropdownTask] = useState(null);

    const statuses = [
        { value: "pending", label: "Pending" },
        { value: "in-progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
    ];

    // Fetch all tasks
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get("/task-manager");
            setTasks(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch tasks");
        }
    };

    // ADD NEW TASK
    const handleAddTask = async () => {
        try {
            const newTask = {
                title: "",
                description: "",
                status: "in-progress",
            };

            const res = await api.post("/task-manager", newTask);
            setTasks((prev) => [res.data, ...prev]); // Add to top of list

            // Immediately start editing title of the new task
            setEditingTask({ taskId: res.data.id, field: "title" });
            setEditValue("");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add task");
        }
    };

    // Editing handlers
    const handleEditStart = (taskId, field, currentValue) => {
        setEditingTask({ taskId, field });
        setEditValue(currentValue);
    };

    const handleEditCancel = () => {
        setEditingTask(null);
        setEditValue("");
    };

    const handleEditSave = async (taskId) => {
        if (!editingTask) return;
        try {
            await api.patch(`/task-manager/${taskId}`, {
                [editingTask.field]: editValue,
            });

            setTasks((tasks) =>
                tasks.map((t) =>
                    t.id === taskId
                        ? { ...t, [editingTask.field]: editValue, updatedAt: new Date().toISOString() }
                        : t
                )
            );
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
        handleEditCancel();
    };

    // Status change handler
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.patch(`/task-manager/${taskId}`, { status: newStatus });
            setTasks((tasks) =>
                tasks.map((t) =>
                    t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
                )
            );
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
        setStatusDropdownTask(null);
    };

    // Delete task handler
    const handleDelete = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/task-manager/${taskId}`);
            setTasks((tasks) => tasks.filter((t) => t.id !== taskId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete task");
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "pending":
                return "bg-warning text-dark";
            case "in-progress":
                return "bg-primary";
            case "completed":
                return "bg-success";
            default:
                return "bg-secondary";
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <div className="container my-4">
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="fw-semibold mb-0">🗂️ Task Manager</h2>
                            {/* Add Task Button */}
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleAddTask}
                                title="Add a new task"
                            >
                                ➕ Add Task
                            </button>
                        </div>

                        {error && <div className="alert alert-danger text-center">{error}</div>}

                        {tasks.length === 0 ? (
                            <p className="text-center text-muted">
                                No tasks yet — create your first one!
                            </p>
                        ) : (
                            <ul className="list-unstyled">
                                {tasks.map((t) => (
                                    <li key={t.id} className="card mb-3 shadow-sm border-light">
                                        <div className="card-body">
                                            {/* Task title */}
                                            <div className="d-flex justify-content-between align-items-center">
                                                {editingTask?.taskId === t.id && editingTask?.field === "title" ? (
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        style={{ width: "75%" }}
                                                        value={editValue}
                                                        autoFocus
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => handleEditSave(t.id)}
                                                        onKeyDown={(e) => e.key === "Enter" && handleEditSave(t.id)}
                                                    />
                                                ) : (
                                                    <h5
                                                        className="mb-0 fw-semibold text-dark"
                                                        style={{ cursor: "pointer", width: "75%" }}
                                                        onClick={() => handleEditStart(t.id, "title", t.title)}
                                                        title="Click to edit title"
                                                    >
                                                        {t.title || <em>(Untitled Task)</em>}
                                                    </h5>
                                                )}

                                                {/* Status dropdown */}
                                                <div style={{ position: "relative" }}>
                                                    <span
                                                        className={`badge ${getStatusBadgeClass(t.status)} px-2 py-2`}
                                                        style={{ cursor: "pointer", textTransform: "capitalize" }}
                                                        onClick={() => setStatusDropdownTask(t.id)}
                                                        title="Click to change status"
                                                    >
                                                        {t.status.replace("-", " ")}
                                                    </span>

                                                    {statusDropdownTask === t.id && (
                                                        <div
                                                            className="dropdown-menu show shadow"
                                                            style={{
                                                                position: "absolute",
                                                                top: "120%",
                                                                right: 0,
                                                                zIndex: 10,
                                                                minWidth: "140px",
                                                            }}
                                                            onMouseLeave={() => setStatusDropdownTask(null)}
                                                        >
                                                            {statuses.map((s) => (
                                                                <button
                                                                    key={s.value}
                                                                    className={`dropdown-item${
                                                                        t.status === s.value ? " active" : ""
                                                                    }`}
                                                                    onClick={() => handleStatusChange(t.id, s.value)}
                                                                    style={{ textTransform: "capitalize" }}
                                                                >
                                                                    {s.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Task description */}
                                            {editingTask?.taskId === t.id && editingTask?.field === "description" ? (
                                                <textarea
                                                    className="form-control form-control-sm mt-2"
                                                    style={{ width: "75%", resize: "vertical" }}
                                                    value={editValue}
                                                    autoFocus
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => handleEditSave(t.id)}
                                                    onKeyDown={(e) =>
                                                        e.key === "Enter" && !e.shiftKey && handleEditSave(t.id)
                                                    }
                                                />
                                            ) : (
                                                <p
                                                    className="mt-2 mb-0 text-muted"
                                                    style={{ cursor: "pointer", width: "75%" }}
                                                    onClick={() =>
                                                        handleEditStart(t.id, "description", t.description || "")
                                                    }
                                                    title="Click to edit description"
                                                >
                                                    {t.description || <em>No description</em>}
                                                </p>
                                            )}

                                            {/* Footer (Updated date + delete) */}
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <small className="text-secondary">
                                                    Updated: {new Date(t.updatedAt).toLocaleString()}
                                                </small>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(t.id)}
                                                    title="Delete this task"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
