import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import Navbar from "../../components/Navbar"
import WorklogList from "../../components/work-log/WorklogList"
import api from "../../api/api"
import { fetchTasks } from "../../utils/taskMangerUtils"
import { apiCache, CACHE_KEYS } from "../../utils/apiCache"

export default function WorkLog() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [worklogs, setWorklogs] = useState([])
    const [tasks, setTasks] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [highlightedWorklogId, setHighlightedWorklogId] = useState(null)

    useEffect(() => {
        fetchWorklogs()
    }, [])

    useEffect(() => {
        // Check if there's a worklogId in the URL
        const worklogId = searchParams.get('worklogId')
        if (worklogId) {
            setHighlightedWorklogId(parseInt(worklogId, 10))
            // Clear the query parameter after a short delay
            setTimeout(() => {
                setSearchParams({})
            }, 100)
        }
    }, [searchParams, setSearchParams])

    const fetchWorklogs = async (forceRefresh = false) => {
        // Check cache first if not forcing refresh
        if (!forceRefresh && apiCache.has(CACHE_KEYS.WORKLOGS)) {
            const cachedData = apiCache.get(CACHE_KEYS.WORKLOGS)
            setWorklogs(cachedData.worklogs)
            setTasks(cachedData.tasks)
            setLoading(false)
            return
        }

        setLoading(!forceRefresh)
        setRefreshing(forceRefresh)
        try {
            const res = await api.get("/work-log")
            const tasks = await fetchTasks()
            setWorklogs(res.data)
            setTasks(tasks)
            // Store in cache
            apiCache.set(CACHE_KEYS.WORKLOGS, {
                worklogs: res.data,
                tasks: tasks
            })
            setError("")
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch work logs")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = () => {
        fetchWorklogs(true)
    }

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <div className="container my-4">
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">Loading work logs...</p>
                            </div>
                        ) : (
                            <>
                                <WorklogList
                                    worklogs={worklogs}
                                    setWorklogs={setWorklogs}
                                    tasks={tasks}
                                    setTasks={setTasks}
                                    error={error}
                                    highlightedWorklogId={highlightedWorklogId}
                                    setHighlightedWorklogId={setHighlightedWorklogId}
                                />
                                <div className="d-flex justify-content-end mt-3">
                                    <button
                                        className="btn"
                                        onClick={handleRefresh}
                                        disabled={refreshing}
                                        title="Refresh work logs"
                                    >
                                        {refreshing ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            "🔄"
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
