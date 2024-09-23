import { sendPost } from "./axiosClient";

export const login = (data) => sendPost("/auth/login", data);