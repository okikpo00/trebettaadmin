import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend base URL
  withCredentials: true, // allow cookies if needed later
});

// attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // where you stored admin token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === Transactions ===
export const listTransactions = (params = {}) => api.get("/admin/transactions", { params });
export const getTransaction = (id) => api.get(`/admin/transactions/${id}`);
export const exportTransactionsCSV = (params = {}) =>
  api.get("/admin/transactions/export", { params, responseType: "blob" });
export const reverseTransaction = (id, body) => api.post(`/admin/transactions/${id}/reverse`, body);

// === Wallets ===
export const getWalletByUserId = (userId) => api.get(`/admin/wallets/user/${userId}`);
export const adjustWallet = (userId, body) => api.post(`/admin/wallets/user/${userId}/adjust`, body);

export default api; // keep default export for legacy imports

