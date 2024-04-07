import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../hooks/store";
import { RegisterFormData } from "../types/registerForm";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useEffect } from "react";

const Register = () => {
  const { register: storeRegister, verifyToken, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();
  useEffect(() => {
    verifyToken();

    // Verify token on component mount
  }, [verifyToken]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/"); // Redirect to home if already logged in
    }
  }, [isLoggedIn, navigate]);

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    try {
      await storeRegister(data);
      navigate("/");
      toast.success("Register Success");
    } catch (e) {
      const errorMessage =
        e instanceof AxiosError ? e.response?.data.message : "Register failed";
      toast.error(errorMessage);
      console.error("Registration failed:", e);
    }
  };

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="p-10  flex justify-center ">
        <div className="p-4 bg-white w-[400px] rounded-lg border-2 border-black">
          <h2 className="text-center text-2xl font-bold">Register</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4">
            <div className="flex flex-col gap-y-6">
              <input
                type="email"
                className="p-4 border-2"
                {...register("email", {
                  required: "This field is required",
                })}
                placeholder="Email"
              />
              {errors.email && (
                <span className="text-red-500">{errors.email.message}</span>
              )}
              <input
                className="p-4 border-2"
                {...register("username", {
                  required: "This field is required",
                })}
                placeholder="Username"
              />
              {errors.username && (
                <span className="text-red-500">{errors.username.message}</span>
              )}
              <input
                className="p-4 border-2"
                {...register("password", {
                  required: "This field is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                type="password"
                placeholder="Password"
              />
              {errors.password && (
                <span className="text-red-500">{errors.password.message}</span>
              )}
              <input
                className="p-4 border-2"
                {...register("passwordConfirmation", {
                  validate: (val) => {
                    if (!val) {
                      return "This field is required";
                    } else if (watch("password") !== val) {
                      return "Your passwords do no match";
                    }
                  },
                })}
                type="password"
                placeholder="Confirm Password"
              />
              {errors.passwordConfirmation && (
                <span className="text-red-500">
                  {errors.passwordConfirmation.message}
                </span>
              )}
              <button
                type="submit"
                className="p-4 bg-blue-500 rounded-md text-white text-lg"
              >
                Register
              </button>
              <div className="flex items-center justify-center gap-x-4">
                <h2>Already have an account?</h2>
                <Link to="/sign-in">Sign in</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
