import { useState } from "react"

export default function TaskManagerHelp() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                className="btn btn-sm btn-outline-info"
                onClick={() => setIsOpen(true)}
                title="Help & Keyboard Shortcuts"
            >
                ❓
            </button>

            {isOpen && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">📚 Task Manager Help</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {/* Keyboard Shortcuts Section */}
                                <h6 className="fw-bold mb-3">⌨️ Keyboard Shortcuts</h6>
                                <table className="table table-sm table-bordered mb-4">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: "40%" }}>Shortcut</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <kbd>Escape</kbd>
                                            </td>
                                            <td>Exit editing mode without saving</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <kbd>Enter</kbd>
                                            </td>
                                            <td>Save title and exit editing mode</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
                                            </td>
                                            <td>Save description and exit editing mode</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* How to Use Section */}
                                <h6 className="fw-bold mb-3">📝 How to Use</h6>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        <strong>📝 Add Task:</strong> Click the "Add Task" button to create a new task with default "Pending" status.
                                    </li>
                                    <li className="mb-2">
                                        <strong>✏️ Edit Task:</strong> Click on the task title or description to edit. Changes auto-save when you click outside or press the appropriate shortcut.
                                    </li>
                                    <li className="mb-2">
                                        <strong>🔄 Change Status:</strong> Click the status badge to open a dropdown menu with available statuses:
                                        <ul className="mt-2 ms-3">
                                            <li><span className="badge bg-warning text-dark">Pending</span> - Task not started yet</li>
                                            <li><span className="badge bg-primary">In Progress</span> - Currently working on it</li>
                                            <li><span className="badge bg-success">Completed</span> - Task finished</li>
                                        </ul>
                                    </li>
                                    <li className="mb-2">
                                        <strong>🔗 Worklog Tasks:</strong> Tasks created from Work Log are marked with a "Worklog Task" badge and have special properties:
                                        <ul className="mt-2 ms-3">
                                            <li>Title and description cannot be edited (edit in Work Log instead)</li>
                                            <li>Status can be changed to track progress</li>
                                            <li>Cannot be deleted (delete from Work Log)</li>
                                            <li>Automatically sync with Work Log entries</li>
                                        </ul>
                                    </li>
                                    <li className="mb-2">
                                        <strong>🗑️ Delete Task:</strong> Click "Delete" to remove a task (not available for worklog tasks).
                                    </li>
                                </ul>

                                {/* Task Workflow Section */}
                                <h6 className="fw-bold mb-3">🔄 Task Workflow</h6>
                                <div className="alert alert-info mb-3">
                                    <strong>Recommended Flow:</strong>
                                    <ol className="mb-0 mt-2">
                                        <li>Create tasks manually or sync from Work Log</li>
                                        <li>Update status as you work: Pending → In Progress → Completed</li>
                                        <li>Edit title/description as needed (for manual tasks)</li>
                                        <li>Delete completed tasks or keep them for reference</li>
                                    </ol>
                                </div>

                                {/* Tips Section */}
                                <h6 className="fw-bold mb-3">💡 Tips</h6>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        • Use Work Log to plan daily tasks, then sync them to Task Manager
                                    </li>
                                    <li className="mb-2">
                                        • Update task status regularly to track your progress
                                    </li>
                                    <li className="mb-2">
                                        • Worklog tasks automatically update when you edit them in Work Log
                                    </li>
                                    <li className="mb-2">
                                        • Press <kbd>Escape</kbd> to quickly cancel editing without saving
                                    </li>
                                    <li className="mb-2">
                                        • Keep task titles concise and use descriptions for details
                                    </li>
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// Made with Bob
