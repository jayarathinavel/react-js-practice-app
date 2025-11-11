import WorklogItem from "./WorklogItem"
import api from "../../api/api"
import PropTypes from "prop-types"

export default function WorklogList({ worklogs, setWorklogs, error }) {
    const handleAddWorklog = async () => {
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
        }
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-semibold mb-0">📅 Work Log</h2>
                <button className="btn btn-sm btn-outline-primary" onClick={handleAddWorklog}>
                    ➕ Add Entry
                </button>
            </div>

            {error && <div className="alert alert-danger text-center">{error}</div>}

            {worklogs.length === 0 ? (
                <p className="text-center text-muted">No work logs yet — start tracking your day!</p>
            ) : (
                <ul className="list-unstyled">
                    {worklogs.map((log) => (
                        <WorklogItem key={log.id} worklog={log} setWorklogs={setWorklogs} />
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
}
