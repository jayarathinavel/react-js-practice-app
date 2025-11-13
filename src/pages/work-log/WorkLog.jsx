import { useState, useEffect } from "react"
import Navbar from "../../components/Navbar"
import WorklogList from "../../components/work-log/WorklogList"
import api from "../../api/api"
import { fetchTasks } from "../../utils/taskMangerUtils"

export default function WorkLog() {
    const [worklogs, setWorklogs] = useState([])
    const [tasks, setTasks] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        fetchWorklogs()
    }, [])

    const fetchWorklogs = async () => {
        try {
            const res = await api.get("/work-log")
            const tasks = await fetchTasks()
            setWorklogs(res.data)
            setTasks(tasks)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch work logs")
        }
    }

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <div className="container my-4">
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        <WorklogList worklogs={worklogs} setWorklogs={setWorklogs} tasks={tasks} setTasks={setTasks} error={error} />
                    </div>
                </div>
            </div>
        </div>
    )
}
