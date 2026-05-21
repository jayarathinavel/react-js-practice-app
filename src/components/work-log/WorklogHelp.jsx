import { useState } from "react"

export default function WorklogHelp() {
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
                                <h5 className="modal-title">📚 Work Log Help</h5>
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
                                                <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
                                            </td>
                                            <td>Save and exit editing mode</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <kbd>Tab</kbd>
                                            </td>
                                            <td>Indent selected lines</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <kbd>Shift</kbd> + <kbd>Tab</kbd>
                                            </td>
                                            <td>Unindent selected lines</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* How to Use Section */}
                                <h6 className="fw-bold mb-3">📝 How to Use</h6>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        <strong>➕ Add Log:</strong> Click the "Add Log" button to create a new work log entry for today.
                                    </li>
                                    <li className="mb-2">
                                        <strong>✏️ Edit Fields:</strong> Click on any field (Date, Done, Todo) to start editing. Changes auto-save when you click outside or press <kbd>Ctrl</kbd> + <kbd>Enter</kbd>.
                                    </li>
                                    <li className="mb-2">
                                        <strong>📋 Markdown Support:</strong> Use markdown formatting in Done and Todo fields:
                                        <ul className="mt-2 ms-3">
                                            <li><code>**bold**</code> for <strong>bold text</strong></li>
                                            <li><code>*italic*</code> for <em>italic text</em></li>
                                            <li><code>- item</code> for bullet lists</li>
                                            <li><code>1. item</code> for numbered lists</li>
                                            <li><code>`code`</code> for inline code</li>
                                        </ul>
                                    </li>
                                    <li className="mb-2">
                                        <strong>🔄 Sync Tasks:</strong> Click "Sync Tasks" to create tasks in Task Manager from your Todo list. Tasks are automatically linked to the work log.
                                    </li>
                                    <li className="mb-2">
                                        <strong>✅ Task Status:</strong> Once synced, task status emojis appear next to todo items:
                                        <ul className="mt-2 ms-3">
                                            <li>⏳ Pending/Todo</li>
                                            <li>🚧 In Progress</li>
                                            <li>✅ Completed</li>
                                            <li>❌ Cancelled</li>
                                        </ul>
                                    </li>
                                    <li className="mb-2">
                                        <strong>🔄 Change Status:</strong> Click on any status emoji to open a popover with other status options. Select a new status to update the task directly from the worklog.
                                    </li>
                                    <li className="mb-2">
                                        <strong>️ Delete:</strong> Click "Delete" to remove a work log entry and all associated tasks.
                                    </li>
                                </ul>

                                {/* Tips Section */}
                                <h6 className="fw-bold mb-3">💡 Tips</h6>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        • Use bullet points (<code>-</code>) in Todo field for better task tracking
                                    </li>
                                    <li className="mb-2">
                                        • Click status emojis to quickly change task status without leaving the worklog
                                    </li>
                                    <li className="mb-2">
                                        • You can also edit synced tasks directly in Task Manager to update their status
                                    </li>
                                    <li className="mb-2">
                                        • Changes to synced todo items automatically update linked tasks
                                    </li>
                                    <li className="mb-2">
                                        • Press <kbd>Escape</kbd> to quickly exit editing without saving changes
                                    </li>
                                    <li className="mb-2">
                                        • Work logs are cached for faster loading - click the 🔄 button at the bottom right to refresh manually
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
