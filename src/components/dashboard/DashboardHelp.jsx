import { useState } from "react"

export default function DashboardHelp() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                className="btn btn-sm btn-outline-info"
                onClick={() => setIsOpen(true)}
                title="Help & Information"
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
                                <h5 className="modal-title">📚 Dashboard Help</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {/* Overview Section */}
                                <h6 className="fw-bold mb-3">📊 Dashboard Overview</h6>
                                <p className="mb-4">
                                    The Dashboard provides a quick overview of your work status, showing pending tasks and recent work logs.
                                </p>

                                {/* Sections Explained */}
                                <h6 className="fw-bold mb-3">📋 Dashboard Sections</h6>
                                <ul className="list-unstyled">
                                    <li className="mb-3">
                                        <strong>📝 Pending Tasks</strong>
                                        <ul className="mt-2 ms-3">
                                            <li>Shows all tasks that are not completed</li>
                                            <li>Includes tasks with "Pending" and "In Progress" status</li>
                                            <li>Status badges: ⏳ Pending, 🚧 In Progress</li>
                                            <li>Click on Task Manager to manage these tasks</li>
                                        </ul>
                                    </li>
                                    <li className="mb-3">
                                        <strong>🚀 What's Planned Today</strong>
                                        <ul className="mt-2 ms-3">
                                            <li>Shows carried-over tasks from your last working day</li>
                                            <li>Also includes today's "Todo" if you've created a log for today</li>
                                            <li>Color-coded: Yellow border for carried-over, Blue border for today's new tasks</li>
                                            <li>Helps you start your day with clear objectives</li>
                                            <li>Sync these items to Task Manager for tracking</li>
                                        </ul>
                                    </li>
                                    <li className="mb-3">
                                        <strong>✅ What Was Done Yesterday</strong>
                                        <ul className="mt-2 ms-3">
                                            <li>Shows the "Done" section from your most recent work log</li>
                                            <li><strong>Smart date handling:</strong> Automatically skips weekends and holidays</li>
                                            <li>On Monday, shows Friday's work (not Sunday's)</li>
                                            <li>After vacation, shows last working day before vacation</li>
                                            <li>Displays contextual labels: "Yesterday", "Last Friday", "X days ago"</li>
                                            <li>Useful for daily standups and status updates</li>
                                        </ul>
                                    </li>
                                </ul>

                                {/* How It Works */}
                                <h6 className="fw-bold mb-3">🔄 How It Works</h6>
                                <div className="alert alert-info mb-3">
                                    <strong>Smart Data Flow:</strong>
                                    <ol className="mb-0 mt-2">
                                        <li>Dashboard fetches all work logs and sorts by date</li>
                                        <li>Finds your most recent work log before today (skips weekends/holidays)</li>
                                        <li>Shows that day's "Done" section as your last accomplishments</li>
                                        <li>Combines that day's "Todo" with today's "Todo" for your current plan</li>
                                        <li>Displays pending tasks from Task Manager</li>
                                    </ol>
                                </div>

                                {/* Smart Date Logic */}
                                <h6 className="fw-bold mb-3">📅 Smart Date Logic</h6>
                                <div className="alert alert-success mb-3">
                                    <strong>Weekend & Holiday Handling:</strong>
                                    <ul className="mb-0 mt-2">
                                        <li><strong>Monday:</strong> Shows Friday's work (automatically skips weekend)</li>
                                        <li><strong>Tuesday-Friday:</strong> Shows previous day's work</li>
                                        <li><strong>After holidays:</strong> Shows last available work log</li>
                                        <li><strong>Gaps in logs:</strong> Automatically finds most recent entry</li>
                                    </ul>
                                </div>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        • <strong>Last Working Day:</strong> Most recent work log before today
                                    </li>
                                    <li className="mb-2">
                                        • <strong>Today:</strong> Current day's work log (if it exists)
                                    </li>
                                    <li className="mb-2">
                                        • <strong>Contextual Labels:</strong> Shows "Yesterday", "Last Friday", or "X days ago"
                                    </li>
                                    <li className="mb-2">
                                        • <strong>No Manual Configuration:</strong> Automatically handles any schedule
                                    </li>
                                </ul>

                                {/* Tips Section */}
                                <h6 className="fw-bold mb-3">💡 Tips</h6>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        • Start your day by reviewing the Dashboard
                                    </li>
                                    <li className="mb-2">
                                        • Use Work Log to document daily progress
                                    </li>
                                    <li className="mb-2">
                                        • Sync work log todos to Task Manager for better tracking
                                    </li>
                                    <li className="mb-2">
                                        • Update task status regularly to keep Dashboard accurate
                                    </li>
                                    <li className="mb-2">
                                        • Dashboard auto-refreshes when you navigate back to it
                                    </li>
                                </ul>

                                {/* Quick Links */}
                                <h6 className="fw-bold mb-3">🔗 Quick Navigation</h6>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        • <strong>Task Manager:</strong> Manage and track all your tasks
                                    </li>
                                    <li className="mb-2">
                                        • <strong>Work Log:</strong> Document daily work and plan ahead
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
