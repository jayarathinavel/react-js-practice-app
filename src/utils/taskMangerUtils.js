import api from "../api/api"

export async function fetchTasks() {
    try {
        const res = await api.get("/task-manager");
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to fetch tasks");
    }
}
