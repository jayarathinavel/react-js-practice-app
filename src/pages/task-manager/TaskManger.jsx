import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import TaskList from "../../components/task-manager/TaskList";
import api from "../../api/api";

export default function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get("/task-manager");
            setTasks(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
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
                            <TaskList
                                tasks={tasks}
                                setTasks={setTasks}
                                error={error}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
