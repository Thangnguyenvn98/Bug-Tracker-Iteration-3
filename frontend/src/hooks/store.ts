import axios from "axios";
import {create} from 'zustand'
import { RegisterFormData } from "../types/registerForm";
import { SignInFormData } from "../types/signInForm";
import { BugFormData } from "../types/bugForm";
import { BugReport } from "../types/bugReport";
import { BugFormDetail } from "../types/bugFormDetail";
import { User } from "../types/user";
import { ChangePasswordProps } from "../types/changePassword";

interface useAuthStore {
    isLoggedIn: boolean;
    verifyToken: () => Promise<void>;
    register: (data: RegisterFormData) => Promise<void>;
    login: (data: SignInFormData) => Promise<void>;
    resetRequest: (email:string) => Promise<number>;
    resetPassword: (userId:string,token:string,password:string) => Promise<boolean>
    logout: () => Promise<boolean>;
    reportBug: (data:BugFormData) => Promise<boolean>;
    getReports: () => Promise<BugReport[]>;
    getUserReports: (id:string) => Promise<BugReport[]>
    getSpecificBug: (id:string) => Promise<BugFormDetail>;
    modifiedBug: (id:string,data:BugFormDetail) => Promise<boolean>;
    getUser: () => Promise<User>;
    passwordChange: (data:ChangePasswordProps) => Promise<boolean>
    getUserById: (id:string) => Promise<User>

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
            console.log(error)
            throw error
        }
    },
    resetPassword: async (userId,token,password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/resetPassword`,{userId,token,password})
            return response.status === 200;
        }catch (error){
            console.log(error)
            throw error
            
        }
    },
    logout: async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/logout`, {}, {withCredentials:true})
            return response.status === 200
        }catch (error) {
            console.log(error)
            throw error
        }
    },
    reportBug: async (data) => {
      try {
          const response = await axios.post(`${API_BASE_URL}/api/report-bug`,data, {withCredentials:true})
          return response.status === 200
      }catch (error) {
          console.log(error)
          throw error
      }
    },
    getReports: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/reports`,{withCredentials:true})
        return response.data
      }catch (error) {
        console.log(error)
        throw error
      }
    },
    getSpecificBug: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/bug/${id}`,{withCredentials:true})
            return response.data
        }catch (error) {
            console.log(error)
            throw error
        }
    },
    modifiedBug: async (id,data) => {
      try {
        const response = await axios.patch(`${API_BASE_URL}/api/bug/${id}`,data,{withCredentials:true})
        return response.status === 200
      }catch (error) {
        console.log(error)
        throw error
      }
    },
    getUser: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user`,{withCredentials:true})
        return response.data
      }catch (error) {
        console.log(error)
        throw error
      }
    },
    getUserById: async (id) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/${id}`)
        return response.data
      }catch (error) {
        console.log(error)
        throw error
      }
    },
    getUserReports: async (id) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/${id}/reports`)
        return response.data
      }catch (error) {
        console.log(error)
        throw error
      }
    },
    passwordChange: async (data) => {
      try {
        
        const response = await axios.post(`${API_BASE_URL}/api/changePassword`,data,{withCredentials:true})
        return response.data
      }catch (error) {
        console.log(error)
        throw error
    }
    }
  
    
}))
export default useAuthStore;
