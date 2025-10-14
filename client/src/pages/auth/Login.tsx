import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import "./AuthStyles.css";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to return URL or home
      const from = (location.state as any)?.from || "/";
      navigate(from);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="auth-card">
        <input
          className="blind-check"
          type="checkbox"
          id="blind-input"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          hidden
        />

        <label htmlFor="blind-input" className="blind_input">
          <span className="hide">Hide</span>
          <span className="show">Show</span>
        </label>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="title">Sign In</div>

          <label className="label_input" htmlFor="email-input">
            Email
          </label>
          <input
            spellCheck="false"
            className="auth-input"
            type="email"
            name="email"
            id="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="frg_pss">
            <label className="label_input" htmlFor="password-input">
              Password
            </label>
            <a href="/forgot-password" className="forgot-link">
              Forgot password?
            </a>
          </div>
          <input
            spellCheck="false"
            className="auth-input"
            type={showPassword ? "text" : "password"}
            name="password"
            id="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </form>

        <label
          htmlFor="blind-input"
          className="avatar"
          aria-label="Toggle password visibility"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            viewBox="0 0 64 64"
            id="monkey"
            aria-hidden="true"
          >
            <ellipse
              cx="53.7"
              cy="33"
              rx="8.3"
              ry="8.2"
              fill="#89664c"
            ></ellipse>
            <ellipse
              cx="53.7"
              cy="33"
              rx="5.4"
              ry="5.4"
              fill="#ffc5d3"
            ></ellipse>
            <ellipse
              cx="10.2"
              cy="33"
              rx="8.2"
              ry="8.2"
              fill="#89664c"
            ></ellipse>
            <ellipse
              cx="10.2"
              cy="33"
              rx="5.4"
              ry="5.4"
              fill="#ffc5d3"
            ></ellipse>
            <g fill="#89664c">
              <path d="m43.4 10.8c1.1-.6 1.9-.9 1.9-.9-3.2-1.1-6-1.8-8.5-2.1 1.3-1 2.1-1.3 2.1-1.3-20.4-2.9-30.1 9-30.1 19.5h46.4c-.7-7.4-4.8-12.4-11.8-15.2"></path>
              <path d="m55.3 27.6c0-9.7-10.4-17.6-23.3-17.6s-23.3 7.9-23.3 17.6c0 2.3.6 4.4 1.6 6.4-1 2-1.6 4.2-1.6 6.4 0 9.7 10.4 17.6 23.3 17.6s23.3-7.9 23.3-17.6c0-2.3-.6-4.4-1.6-6.4 1-2 1.6-4.2 1.6-6.4"></path>
            </g>
            <path
              d="m52 28.2c0-16.9-20-6.1-20-6.1s-20-10.8-20 6.1c0 4.7 2.9 9 7.5 11.7-1.3 1.7-2.1 3.6-2.1 5.7 0 6.1 6.6 11 14.7 11s14.7-4.9 14.7-11c0-2.1-.8-4-2.1-5.7 4.4-2.7 7.3-7 7.3-11.7"
              fill="#e0ac7e"
            ></path>
            <g fill="#3b302a" className="monkey-eye-nose">
              <path d="m35.1 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.6.1 1 1 1 2.1"></path>
              <path d="m30.9 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.5.1 1 1 1 2.1"></path>
              <ellipse
                cx="40.7"
                cy="31.7"
                rx="3.5"
                ry="4.5"
                className="monkey-eye-r"
              ></ellipse>
              <ellipse
                cx="23.3"
                cy="31.7"
                rx="3.5"
                ry="4.5"
                className="monkey-eye-l"
              ></ellipse>
            </g>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            viewBox="0 0 64 64"
            id="monkey-hands"
            aria-hidden="true"
          >
            <path
              fill="#89664C"
              d="M9.4,32.5L2.1,61.9H14c-1.6-7.7,4-21,4-21L9.4,32.5z"
            ></path>
            <path
              fill="#FFD6BB"
              d="M15.8,24.8c0,0,4.9-4.5,9.5-3.9c2.3,0.3-7.1,7.6-7.1,7.6s9.7-8.2,11.7-5.6c1.8,2.3-8.9,9.8-8.9,9.8
	s10-8.1,9.6-4.6c-0.3,3.8-7.9,12.8-12.5,13.8C11.5,43.2,6.3,39,9.8,24.4C11.6,17,13.3,25.2,15.8,24.8"
            ></path>
            <path
              fill="#89664C"
              d="M54.8,32.5l7.3,29.4H50.2c1.6-7.7-4-21-4-21L54.8,32.5z"
            ></path>
            <path
              fill="#FFD6BB"
              d="M48.4,24.8c0,0-4.9-4.5-9.5-3.9c-2.3,0.3,7.1,7.6,7.1,7.6s-9.7-8.2-11.7-5.6c-1.8,2.3,8.9,9.8,8.9,9.8
	s-10-8.1-9.7-4.6c0.4,3.8,8,12.8,12.6,13.8c6.6,1.3,11.8-2.9,8.3-17.5C52.6,17,50.9,25.2,48.4,24.8"
            ></path>
          </svg>
        </label>
      </div>
    </div>
  );
};
