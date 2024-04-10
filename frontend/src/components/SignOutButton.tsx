import { useNavigate } from "react-router-dom";
import useAuthStore from "../hooks/store";
import toast from "react-hot-toast";

const SignOutButton = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const handleClick = async () => {
    try {
      const response = await logout();
      if (response) {
        navigate("/sign-in");
        toast.success("Logout Successfully");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };
  return (
    <button onClick={handleClick} className="text-red-500 font-bold text-2xl">
      Sign Out
    </button>
  );
};

export default SignOutButton;
