import { useNavigate,Link } from "react-router-dom"
import { useForm, SubmitHandler } from "react-hook-form"
import { SignInFormData } from "../types/signInForm"
import useAuthStore from "../hooks/store";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useEffect } from "react";

const SignIn = () => {
  const { login: storeLogin,verifyToken,isLoggedIn } = useAuthStore();

  const navigate = useNavigate()
  
  const {register,handleSubmit,formState: {errors}} = useForm<SignInFormData>()
  useEffect(() => {
    verifyToken();  // Verify token on component mount
  }, [verifyToken]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');  // Redirect to home if already logged in
    }
  }, [isLoggedIn, navigate]);
  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    try {
      await storeLogin(data)
      toast.success("Log in successful")
      
    }catch (e){
      const errorMessage = e instanceof AxiosError ? e.response?.data.message : 'Login failed';
      toast.error(errorMessage);
      console.error('Registration failed:',e)
    }
  }
  return (
    <div className="p-4">
        <div className="p-10  flex justify-center ">
            <div className="p-4 bg-white w-[400px] rounded-lg border-2 border-black">
                <h2 className="text-center text-2xl font-bold">Login</h2>
               <form onSubmit={handleSubmit(onSubmit)} className="p-4">
                <div className="flex flex-col gap-y-6">
                <input className="p-4 border-2" {...register("username",{ required: "This field is required" })} placeholder="UserName" />
                {errors.username && (
          <span className="text-red-500">{errors.username.message}</span>
        )}
                <input className="p-4 border-2" {...register("password",    {required: "This field is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            }})}type="password" placeholder="Password" />
            {errors.password && (
          <span className="text-red-500">{errors.password.message}</span>
        )}
                    
                    <Link to='/password-reset-request' className="text-right">Forgot password ?</Link>
                    <button type="submit" className="p-4 bg-blue-500 rounded-md text-white text-lg" >Login</button>
                    <div className="flex items-center justify-center gap-x-4">
                        <h2>Don't have an account?</h2>
                        <Link to="/register" className="text-blue-500">Sign Up</Link>
                    </div>

                </div>
               </form>
            </div>
        
        
    </div>
    </div>

  )
}

export default SignIn