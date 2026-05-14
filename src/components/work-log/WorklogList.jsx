import { useState } from "react"
import WorklogItem from "./WorklogItem"
import api from "../../api/api"
import PropTypes from "prop-types"

export default function WorklogList({ worklogs, setWorklogs, tasks, setTasks, error }) {
    const [addingWorklog, setAddingWorklog] = useState(false)

    const handleAddWorklog = async () => {
        setAddingWorklog(true)
        try {
            const newWorklog = {
                date: new Date().toISOString().split("T")[0],
                done: "",
                todo: "",
            }
            const res = await api.post("/work-log", newWorklog)
            setWorklogs((prev) => [res.data, ...prev])
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add work log entry")
        } finally {
            setAddingWorklog(false)
        }
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-semibold mb-0">📅 Work Log</h2>
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleAddWorklog}
                    disabled={addingWorklog}
                >
                    {addingWorklog ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Adding...
                        </>
                    ) : (
                        <>➕ Add Log</>
                    )}
                </button>
            </div>

            {error && <div className="alert alert-danger text-center">{error}</div>}

            {worklogs.length === 0 ? (
                <p className="text-center text-muted">No work logs yet — start tracking your day!</p>
            ) : (
                <ul className="list-unstyled">
                    {worklogs.map((log) => (
                        <WorklogItem key={log.id} worklog={log} setWorklogs={setWorklogs} tasks={tasks} setTasks={setTasks} />
                    ))}
                </ul>
            )}
        </>
    )
}

WorklogList.propTypes = {
    worklogs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            date: PropTypes.string.isRequired,
            done: PropTypes.string,
            todo: PropTypes.string,
            createdAt: PropTypes.string,
        }),
    ).isRequired,
    setWorklogs: PropTypes.func.isRequired,
    error: PropTypes.string,
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string,
            description: PropTypes.string,
            status: PropTypes.string.isRequired,
            updatedAt: PropTypes.string.isRequired,
        }),
    ).isRequired,
    setTasks: PropTypes.func.isRequired,
}
