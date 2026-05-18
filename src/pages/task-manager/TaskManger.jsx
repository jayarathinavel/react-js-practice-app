import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import TaskList from "../../components/task-manager/TaskList";
import api from "../../api/api";
import { apiCache, CACHE_KEYS } from "../../utils/apiCache";

export default function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async (forceRefresh = false) => {
        // Check cache first if not forcing refresh
        if (!forceRefresh && apiCache.has(CACHE_KEYS.TASKS)) {
            const cachedTasks = apiCache.get(CACHE_KEYS.TASKS);
            setTasks(cachedTasks);
            setLoading(false);
            return;
        }

        setLoading(!forceRefresh);
        setRefreshing(forceRefresh);
        try {
            const res = await api.get("/task-manager");
            setTasks(res.data);
            // Store in cache
            apiCache.set(CACHE_KEYS.TASKS, res.data);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch tasks");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchTasks(true);
    };

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
                                <p className="mt-3 text-muted">Loading tasks...</p>
                            </div>
                        ) : (
                            <>
                                <TaskList
                                    tasks={tasks}
                                    setTasks={setTasks}
                                    error={error}
                                />
                                <div className="d-flex justify-content-end mt-3">
                                    <button
                                        className="btn"
                                        onClick={handleRefresh}
                                        disabled={refreshing}
                                        title="Refresh tasks"
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
    );
}
