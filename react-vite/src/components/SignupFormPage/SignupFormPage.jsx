import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { thunkSignup } from "../../redux/session";
import { FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import "./SignupForm.css";

const countryOptions = [
  { code: "+1", name: "United States" },
  { code: "+93", name: "Afghanistan" },
  { code: "+44", name: "United Kingdom" },
  { code: "+91", name: "India" },
  { code: "+213", name: "Algeria" },
  { code: "+61", name: "Australia" },
  { code: "+43", name: "Austria" },
  { code: "+32", name: "Belgium" },
  { code: "+55", name: "Brazil" },
  { code: "+359", name: "Bulgaria" },
  { code: "+1", name: "Canada" },
  { code: "+86", name: "China" },
  { code: "+57", name: "Colombia" },
  { code: "+420", name: "Czech Republic" },
  { code: "+45", name: "Denmark" },
  { code: "+20", name: "Egypt" },
  { code: "+33", name: "France" },
  { code: "+49", name: "Germany" },
  { code: "+30", name: "Greece" },
  { code: "+852", name: "Hong Kong" },
  { code: "+36", name: "Hungary" },
  { code: "+62", name: "Indonesia" },
  { code: "+98", name: "Iran" },
  { code: "+353", name: "Ireland" },
  { code: "+972", name: "Israel" },
  { code: "+39", name: "Italy" },
  { code: "+81", name: "Japan" },
  { code: "+82", name: "South Korea" },
  { code: "+60", name: "Malaysia" },
  { code: "+52", name: "Mexico" },
  { code: "+31", name: "Netherlands" },
  { code: "+64", name: "New Zealand" },
  { code: "+47", name: "Norway" },
  { code: "+92", name: "Pakistan" },
  { code: "+63", name: "Philippines" },
  { code: "+48", name: "Poland" },
  { code: "+351", name: "Portugal" },
  { code: "+40", name: "Romania" },
  { code: "+7", name: "Russia" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+65", name: "Singapore" },
  { code: "+27", name: "South Africa" },
  { code: "+34", name: "Spain" },
  { code: "+46", name: "Sweden" },
  { code: "+41", name: "Switzerland" },
  { code: "+90", name: "Turkey" },
  { code: "+971", name: "UAE" },
  { code: "+380", name: "Ukraine" },
  { code: "+998", name: "Uzbekistan" },
  { code: "+58", name: "Venezuela" },
  { code: "+84", name: "Vietnam" },
  { code: "+260", name: "Zambia" },
  { code: "+263", name: "Zimbabwe" },
];

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
      <div className="left-pane">
        <div className="intro-text">
          <h2>Start Trading with StockYard</h2>
          <p>Invest in Stocks, ETFs, Futures & More.</p>
          <p>Zero commissions on eligible trades*</p>
          <p style={{ fontSize: "0.75rem", marginTop: "10px" }}>
            *Exchange and regulatory fees may apply. See our pricing page for details.
            <br />
            *Options trading involves risk and may result in losses exceeding your initial investment.
            Learn more at our Policy Center.
          </p>
          <img
            src="https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1350&q=80"
            alt="Stock market illustration"
          />
        </div>
      </div>

      <div className="right-pane">
        <div className="signup-container">
          <h1 className="signup-title">Sign Up with Your Phone Number</h1>
          <form onSubmit={handleSubmit} className="signup-form">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-with-dropdown">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                {countryOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} {option.name}
                  </option>
                ))}
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
