import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../../../components/utils/style/style.css";

interface SignupFormValues {
  username: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  accepted: boolean;
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.3A10.7 10.7 0 0 1 12 4c5.5 0 9 5.5 9 5.5a15 15 0 0 1-2.1 2.6M6.6 6.6A15.5 15.5 0 0 0 3 9.5S6.5 15 12 15c1 0 2-.2 2.8-.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.5-5.5 9-5.5 9 5.5 9 5.5-3.5 5.5-9 5.5S3 12 3 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export default function SignupPage() {
  const { signup, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      phone: "",
      country: "",
      accepted: false,
    },
  });

  async function submitSignup(values: SignupFormValues) {
    setSuccessMessage("");
    try {
      await signup({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone.trim(),
        country: values.country.trim(),
      });
      setSuccessMessage("Account created successfully.");
      reset();
    } catch {
      // The hook exposes the request error below the form.
    }
  }

  return (
    <main className="signup-page">
      <section className="signup-card" aria-labelledby="signup-title">
        <header className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>Kinetic Professional</span>
        </header>

        <div className="signup-heading">
          <h1 id="signup-title">Create Account</h1>
          <p>Experience lightning-fast workflow and professional security tools.</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit(submitSignup)} noValidate>
          <label>
            <span>Full Name</span>
            <input
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              aria-invalid={Boolean(errors.username)}
              {...register("username", {
                required: "Full name is required.",
                minLength: {
                  value: 2,
                  message: "Full name must be at least 2 characters.",
                },
              })}
            />
            {errors.username && (
              <small className="field-error">{errors.username.message}</small>
            )}
          </label>

          <label>
            <span>Email Address</span>
            <input
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email", {
                required: "Email address is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            {errors.email && (
              <small className="field-error">{errors.email.message}</small>
            )}
          </label>

          <label>
            <span>Password</span>
            <span className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter at least 8 characters"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters.",
                  },
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon hidden={!showPassword} />
              </button>
            </span>
            {errors.password ? (
              <small className="field-error">{errors.password.message}</small>
            ) : (
              <small>Must be at least 8 characters long.</small>
            )}
          </label>

          <div className="details-row">
            <label>
              <span>Phone</span>
              <input
                type="tel"
                placeholder="+1 555 000 0000"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                {...register("phone", {
                  required: "Phone is required.",
                  minLength: {
                    value: 7,
                    message: "Enter a valid phone number.",
                  },
                })}
              />
              {errors.phone && (
                <small className="field-error">{errors.phone.message}</small>
              )}
            </label>
            <label>
              <span>Country</span>
              <input
                type="text"
                placeholder="Your country"
                autoComplete="country-name"
                aria-invalid={Boolean(errors.country)}
                {...register("country", {
                  required: "Country is required.",
                })}
              />
              {errors.country && (
                <small className="field-error">{errors.country.message}</small>
              )}
            </label>
          </div>

          <label className="agreement">
            <input
              type="checkbox"
              aria-invalid={Boolean(errors.accepted)}
              {...register("accepted", {
                required: "You must accept the terms to continue.",
              })}
            />
            <span>
              By creating an account, I agree to the{" "}
              <a href="#terms">Terms of Service</a> and{" "}
              <a href="#privacy">Privacy Policy</a>.
            </span>
            {errors.accepted && (
              <small className="field-error agreement-error">
                {errors.accepted.message}
              </small>
            )}
          </label>

          {error && (
            <p className="form-message form-error" role="alert">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="form-message form-success" role="status">
              {successMessage}
            </p>
          )}

          <button className="create-button" type="submit" disabled={loading}>
            <span>{loading ? "Creating account..." : "Create Account"}</span>
            {!loading && <span aria-hidden="true">&rarr;</span>}
          </button>
        </form>

        <div className="divider">
          <span>or sign up with</span>
        </div>

        <div className="social-buttons">
          <button type="button" className="social-button google">
            <span className="google-mark" aria-hidden="true">G</span>
            Sign up with Google
          </button>
          <button type="button" className="social-button facebook">
            <span className="facebook-mark" aria-hidden="true">f</span>
            Sign up with Facebook
          </button>
          <button type="button" className="social-button apple">
            <span className="apple-mark" aria-hidden="true">A</span>
            Sign up with Apple
          </button>
        </div>

        <footer>
          Already have an account? <Link to="/login">Log in</Link>
        </footer>
      </section>
    </main>
  );
}
