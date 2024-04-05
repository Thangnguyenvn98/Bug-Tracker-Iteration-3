import {useForm, SubmitHandler} from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import useAuthStore from "../hooks/store";
import {useState, useEffect} from 'react'

import toast from "react-hot-toast";
import { AxiosError } from "axios";

import { ChangePasswordProps } from "../types/changePassword";

const ChangePassword = () => {
    const navigate = useNavigate()
    const [userName, setUserName] = useState('');

    const {
        register,
        watch,
        handleSubmit,
        formState: { errors },
      } = useForm<ChangePasswordProps>();
    
      const { verifyToken, isLoggedIn, getUser, passwordChange } = useAuthStore();
    
      useEffect(() => {
        const fetchData = async () => {
          await verifyToken();
          if (!isLoggedIn) {
            navigate("/sign-in");
          }
          const response =await getUser()
          if (response.username) {
            setUserName(response.username);
        }
        };
        fetchData();
      }, [verifyToken, isLoggedIn, navigate,getUser]);

    const onSubmit: SubmitHandler<ChangePasswordProps> = async (data) => {
      try {
         const response = await passwordChange(data)
         navigate('/')
         response ? toast.success("Change password successfully") : toast.error("Fail to change password")
        
       
  
      }catch (e){
        const errorMessage = e instanceof AxiosError ? e.response?.data.message : 'Fail to change password';
        toast.error(errorMessage)
        console.error('Fail to reset:',e)
      }
    }
    return (
      <div className="p-4">
      <div className="p-10 flex justify-center">
          <div className="p-4 bg-white w-[400px] rounded-lg border-2 border-black">
              <h2 className="text-center text-2xl font-bold">Change account password</h2>
              { userName.length > 1 && <p className="text-center text-md mt-4">Enter a new password for {userName} </p>}
             <form onSubmit={handleSubmit(onSubmit)} className="p-4">
              <div className="flex flex-col gap-y-6">
              <input className="p-4 border-2" {...register("password",{required: "This field is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            }})}type="password" placeholder="Old password" />
            {errors.password && (
          <span className="text-red-500">{errors.password.message}</span>
        )}
              <input className="p-4 border-2" {...register("newPassword",{required: "This field is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            }})}type="password" placeholder="Password" />
            {errors.newPassword && (
          <span className="text-red-500">{errors.newPassword.message}</span>
        )}
                <input className="p-4 border-2" {...register("newPasswordConfirmation",{
            validate: (val) => {
              if (!val) {
                return "This field is required";
              } else if (watch("newPassword") !== val) {
                return "Your passwords do no match";
              }
            }})} type="password" placeholder="Confirm Password" />
               {errors.newPasswordConfirmation && (
          <span className="text-red-500">{errors.newPasswordConfirmation.message}</span>
        )}
     
                  
         
                  <button type="submit" className="p-4 bg-blue-500 rounded-md text-white text-lg" >Change password</button>
                  <Link to='/' className="text-center text-blue-500">Back to homepage</Link>
              
  
              </div>
             </form>
          </div>
      
      
  </div>
  </div>
    )
  
}

export default ChangePassword