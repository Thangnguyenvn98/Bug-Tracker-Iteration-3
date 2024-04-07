import Navbar from "./Navbar";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../hooks/store";
import { AxiosError } from "axios";

const Graph = () => {
  return (
    <div className="p-4">
      <Navbar />
      <h1 className="text-2xl font-bold text-center mb-5 mt-6">Statistics</h1>
    </div>
  );
};

export default Graph;
