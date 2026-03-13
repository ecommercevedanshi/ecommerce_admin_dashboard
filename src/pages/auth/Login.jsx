import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { z } from "zod";

import { useLoginMutation } from "../../features/auth/authApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password required"),
});

const Login = () => {

  const [login] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (values) => {

    try {

      const res = await login({...values, role: 0}).unwrap();

      dispatch(setCredentials(res.data));
      
      navigate("/");

    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-main)]">

      <div className="surface p-8 rounded-lg w-[380px]">

        <h2 className="text-lg mb-6 text-center">
          Admin Login
        </h2>

        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(loginSchema)}
          onSubmit={handleSubmit}
        >

          <Form className="space-y-4">

            {/* EMAIL */}
            <div>
              <Field
                name="email"
                placeholder="Email"
                className="input w-full"
              />

              <ErrorMessage
                name="email"
                component="div"
                className="text-red-400 text-xs mt-1"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">

              <Field
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input w-full pr-10"
              />

              {/* TOGGLE ICON */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              <ErrorMessage
                name="password"
                component="div"
                className="text-red-400 text-xs mt-1"
              />

            </div>

            <button
              type="submit"
              className="btn-primary w-full"
            >
              Login
            </button>

          </Form>

        </Formik>

      </div>

    </div>
  );
};

export default Login;