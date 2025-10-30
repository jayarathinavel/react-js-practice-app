import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import TaskList from "../../components/task-manager/TaskList";
import api from "../../api/api";

export default function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get("/task-manager");
            setTasks(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch tasks");
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <div className="container my-4">
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        <TaskList
                            tasks={tasks}
                            setTasks={setTasks}
                            error={error}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
