import { useState } from "react"
import ReactMarkdown from "react-markdown"
import api from "../../api/api"
import PropTypes from "prop-types"

export default function WorklogItem({ worklog, setWorklogs }) {
    const [formData, setFormData] = useState({
        done: worklog.done || "",
        todo: worklog.todo || "",
    })

    const [savingField, setSavingField] = useState(null)
    const [editingField, setEditingField] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleAutoSave = async (field) => {
        setSavingField(field)
        try {
            const res = await api.patch(`/work-log/${worklog.id}`, {
                [field]: formData[field],
            })
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

    const handleDelete = async () => {
        if (!globalThis.confirm("Delete this work log entry?")) return
        try {
            await api.delete(`/work-log/${worklog.id}`)
            setWorklogs((prev) => prev.filter((log) => log.id !== worklog.id))
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete work log")
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
                        onKeyDown={(e) => handleTabKey(e, fieldName)}
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
                            <ReactMarkdown>{formData[fieldName]}</ReactMarkdown>
                        ) : (
                            <span className="text-muted">{placeholder}</span>
                        )}
                    </div>
                )}

                {isSaving && <small className="text-muted">Saving...</small>}
            </div>
        )
    }

    return (
        <li className="card mb-3 shadow-sm border-light">
            <div className="card-body">
                <div className="row mb-3">
                    <div className="col-12">
                        <h5 className="fw-bold mb-0">{formatDate(worklog.date)}</h5>
                    </div>
                </div>

                <div className="row">
                    {renderMarkdownField("done", "✅ Done", "What did you complete today?")}
                    {renderMarkdownField("todo", "📋 Todo", "What's next?")}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-secondary">
                        Created: {new Date(worklog.createdAt).toLocaleString()}
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
    )
}

WorklogItem.propTypes = {
    worklog: PropTypes.shape({
        id: PropTypes.number.isRequired,
        date: PropTypes.string.isRequired,
        done: PropTypes.string,
        todo: PropTypes.string,
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
    setWorklogs: PropTypes.func.isRequired,
}
