import { useState } from "react"
import ReactMarkdown from "react-markdown"
import api from "../../api/api"
import PropTypes from "prop-types"
import { createTasksFromWorklog, parseTasksFromTodo } from "../../utils/workLogUtils"

export default function WorklogItem({ worklog, setWorklogs, tasks, setTasks }) {
    const [formData, setFormData] = useState({
        done: worklog.done || "",
        todo: worklog.todo || "",
        date: worklog.date || "",
    })

    const [savingField, setSavingField] = useState(null)
    const [editingField, setEditingField] = useState(null)
    const [taskCreationStatus, setTaskCreationStatus] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleKeyDown = (e, field) => {
        // Escape key - cancel editing without saving
        if (e.key === "Escape") {
            e.preventDefault()
            // Restore original value
            setFormData((prev) => ({
                ...prev,
                [field]: worklog[field] || "",
            }))
            setEditingField(null)
            return
        }

        // Ctrl+Enter - save and exit
        if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault()
            handleAutoSave(field)
            return
        }

        // Handle Tab key for indentation
        handleTabKey(e, field)
    }

    const handleAutoSave = async (field) => {
        setSavingField(field)
        try {
            const res = await api.patch(`/work-log/${worklog.id}`, {
                [field]: formData[field],
            })
            if (field === "todo" && taskEntries.length > 0) {
                await updateTasks()
            }
            setWorklogs((prev) =>
                prev.map((log) => (log.id === worklog.id ? res.data : log))
            )
        } catch (err) {
            alert(err.response?.data?.message || `Failed to update ${field}`)
        } finally {
            setSavingField(null)
            setEditingField(null)
        }
    }

    const createTasks = async () => {
        setTaskCreationStatus("creating")
        try {
            const createdTasks = await createTasksFromWorklog(formData.todo, worklog.id)
            if (createdTasks.length > 0) {
                setTasks(prev => [...prev, ...createdTasks])
                setTaskCreationStatus(`created ${createdTasks.length} task(s)`)
                setTimeout(() => setTaskCreationStatus(null), 3000)
            }
        } catch (err) {
            console.error("Error creating tasks:", err)
            setTaskCreationStatus(null)
        }
    }

    const deleteTasks = async () => {
        for (const task of taskEntries) {
            try {
                await api.delete(`/task-manager/${task.id}`)
            } catch (err) {
                console.error("Error deleting task:", err)
            }
        }
    }

    const updateTasks = async () => {
        const parsedTasks = parseTasksFromTodo(formData.todo);

        const added = [];
        const edited = [];
        const removed = [];

        const maxLength = Math.max(taskEntries.length, parsedTasks.length);

        for (let i = 0; i < maxLength; i++) {
            const oldTask = taskEntries[i];
            const newTask = parsedTasks[i];

            // Case 1: New task added (exists in new, not in old)
            if (!oldTask && newTask) {
                newTask.reference = `worklog-${worklog.id}`;
                added.push(newTask);
                continue;
            }

            // Case 2: Task removed (exists in old, not in new)
            if (oldTask && !newTask) {
                removed.push(oldTask);
                continue;
            }

            // Case 3: Both exist at same index — check if edited
            if (
                oldTask &&
                newTask &&
                (oldTask.title !== newTask.title || oldTask.description !== newTask.description)
            ) {
                //TODO: Keep the status unchanged when editing, also check for created time
                edited.push({ old: oldTask, new: newTask });
            }
        }

        for (const addedTask of added) {
            try {
                const res = await api.post("/task-manager", addedTask);
                setTasks((prev) => [...prev, res.data]);
                setTaskCreationStatus(`created task "${addedTask.title}"`);
                setTimeout(() => setTaskCreationStatus(null), 3000)
            } catch (err) {
                console.error("Error adding task:", err);
            }
        }

        for (const editedTask of edited) {
            try {
                const res = await api.patch(`/task-manager/${editedTask.old.id}`, editedTask.new);
                setTasks((prev) =>
                    prev.map((task) => (task.id === res.data.id ? res.data : task))
                );
                setTaskCreationStatus(`updated task "${editedTask.new.title}"`);
                setTimeout(() => setTaskCreationStatus(null), 3000)
            } catch (err) {
                console.error("Error editing task:", err);
            }
        }

        for (const removedTask of removed) {
            try {
                await api.delete(`/task-manager/${removedTask.id}`);
                setTasks((prev) => prev.filter((task) => task.id !== removedTask.id));
                setTaskCreationStatus(`deleted task "${removedTask.title}"`);
                setTimeout(() => setTaskCreationStatus(null), 3000)
            } catch (err) {
                console.error("Error deleting task:", err);
            }
        }
    };

    const applyTaskStatusEmojis = (text) => {
        if (!text) return "";
        let formattedText = text;

        for (const task of taskEntries) {
            let emoji = "";
            switch (task.status?.toLowerCase()) {
                case "completed":
                    emoji = " ✅";
                    break;
                case "in-progress":
                    emoji = " 🚧";
                    break;
                case "pending":
                case "todo":
                    emoji = " ⏳";
                    break;
                default:
                    continue;
            }

            // Escape regex special characters in the task title
            const escapedTitle = task.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            // Match task line (handles bullets, numbering, etc.)
            const regex = new RegExp(`(^|\\n)([-*]\\s*)(${escapedTitle})(\\s|$)`, "gi");

            // Append emoji at end of the title if not already there
            formattedText = formattedText.replace(regex, (match, p1, p2, p3, p4) => {
                if (match.includes(emoji)) return match; // Avoid duplicates
                return `${p1}${p2}${p3}${emoji}${p4}`;
            });
        }

        return formattedText;
    };

    const taskEntries = tasks.filter((task) => task.reference === `worklog-${worklog.id}`)

    const handleDelete = async () => {
        if (!globalThis.confirm("Delete this work log entry?")) return
        setDeleting(true)
        try {
            await api.delete(`/work-log/${worklog.id}`)
            await deleteTasks()
            setWorklogs((prev) => prev.filter((log) => log.id !== worklog.id))
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete work log")
            setDeleting(false)
        }
    }

    const handleTabKey = (e, field) => {
        if (e.key === "Tab") {
            e.preventDefault()
            const textarea = e.target
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const value = formData[field]
            const lines = value.split("\n")

            const startLine = value.substring(0, start).split("\n").length - 1
            const endLine = value.substring(0, end).split("\n").length - 1

            for (let i = startLine; i <= endLine; i++) {
                if (e.shiftKey) {
                    // Unindent
                    if (lines[i].startsWith("\t")) lines[i] = lines[i].substring(1)
                    else if (lines[i].startsWith("    ")) lines[i] = lines[i].substring(4)
                } else {
                    // Indent
                    lines[i] = "\t" + lines[i]
                }
            }

            const newValue = lines.join("\n")
            setFormData((prev) => ({ ...prev, [field]: newValue }))

            requestAnimationFrame(() => {
                textarea.selectionStart = start + (e.shiftKey ? -1 : 1)
                textarea.selectionEnd = end + (e.shiftKey ? -1 : 1)
            })
        }
    }


    const formatDate = (dateString) => {
        const date = new Date(dateString + "T00:00:00")
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const renderMarkdownField = (fieldName, label, placeholder) => {
        const isEditing = editingField === fieldName
        const isSaving = savingField === fieldName

        return (
            <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-dark">{label}</label>

                {isEditing ? (
                    <textarea
                        className="form-control form-control-sm"
                        name={fieldName}
                        value={formData[fieldName]}
                        onChange={handleInputChange}
                        onBlur={() => handleAutoSave(fieldName)}
                        onKeyDown={(e) => handleKeyDown(e, fieldName)}
                        rows="5"
                        placeholder={placeholder}
                        disabled={isSaving}
                        style={{
                            backgroundColor: isSaving ? "#f9f9f9" : "white",
                            opacity: isSaving ? 0.6 : 1,
                        }}
                        autoFocus
                    />
                ) : (
                    <div
                        className="border rounded p-2 bg-light"
                        onClick={() => setEditingField(fieldName)}
                        style={{ cursor: "pointer", minHeight: "80px" }}
                    >
                        {formData[fieldName] ? (
                            <ReactMarkdown>
                                {fieldName === "todo" ? applyTaskStatusEmojis(formData[fieldName]) : formData[fieldName]}
                            </ReactMarkdown>
                        ) : (
                            <span className="text-muted">{placeholder}</span>
                        )}
                    </div>
                )}

                {isSaving && <small className="text-muted">Saving...</small>}
                {(taskCreationStatus && fieldName === "todo") && <small className="text-success ms-2">{taskCreationStatus}</small>}
            </div>
        )
    }

    return (
        <li className="card mb-3 shadow-sm border-light">
            <div className="card-body">
                <div className="row mb-3">
                    <div className="col-12">
                        {editingField === "date" ? (
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                onBlur={() => handleAutoSave("date")}
                                disabled={savingField === "date"}
                                style={{
                                    backgroundColor: savingField === "date" ? "#f9f9f9" : "white",
                                    opacity: savingField === "date" ? 0.6 : 1,
                                    maxWidth: "200px",
                                }}
                                autoFocus
                            />
                        ) : (
                            <h5
                                className="fw-bold mb-0"
                                onClick={() => setEditingField("date")}
                                style={{ cursor: "pointer" }}
                                title="Click to edit date"
                            >
                                {formatDate(formData.date)}
                            </h5>
                        )}
                        {savingField === "date" && <small className="text-muted ms-2">Saving...</small>}
                    </div>
                </div>

                <div className="row">
                    {renderMarkdownField("done", "✅ Done", "What did you complete today?")}
                    {renderMarkdownField("todo", "📋 Todo", "What's next?")}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-secondary">
                        Updated: {new Date(worklog.updatedAt).toLocaleString()}
                    </small>
                    <div>
                        {taskEntries.length ? (<span className="text-success me-2" style={{ fontSize: "12px" }}>Tasks Synced</span>) :
                            (<button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={createTasks}
                                title="Sync Tasks to Task Manager"
                                disabled={taskCreationStatus === "creating"}
                            >
                                {taskCreationStatus === "creating" ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Syncing...
                                    </>
                                ) : (
                                    'Sync Tasks'
                                )}
                            </button>)
                        }
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
                    </div>
                </div>
            </div>
        </li>
    )
}

WorklogItem.propTypes = {
    worklog: PropTypes.shape({
        id: PropTypes.number.isRequired,
        date: PropTypes.string.isRequired,
        done: PropTypes.string,
        todo: PropTypes.string,
        updatedAt: PropTypes.string.isRequired,
    }).isRequired,
    setWorklogs: PropTypes.func.isRequired,
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string,
            description: PropTypes.string,
            status: PropTypes.string.isRequired,
        })
    ).isRequired,
    setTasks: PropTypes.func.isRequired
}
