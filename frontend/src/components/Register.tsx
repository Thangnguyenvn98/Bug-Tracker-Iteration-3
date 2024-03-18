

const Register = () => {
  return (
    <div className="p-4">
    <div className="p-10  flex justify-center ">
        <div className="p-4 bg-white w-[400px] rounded-lg border-2 border-black">
            <h2 className="text-center text-2xl font-bold">Register</h2>
           <form action="" className="p-4">
            <div className="flex flex-col gap-y-6">
                <input className="p-4 border-2" type="text" placeholder="UserName" />
                <input className="p-4 border-2" type="password" placeholder="Password" />
                <input className="p-4 border-2" type="password" placeholder="Confirm Password" />
                <button type="submit" className="p-4 bg-blue-500 rounded-md text-white text-lg" >Register</button>
                <div className="flex items-center justify-center gap-x-4">
                    <h2>Already have an account?</h2>
                    <a href="">Sign in</a>
                </div>

            </div>
           </form>
        </div>
    
    
</div>
</div>
  )
}

export default Register