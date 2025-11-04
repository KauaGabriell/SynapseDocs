/**Intercepta as requisições e passa os token autenticado para todas elas */
import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:3030'
});

api.interceptors.request.use((config) =>{
    const token = localStorage.getItem('token');
    if(token){
        config.headers['Authorization'] = `Bearer ${token}`
    }

    return config;
}, (error) =>{
    return Promise.reject(error)
});

export default api;