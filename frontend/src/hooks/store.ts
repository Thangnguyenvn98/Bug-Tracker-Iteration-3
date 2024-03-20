import axios from "axios";
import {create} from 'zustand'
import { RegisterFormData } from "../types/registerForm";
import { SignInFormData } from "../types/signInForm";



interface useAuthStore {
    isLoggedIn: boolean;
    verifyToken: () => Promise<void>;
    register: (data: RegisterFormData) => Promise<void>;
    login: (data: SignInFormData) => Promise<void>;
    resetRequest: (email:string) => Promise<number>;
    resetPassword: (userId:string,token:string,password:string) => Promise<boolean>
    logout: () => Promise<boolean>;

}



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const useAuthStore = create<useAuthStore>((set) => ({
    isLoggedIn: false,
    verifyToken: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/validate-token`, { withCredentials: true });
            set({ isLoggedIn: response.status === 200 });
        } catch (error) {
           
            if (axios.isAxiosError(error)) {
                // 401 Unauthorized is an expected response indicating no current session
                
                if (error.response?.status === 401) {
                    // Silently handle the 401 error as an expected outcome
                    set({ isLoggedIn: false });
                } else {
                    // Log or handle other errors as they are unexpected
                    console.error('Unexpected error verifying token:', error);
                
      
        }
    }}},
    register: async (data) => {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/register`, data, {withCredentials:true});
          if (response.status === 200) {
            await useAuthStore.getState().verifyToken();  // Directly invoke verifyToken after login

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
    
      login: async (data) => {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/login`, data, {withCredentials:true});
          if (response.status === 200) {
            await useAuthStore.getState().verifyToken();  // Directly invoke verifyToken after login

            // Handle post-login logic (e.g., redirect to dashboard)
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          console.error('Login error:', error);
          throw error
          // Handle login error (e.g., show error message)
        }
    },
    resetRequest: async (email) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/requestPasswordReset`,{email})
            return response.status
        }catch (error){
            throw error
        }
    },
    resetPassword: async (userId,token,password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/resetPassword`,{userId,token,password})
            return response.status === 200;
        }catch (error){
            throw error
        }
    },
    logout: async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/logout`, {}, {withCredentials:true})
            return response.status === 200
        }catch (error) {
            throw error
        }
    }
}))
export default useAuthStore;
