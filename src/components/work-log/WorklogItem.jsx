import { useState } from "react"
import api from "../../api/api"
import PropTypes from "prop-types"

export default function WorklogItem({ worklog, setWorklogs }) {
    const [formData, setFormData] = useState({
        done: worklog.done || "",
        todo: worklog.todo || "",
    })

    const [savingField, setSavingField] = useState(null)

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

    const formatDate = (dateString) => {
        const date = new Date(dateString + "T00:00:00")
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <li className="card mb-3 shadow-sm border-light">
            <div className="card-body">
                {/* Date Header */}
                <div className="row mb-3">
                    <div className="col-12">
                        <h5 className="fw-bold mb-0">{formatDate(worklog.date)}</h5>
                    </div>
                </div>

                {/* Done and Todo Columns */}
                <div className="row">
                    {/* ✅ Done Field */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-dark">✅ Done</label>
                        <textarea
                            className="form-control form-control-sm"
                            name="done"
                            value={formData.done}
                            onChange={handleInputChange}
                            onBlur={() => handleAutoSave("done")}
                            rows="3"
                            placeholder="What did you complete today?"
                            disabled={savingField === "done"}
                            style={{
                                backgroundColor: savingField === "done" ? "#f9f9f9" : "white",
                                opacity: savingField === "done" ? 0.6 : 1,
                            }}
                        />
                        {savingField === "done" && (
                            <small className="text-muted">Saving...</small>
                        )}
                    </div>

                    {/* 📋 Todo Field */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-dark">📋 Todo</label>
                        <textarea
                            className="form-control form-control-sm"
                            name="todo"
                            value={formData.todo}
                            onChange={handleInputChange}
                            onBlur={() => handleAutoSave("todo")}
                            rows="3"
                            placeholder="What's next?"
                            disabled={savingField === "todo"}
                            style={{
                                backgroundColor: savingField === "todo" ? "#f9f9f9" : "white",
                                opacity: savingField === "todo" ? 0.6 : 1,
                            }}
                        />
                        {savingField === "todo" && (
                            <small className="text-muted">Saving...</small>
                        )}
                    </div>
                </div>

                {/* Action Footer */}
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
