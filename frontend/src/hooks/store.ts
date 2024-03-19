import axios from "axios";
import {create} from 'zustand'
import { RegisterFormData } from "../types/registerForm";


interface useAuthStore {
    isLoggedIn: boolean;
    verifyToken: () => Promise<void>;
    register: (data: RegisterFormData) => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const useAuthStore = create<useAuthStore>((set) => ({
    isLoggedIn: false,
    verifyToken: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/validate-token`,{ withCredentials: true })
            response.status === 200 ? set({isLoggedIn:true}) : set({isLoggedIn:false});
        }catch (e){
            set({isLoggedIn:false})
        }
    },
    register: async (data) => {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/register`, data);
          if (response.status === 200) {
            set({ isLoggedIn: true });
            // Handle post-registration logic (e.g., redirect to dashboard)
          }else {
            throw new Error('Registration failed');
          }
        } catch (error) {
          
          console.error('Registration error:', error);
          throw error
          // Handle registration error (e.g., show error message)
        }
      },
    
      login: async (username, password) => {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/login`, { username, password });
          if (response.status === 200) {
            set({ isLoggedIn: true });
            // Handle post-login logic (e.g., redirect to dashboard)
          }
        } catch (error) {
          console.error('Login error:', error);
          // Handle login error (e.g., show error message)
        }
    }
}))
export default useAuthStore;
