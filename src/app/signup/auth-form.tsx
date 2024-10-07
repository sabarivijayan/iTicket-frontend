"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import axios from "axios";
import { googleSignIn } from "@/api-helpers/api-helpers";
import { useDispatch } from "react-redux";
import { userActions } from "@/store";
import Link from "next/link";
import styles from "./AuthForm.module.css";

interface CredentialResponse {
  credential?: string;
}
interface GoogleCredential {
    email: string;
    sub: string;
    // Add other fields you may need, like name, picture, etc.
  }
interface DecodedToken {
  email: string;
}

interface AuthFormProps {
  onSubmit: (inputs: {
    email: string;
    phone: string;
    password: string;
    signup: boolean;
  }) => Promise<{ token: string; userId: string }>;
  isAdmin: boolean;
}

interface OtpResponse {
    success: boolean;
    token?: string; // Assuming your API returns a token on success
    message?: string;
  }

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, isAdmin }) => {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [inputs, setInputs] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const dispatch = useDispatch();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse?.credential;
    const token = sessionStorage.getItem("token");

    if(token){
        router.push("/")
        return;
    }
  
    if (credential) {
      console.log("Google Credential:", credential);
  
      try {
        // Decode the Google credential (JWT) to extract the email
        const decoded: GoogleCredential = jwtDecode(credential);
        const userEmail = decoded.email;
        const userId = decoded.sub;
  
        if (userEmail) {
          const response = await googleSignIn(credential); // Pass the credential (JWT token)
          if(response?.token){
            sessionStorage.setItem("googleEmail", userEmail);
            sessionStorage.setItem("userId", userId);
            sessionStorage.setItem("token", response.token); // Store the token for future logins
            router.push("/"); // Redirect to home after successful login
          }
          else if (response) {
            setOtpDialogOpen(true);
            sessionStorage.setItem("googleEmail", userEmail); // Store the email, not the token
            sessionStorage.setItem("userId", userId);
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong with the response.",
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Unable to extract email from Google response.",
          });
        }
      } catch (error) {
        console.error("Error during Google Sign-In:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while processing your request.",
        });
      }
    } else {
      console.error("Google credential is missing.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputs.email || !inputs.password || (isSignup && !inputs.phone)) {
      alert("Please fill in all the required fields.");
      return;
    }

    try {
      const response = await onSubmit({
        email: inputs.email,
        phone: inputs.phone,
        password: inputs.password,
        signup: isAdmin ? false : isSignup,
      });

      // For login, set token in sessionStorage or localStorage
      if (!isSignup) {
        if (response.token) {
          localStorage.setItem("token", response.token); // Use sessionStorage.setItem("token", response.token) if you prefer sessionStorage
          router.push("/"); // Redirect to home after successful login
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Login failed. No token received.",
          });
        }
      } else {
        setOtpDialogOpen(true); // Open OTP dialog for signup
        sessionStorage.setItem("signupEmail", inputs.email); // Store email for OTP verification
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    }
  };

  const handleOtpSubmit = async (): Promise<void> => {
    const email = sessionStorage.getItem("googleEmail") || sessionStorage.getItem("signupEmail");
    const token = sessionStorage.getItem("token");

    if (token) {
        router.push("/"); // Redirect to home
        return;
    }

    if (!email || !otp || otp.trim() === "") {
      console.error("Email or OTP is missing.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Email or OTP is missing.",
      });
      return;
    }
  
    try {
      const response: AxiosResponse<OtpResponse> = await axios.post("http://localhost:4000/api/user/verify-otp", { email, otp });
  
      if (response.status === 200 && response.data.success) {
        // Clear session and store token
        sessionStorage.removeItem("signupEmail");
        sessionStorage.removeItem("googleEmail");
        localStorage.setItem("userEmail", email);
        sessionStorage.setItem("token", response.data.token); 
  
        // Dispatch login action with typed payload
        dispatch(userActions.login({ email, token: response.data.token! }));
  
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "OTP Verified Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
  
        // Redirect to home
        router.push("/");
  
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid OTP",
          text: response.data.message || "Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Error during OTP submission:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "An error occurred during OTP verification.",
      });
    }
  };

  return (
    <>
      <div className={styles.dialog}>
        <div className={styles.closeBtnContainer}>
          <Link href="/" passHref>
            <button className={styles.closeBtn}>X</button>
          </Link>
        </div>

        <h2 className={styles.heading}>{isSignup ? "Sign Up" : "Sign In"}</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formContainer}>
            <input
              className={styles.input}
              type="email"
              value={inputs.email}
              onChange={handleChange}
              name="email"
              placeholder="Email"
              required
            />

            {isSignup && (
              <input
                className={styles.input}
                type="tel"
                value={inputs.phone}
                onChange={handleChange}
                name="phone"
                placeholder="Phone Number"
                required
              />
            )}

            <div className={styles.passwordContainer}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                value={inputs.password}
                onChange={handleChange}
                name="password"
                placeholder="Password"
                required
              />
              <button
                type="button"
                className={styles.showPasswordBtn}
                onClick={handleClickShowPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button type="submit" className={styles.submitBtn}>
              {isSignup ? "Sign Up" : "Sign In"}
            </button>

            {!isAdmin && (
              <>
                <p className={styles.text}>
                  {isSignup
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </p>

                <button
                  type="button"
                  className={styles.switchModeBtn}
                  onClick={() => setIsSignup(!isSignup)}
                >
                  {isSignup ? "Sign In" : "Sign Up"}
                </button>

                <p className={styles.orText}>OR</p>
                <p className={styles.signInWithText}>Sign In with</p>

                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log("Google Sign-In Failed")}
                />
              </>
            )}
          </div>
        </form>
      </div>

      {otpDialogOpen && (
        <div className={styles.dialog}>
          <div className={styles.otpContainer}>
            <h3>Enter OTP</h3>

            <input
              className={styles.input}
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="OTP"
              required
            />

            <button className={styles.submitBtn} onClick={handleOtpSubmit}>
              Verify OTP
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthForm;
