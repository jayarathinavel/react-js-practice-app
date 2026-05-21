import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import api from "../../api/api"
import { apiCache, CACHE_KEYS } from "../../utils/apiCache"
import PropTypes from "prop-types"
import { createTasksFromWorklog, parseTasksFromTodo } from "../../utils/workLogUtils"
import StatusEmojiPopover from "./StatusEmojiPopover"
import { formatMarkdownForClipboard } from "../../utils/workLogUtils"

export default function WorklogItem({ worklog, setWorklogs, tasks, setTasks, isHighlighted, setHighlightedWorklogId }) {
    const [formData, setFormData] = useState({
        done: worklog.done || "",
        todo: worklog.todo || "",
        date: worklog.date || "",
    })

    const [savingField, setSavingField] = useState(null)
    const [editingField, setEditingField] = useState(null)
    const [taskCreationStatus, setTaskCreationStatus] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const worklogRef = useRef(null)

    useEffect(() => {
        if (isHighlighted && worklogRef.current) {
            // Scroll to the worklog with smooth behavior
            worklogRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
            
            // Clear the highlight after 3 seconds
            const timer = setTimeout(() => {
                if (setHighlightedWorklogId) {
                    setHighlightedWorklogId(null)
                }
            }, 3000)
            
            return () => clearTimeout(timer)
        }
    }, [isHighlighted, setHighlightedWorklogId])

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
            // Invalidate cache after editing worklog
            apiCache.clear(CACHE_KEYS.WORKLOGS)
            apiCache.clear(CACHE_KEYS.DASHBOARD)
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
                // Invalidate all caches after creating tasks
                apiCache.clear(CACHE_KEYS.TASKS)
                apiCache.clear(CACHE_KEYS.WORKLOGS)
                apiCache.clear(CACHE_KEYS.DASHBOARD)
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

        // Invalidate all caches after updating tasks
        if (added.length > 0 || edited.length > 0 || removed.length > 0) {
            apiCache.clear(CACHE_KEYS.TASKS)
            apiCache.clear(CACHE_KEYS.WORKLOGS)
            apiCache.clear(CACHE_KEYS.DASHBOARD)
        }
    };

    const getTaskByTitle = (title) => {
        // Find task that matches the title
        return taskEntries.find(task => {
            const normalizedTaskTitle = task.title.trim().toLowerCase();
            const normalizedTitle = title.trim().toLowerCase();
            return normalizedTaskTitle === normalizedTitle;
        });
    };

    const getEmojiForStatus = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
                return "✅";
            case "in-progress":
                return "🚧";
            case "pending":
            case "todo":
                return "⏳";
            case "cancelled":
                return "❌";
            default:
                return "";
        }
    };

    // Custom renderer for ReactMarkdown to add clickable status emojis
    const customRenderers = {
        li: ({ children, ...props }) => {
            // Extract only the top-level text content (task title), ignoring nested lists (description)
            let textContent = '';
            let textElements = [];
            let nestedElements = [];
            
            if (typeof children === 'string') {
                textContent = children;
                textElements = [children];
            } else if (Array.isArray(children)) {
                // Separate text content from nested lists
                for (const child of children) {
                    if (typeof child === 'string') {
                        if (!textContent) textContent = child;
                        textElements.push(child);
                    } else if (child?.type === 'ul' || child?.type === 'ol') {
                        // This is a nested list (description)
                        nestedElements.push(child);
                    } else if (child?.props?.children && typeof child.props.children === 'string') {
                        if (!textContent) textContent = child.props.children;
                        textElements.push(child);
                    } else {
                        textElements.push(child);
                    }
                }
            } else if (children?.props?.children) {
                if (typeof children.props.children === 'string') {
                    textContent = children.props.children;
                    textElements = [children];
                } else if (Array.isArray(children.props.children)) {
                    // Get first text element from array
                    for (const child of children.props.children) {
                        if (typeof child === 'string') {
                            if (!textContent) textContent = child;
                            textElements.push(child);
                        }
                    }
                }
            }
            
            const task = getTaskByTitle(textContent);
            
            if (task) {
                const emoji = getEmojiForStatus(task.status);
                return (
                    <li {...props}>
                        {textElements}
                        {emoji && (
                            <>
                                {' '}
                                <StatusEmojiPopover
                                    task={task}
                                    setTasks={setTasks}
                                    currentEmoji={emoji}
                                />
                            </>
                        )}
                        {nestedElements}
                    </li>
                );
            }
            
            return <li {...props}>{children}</li>;
        }
    };

    const taskEntries = tasks.filter((task) => task.reference === `worklog-${worklog.id}`)

    const handleDelete = async () => {
        if (!globalThis.confirm("Delete this work log entry?")) return
        setDeleting(true)
        try {
            await api.delete(`/work-log/${worklog.id}`)
            await deleteTasks()
            setWorklogs((prev) => prev.filter((log) => log.id !== worklog.id))
            // Invalidate all caches after deleting worklog
            apiCache.clear(CACHE_KEYS.TASKS)
            apiCache.clear(CACHE_KEYS.WORKLOGS)
            apiCache.clear(CACHE_KEYS.DASHBOARD)
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

    const handleCopyToClipboard = async (fieldName) => {
        const text = formData[fieldName]
        if (!text || !text.trim()) {
            return
        }

        try {
            // Format the text with bullets and emojis
            const formattedText = formatMarkdownForClipboard(
                text,
                fieldName === "todo" ? taskEntries : []
            )
            
            await navigator.clipboard.writeText(formattedText)
            
            // Show toast notification
            setShowToast(true)
            setTimeout(() => {
                setShowToast(false)
            }, 2000)
        } catch (err) {
            console.error("Failed to copy to clipboard:", err)
            alert("Failed to copy to clipboard")
        }
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
                    <div style={{ position: "relative", paddingBottom: "4px" }}>
                        <div
                            className="border rounded p-2 bg-light"
                            onClick={() => setEditingField(fieldName)}
                            style={{ cursor: "pointer", minHeight: "80px", paddingBottom: "32px" }}
                        >
                            {formData[fieldName] ? (
                                <ReactMarkdown components={fieldName === "todo" && taskEntries.length > 0 ? customRenderers : {}}>
                                    {formData[fieldName]}
                                </ReactMarkdown>
                            ) : (
                                <span className="text-muted">{placeholder}</span>
                            )}
                        </div>
                        {!isEditing && formData[fieldName] && (
                            <button
                                className="btn btn-link p-0"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopyToClipboard(fieldName)
                                }}
                                title="Copy to clipboard"
                                style={{
                                    position: "absolute",
                                    bottom: "12px",
                                    right: "12px",
                                    background: "none",
                                    border: "none",
                                    color: "#6c757d",
                                    opacity: "0.6",
                                    transition: "all 0.2s",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = "1"
                                    e.currentTarget.style.color = "#495057"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = "0.6"
                                    e.currentTarget.style.color = "#6c757d"
                                }}
                            >
                                <svg width="16" height="16"  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 8V5.2C8 4.0799 8 3.51984 8.21799 3.09202C8.40973 2.71569 8.71569 2.40973 9.09202 2.21799C9.51984 2 10.0799 2 11.2 2H18.8C19.9201 2 20.4802 2 20.908 2.21799C21.2843 2.40973 21.5903 2.71569 21.782 3.09202C22 3.51984 22 4.0799 22 5.2V12.8C22 13.9201 22 14.4802 21.782 14.908C21.5903 15.2843 21.2843 15.5903 20.908 15.782C20.4802 16 19.9201 16 18.8 16H16M5.2 22H12.8C13.9201 22 14.4802 22 14.908 21.782C15.2843 21.5903 15.5903 21.2843 15.782 20.908C16 20.4802 16 19.9201 16 18.8V11.2C16 10.0799 16 9.51984 15.782 9.09202C15.5903 8.71569 15.2843 8.40973 14.908 8.21799C14.4802 8 13.9201 8 12.8 8H5.2C4.0799 8 3.51984 8 3.09202 8.21799C2.71569 8.40973 2.40973 8.71569 2.21799 9.09202C2 9.51984 2 10.0799 2 11.2V18.8C2 19.9201 2 20.4802 2.21799 20.908C2.40973 21.2843 2.71569 21.5903 3.09202 21.782C3.51984 22 4.07989 22 5.2 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {isSaving && <small className="text-muted">Saving...</small>}
                {(taskCreationStatus && fieldName === "todo") && <small className="text-success ms-2">{taskCreationStatus}</small>}
            </div>
        )
    }

    return (
        <>
            <li
                ref={worklogRef}
                className={`card mb-3 shadow-sm ${isHighlighted ? 'border-warning border-3' : 'border-light'}`}
                style={{
                    transition: 'all 0.3s ease',
                    backgroundColor: isHighlighted ? '#fff9e6' : 'white'
                }}
            >
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
                        {taskEntries.length ? (<span className="text-success m-2" style={{ fontSize: "12px" }}>Tasks Synced</span>) :
                            (<button
                                className="btn btn-sm btn-outline-primary m-2"
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
                            className="btn btn-sm btn-outline-danger m-2"
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
        
        {/* Toast notification */}
        {showToast && (
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 9999,
                    fontSize: '14px',
                    fontWeight: '500',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}
            >
                ✓ Copied to clipboard
            </div>
        )}
    </>
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
    setTasks: PropTypes.func.isRequired,
    isHighlighted: PropTypes.bool,
    setHighlightedWorklogId: PropTypes.func,
}

