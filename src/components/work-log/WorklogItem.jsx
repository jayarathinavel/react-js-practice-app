import { useState } from "react"
import api from "../../api/api"
import PropTypes from "prop-types"

export default function WorklogItem({ worklog, setWorklogs }) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        done: worklog.done || "",
        todo: worklog.todo || "",
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        try {
            const res = await api.patch(`/work-log/${worklog.id}`, formData)
            setWorklogs((prev) => prev.map((log) => (log.id === worklog.id ? res.data : log)))
            setIsEditing(false)
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update work log")
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
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-dark">✅ Done</label>
                        {isEditing ? (
                            <textarea
                                className="form-control form-control-sm"
                                name="done"
                                value={formData.done}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="What did you complete today?"
                            />
                        ) : (
                            <div className="border rounded p-2 bg-white" style={{ minHeight: "80px" }}>
                                <p className="mb-0 text-muted" style={{ whiteSpace: "pre-wrap" }}>
                                    {formData.done || <em>No entries</em>}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-dark">📋 Todo</label>
                        {isEditing ? (
                            <textarea
                                className="form-control form-control-sm"
                                name="todo"
                                value={formData.todo}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="What's next?"
                            />
                        ) : (
                            <div className="border rounded p-2 bg-white" style={{ minHeight: "80px" }}>
                                <p className="mb-0 text-muted" style={{ whiteSpace: "pre-wrap" }}>
                                    {formData.todo || <em>No entries</em>}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-secondary">Created: {new Date(worklog.createdAt).toLocaleString()}</small>
                    <div>
                        {isEditing ? (
                            <>
                                <button className="btn btn-sm btn-success me-2" onClick={handleSave}>
                                    Save
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                        setFormData({
                                            done: worklog.done || "",
                                            todo: worklog.todo || "",
                                        })
                                        setIsEditing(false)
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setIsEditing(true)}>
                                    Edit
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
                                    Delete
                                </button>
                            </>
                        )}
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
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
    setWorklogs: PropTypes.func.isRequired,
}
