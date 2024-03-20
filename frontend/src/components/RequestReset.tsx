import {useForm, SubmitHandler} from "react-hook-form"
import { Link } from "react-router-dom"
import useAuthStore from "../hooks/store";

import toast from "react-hot-toast";
import { AxiosError } from "axios";


interface ResetRequestProps {
    email: string
}

const RequestReset = () => {
  const { resetRequest: storeRequest } = useAuthStore();
  
  const {register, handleSubmit, formState: { errors }} = useForm<ResetRequestProps>()
  const onSubmit: SubmitHandler<ResetRequestProps> = async (data) => {
    try {
        console.log(data.email)
      const response = await storeRequest(data.email)
      response === 200 ?   toast.success("Check your email for reset link") : toast.error("Request Fail")
     

    }catch (e){
      const errorMessage = e instanceof AxiosError ? e.response?.data.message : 'Fail to request';
      toast.error(errorMessage)
      console.error('Fail to request:',e)
    }
  }
  return (
    <div className="p-4">
    <div className="p-10 flex justify-center">
        <div className="p-4 bg-white w-[400px] rounded-lg border-2 border-black">
            <h2 className="text-center text-2xl font-bold">Forgot your password ?</h2>
            <p className="text-center text-md mt-4">Please enter the email you use to sign in to BRS</p>
           <form onSubmit={handleSubmit(onSubmit)} className="p-4">
            <div className="flex flex-col gap-y-6">
                <label className="text-slate-500">Your account email</label>
            <input type="email" className="p-4 border-2" {...register("email",{ required: "This field is required" })} placeholder="Email" />
            {errors.email && (
      <span className="text-red-500">{errors.email.message}</span>
    )}
   
                
       
                <button type="submit" className="p-4 bg-blue-500 rounded-md text-white text-lg" >Request password reset</button>
                <Link to='/sign-in' className="text-blue-500 text-center">Back to Sign in</Link>
            

            </div>
           </form>
        </div>
    
    
</div>
</div>
  )
}

export default RequestReset