import { useNavigate } from "react-router-dom"
import useAuthStore from "../hooks/store"
import { useCallback, useEffect } from "react";

const Home = () => {
  const { isLoggedIn, verifyToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      await verifyToken();
      if (!isLoggedIn) {
        navigate('/sign-in');
      }
    };

    checkAuth();
  }, [isLoggedIn, verifyToken, navigate]);

  return (
    <div className="p-4">
      <div className="flex justify-around">
        <div className="">
          <form action="">
            <div className="flex flex-col gap-y-4">
              <div className="flex gap-x-4">
                <label>Report #:</label>
                <input type="text" className="border-2 border-slate-400" />
              </div>
              <div className="flex gap-x-4">
                <label>Type of Bug:</label>
                <input type="text" className="border-2 border-slate-400" />
              </div>
              <div className="flex gap-x-4">
                <label>Summary of Bug:</label>
                <textarea rows={8} cols={30} className="border-2 border-slate-400"></textarea>
              </div>
              <div className="flex gap-x-4">
                <label>I would like to:</label>
                <div className="flex flex-col">
                  <div> <input type="checkbox" />
                <label> Updates on bug</label></div>
               
                <div> <input type="checkbox" />
                <label> Updates on bug</label></div>
                </div>
                
              </div>
            </div>
          </form>
        </div>
        <div className="bg-red-500">

        </div>
      </div>
    </div>
  )
}

export default Home