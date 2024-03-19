import { useNavigate,Link } from "react-router-dom"

const SignIn = () => {
  const navigate = useNavigate()
  return (
    <div className="p-4">
        <div className="p-10  flex justify-center ">
            <div className="p-4 bg-white w-[400px] rounded-lg border-2 border-black">
                <h2 className="text-center text-2xl font-bold">Login</h2>
               <form action="" className="p-4">
                <div className="flex flex-col gap-y-6">
                    <input className="p-4 border-2" type="text" placeholder="UserName" />
                    <input className="p-4 border-2" type="password" placeholder="Password" />
                    <h2 className="text-right">Forgot username ?</h2>
                    <h2 className="text-right">Forgot password ?</h2>
                    <button type="submit" className="p-4 bg-blue-500 rounded-md text-white text-lg" >Login</button>
                    <div className="flex items-center justify-center gap-x-4">
                        <h2>Don't have an account?</h2>
                        <Link to="/register">Sign Up</Link>
                    </div>

                </div>
               </form>
            </div>
        
        
    </div>
    </div>

  )
}

export default SignIn