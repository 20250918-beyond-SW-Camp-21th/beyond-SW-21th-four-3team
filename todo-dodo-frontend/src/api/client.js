import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshingPromise = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (!error.response) return Promise.reject(error);

    if (error.response.status === 401 && original && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return Promise.reject(error);

      if (!refreshingPromise) {
        refreshingPromise = axios
          .post("/api/auth/refresh", { refreshToken })
          .then((res) => res.data)
          .finally(() => {
            refreshingPromise = null;
          });
      }

      const data = await refreshingPromise;

      if (!data?.success) return Promise.reject(error);

      const accessToken = data.data?.accessToken;
      const newRefreshToken = data.data?.refreshToken;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (newRefreshToken)
        localStorage.setItem("refreshToken", newRefreshToken);

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${accessToken}`;

      return client(original);
    }

    return Promise.reject(error);
  }
);

export default client;