import axios from "axios";

export const api = axios.create({baseURL: "https://distress-server.onrender.com/api"})