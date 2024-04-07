import Navbar from "./Navbar";
import { useForm, SubmitHandler } from "react-hook-form";
import { BugFormDetail } from "../types/bugFormDetail";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../hooks/store";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import Loader from "./Loading";
import { User } from "../types/user";

const BugDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [bugInfo, setBugInfo] = useState<BugFormDetail>();
  const [user, setUser] = useState<User>();

  const { getSpecificBug, modifiedBug, getUserById } = useAuthStore();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BugFormDetail>();

  useEffect(() => {
    const fetchBugDetails = async () => {
      if (id) {
        try {
          const fetchedBugDetails = await getSpecificBug(id);
          const creator = await getUserById(fetchedBugDetails.createdBy);
          setBugInfo(fetchedBugDetails);
          setUser(creator);
          reset(fetchedBugDetails); // Reset the form with fetched data
        } catch (error) {
          console.error("Error fetching bug details:", error);
          navigate("/"); // Redirect or handle error
        }
      }
    };

    fetchBugDetails();
  }, [id, getSpecificBug, navigate]);

  const isCloseBugChecked = watch("isClosed");
  const isBugFixedChecked = watch("isFixed");

  const onSubmit: SubmitHandler<BugFormDetail> = async (data) => {
    if (isCloseBugChecked && data.reasonForClosing?.trim() === "") {
      toast.error("Reason for closing is required.");
      return;
    }
    if (isBugFixedChecked && data.bugFixDetails?.trim() === "") {
      toast.error("Bug fix details are required.");
      return;
    }
    try {
      await modifiedBug(id || "", data);

      navigate("/buglibrary"); // Redirect to home or another page as needed
      toast.success("Bug modified successfully");
    } catch (e) {
      const errorMessage =
        e instanceof AxiosError ? e.response?.data.message : "Edit bug failed";
      toast.error(errorMessage);
      console.error("Bug editing failed:", e);
    }
  };
  if (!bugInfo) return <Loader />; // Show loading state until bugInfo is loaded

  return (
    <div className="p-4">
      <Navbar />

      <h1 className="text-2xl font-bold text-center mb-5 mt-6">
        Edit Bug Report
      </h1>
      <div className="flex justify-center gap-x-10 mt-10">
        <div className="bg-black p-4 rounded-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4 text-white">
              <div className="flex gap-x-[4.5rem]">
                <label>Report #:</label>
                <label>{bugInfo?.number}</label>
              </div>
              {user && (
                <>
                  <div className="flex gap-x-[5.2rem]">
                    <label>Author:</label>
                    <label>{user.username}</label>
                  </div>
                  <div className="flex gap-x-[5.9rem]">
                    <label>Email:</label>
                    <label>{user.email}</label>
                  </div>
                </>
              )}

              <div className="flex gap-x-[3.1rem]">
                <label>Type of Bug:</label>
                <select
                  {...register("type", { required: true })}
                  className="border-2 border-slate-400 text-black"
                >
                  <option value="">Select Type</option>
                  <option value="ui">UI</option>
                  <option value="functionality">Functionality</option>
                  <option value="performance">Performance</option>
                  <option value="compatibility">Compatibility</option>
                </select>
                {errors.type && (
                  <span className="text-red-500">Type of bug is required</span>
                )}
              </div>
              <div className="flex gap-x-4">
                <label>Summary of Bug:</label>
                <textarea
                  {...register("summary", { required: true })}
                  rows={8}
                  cols={30}
                  className="border-2 border-slate-400 text-black"
                ></textarea>
                {errors.summary && (
                  <span className="text-red-500">Summary is required</span>
                )}
              </div>
              <div className="flex gap-x-[4.2rem]">
                <label>I want to:</label>
                <div className="flex flex-col">
                  <div>
                    <input type="checkbox" {...register("isClosed")} />
                    <label> Close the bug</label>
                  </div>
                </div>
              </div>
              {isCloseBugChecked && (
                <>
                  <div className="flex gap-x-[1.5rem]">
                    <label>Reason to close:</label>
                    <textarea
                      {...register("reasonForClosing", { required: true })}
                      rows={2}
                      cols={30}
                      className="border-2 border-slate-400 text-black"
                    ></textarea>
                    {errors.reasonForClosing && (
                      <span className="text-red-500">
                        Closing Reason is Required
                      </span>
                    )}
                  </div>
                  <div className="flex gap-x-4">
                    <label> Is the bug fixed?</label>
                    <input type="checkbox" {...register("isFixed")} />
                  </div>
                </>
              )}
              {isBugFixedChecked && isCloseBugChecked && (
                <div className="flex gap-x-4">
                  <label>How it was fixed: </label>
                  <textarea
                    {...register("bugFixDetails", { required: true })}
                    rows={8}
                    cols={30}
                    className="border-2 border-slate-400 text-black"
                  ></textarea>
                  {errors.bugFixDetails && (
                    <span className="text-red-500">
                      How bug is fixed Required
                    </span>
                  )}
                </div>
              )}
              <button
                type="submit"
                className="bg-white text-blue-500 font-bold py-2 px-4 rounded"
              >
                Save and Exit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BugDetail;
