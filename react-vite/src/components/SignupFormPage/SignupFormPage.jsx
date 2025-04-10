import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { thunkSignup } from "../../redux/session";
import { FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import "./SignupForm.css";

function SignupFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector((state) => state.session.user);
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed) {
      return setErrors({ agreement: "You must agree to the terms and privacy policy." });
    }

    const serverResponse = await dispatch(
      thunkSignup({
        email: phone + "@demo.com",
        username: phone,
        password: verificationCode,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="signup-page">
      <div className="left-pane" />
      <div className="right-pane">
        <div className="signup-card">
          <h1 className="signup-title">Sign Up with Your Phone Number</h1>
          <form onSubmit={handleSubmit} className="signup-form">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-with-dropdown">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                <option value="+1">🇺🇸 +1 (US)</option>
                <option value="+81">🇯🇵 +81 (JP)</option>
                <option value="+44">🇬🇧 +44 (UK)</option>
                <option value="+91">🇮🇳 +91 (IN)</option>
              </select>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <label htmlFor="verification">Verification Code</label>
            <div className="input-with-button">
              <input
                type="text"
                id="verification"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
              <button type="button" className="send-code-btn">Send Code</button>
            </div>

            <label className="agreement">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I have read and agreed to <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </label>
            {errors.agreement && <p className="error">{errors.agreement}</p>}

            <button type="submit">Next</button>

            <p className="login-link">
              Already have an account? <Link to="/login">Log in</Link>
            </p>

            <div className="social-buttons">
              <button
                type="button"
                className="social-button facebook"
                onClick={() => navigate("/login")}
              >
                <FaFacebookF style={{ marginRight: "8px" }} /> Facebook
              </button>
              <button
                type="button"
                className="social-button google"
                onClick={() => navigate("/login")}
              >
                <FcGoogle style={{ marginRight: "8px" }} /> Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupFormPage;
