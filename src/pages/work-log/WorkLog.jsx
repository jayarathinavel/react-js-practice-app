import { useState, useEffect } from "react"
import Navbar from "../../components/Navbar"
import WorklogList from "../../components/work-log/WorklogList"
import api from "../../api/api"

export default function WorkLog() {
    const [worklogs, setWorklogs] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        fetchWorklogs()
    }, [])

    const fetchWorklogs = async () => {
        try {
            const res = await api.get("/work-log")
            setWorklogs(res.data)
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
                        <WorklogList worklogs={worklogs} setWorklogs={setWorklogs} error={error} />
                    </div>
                </div>
            </div>
        </div>
    )
}
