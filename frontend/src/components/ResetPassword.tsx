import {useForm, SubmitHandler} from "react-hook-form"
import { useSearchParams, useNavigate } from "react-router-dom"
import useAuthStore from "../hooks/store";

import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface ResetPasswordProps {
    password: string;
    passwordConfirmation:string;
}

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const token = searchParams.get('token') || '';
    const userId = searchParams.get('id') || '';


    const { resetPassword: storeRequest } = useAuthStore();
  
    const {register, watch,handleSubmit, formState: { errors }} = useForm<ResetPasswordProps>()
    const onSubmit: SubmitHandler<ResetPasswordProps> = async (data) => {
      try {
          console.log(data.password)
        const response = await storeRequest(userId,token,data.password)
        navigate('/sign-in')
        response ? toast.success("Password Reset Success") : toast.error("Reset Failed")
        
       
  
      }catch (e){
        const errorMessage = e instanceof AxiosError ? e.response?.data.message : 'Fail to reset';
        toast.error(errorMessage)
        console.error('Fail to reset:',e)
      }
    }
    return (
      <div className="p-4">
      <div className="p-10 flex justify-center">
          <div className="p-4 bg-white w-[400px] rounded-lg border-2 border-black">
              <h2 className="text-center text-2xl font-bold">Reset account password</h2>
             <form onSubmit={handleSubmit(onSubmit)} className="p-4">
              <div className="flex flex-col gap-y-6">
              <input className="p-4 border-2" {...register("password",{required: "This field is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            }})}type="password" placeholder="Password" />
            {errors.password && (
          <span className="text-red-500">{errors.password.message}</span>
        )}
                <input className="p-4 border-2" {...register("passwordConfirmation",{
            validate: (val) => {
              if (!val) {
                return "This field is required";
              } else if (watch("password") !== val) {
                return "Your passwords do no match";
              }
            }})} type="password" placeholder="Confirm Password" />
               {errors.passwordConfirmation && (
          <span className="text-red-500">{errors.passwordConfirmation.message}</span>
        )}
     
                  
         
                  <button type="submit" className="p-4 bg-blue-500 rounded-md text-white text-lg" >Reset password</button>
                  
              
  
              </div>
             </form>
          </div>
      
      
  </div>
  </div>
    )
  
}

export default ResetPassword