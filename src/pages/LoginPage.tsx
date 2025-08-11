import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import "@/styles/Login.css"

const carouselItems = [
  "Secure Login",
  "2FA Authentication",
  "Fast Access",
  "Encrypted Data",
  "Multi-Device Support"
]

const VALID_EMAIL = "dbit@gmail.com"
const VALID_PASSWORD = "dbit"

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const successMessage = location.state?.message

  useEffect(() => {
    // Clone carousel items for infinite scroll effect
    const carousel = document.querySelector(".carousel-wrapper");
    if (carousel) {
      carouselItems.forEach(item => {
        const clone = document.createElement("div");
        clone.className = "carousel-box";
        clone.textContent = item;
        carousel.appendChild(clone);
      });
    }

    // Add parallax effect
    const form = document.querySelector(".login__form") as HTMLElement;
    if (!form) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = form.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);
      const maxRotate = 10;

      form.style.transform = `
        perspective(1000px)
        rotateY(${percentX * maxRotate}deg)
        rotateX(${-percentY * maxRotate}deg)
      `;
    };

    const handleMouseLeave = () => {
      form.style.transform = `
        perspective(1000px)
        rotateY(0deg)
        rotateX(0deg)
      `;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      sessionStorage.setItem('userEmail', email);
      navigate('/dashboard');
    } else {
      setError("Invalid email or password. Please use dbit@gmail.com/dbit");
    }
  }

  return (
    <div className="login">
      <video src="/assets/loginbg.mp4" className="login__video" autoPlay loop muted />
      
      <h2 className="login__tagline">
        "One Platform, One City.<br/>
        Real-Time Data, Reliable Insights.<br/>
        Stay Informed, Stay Connected.<br/>
        Smarter Decisions for a Smarter Future."
      </h2>

      <div className="carousel-container">
        <div className="carousel-wrapper">
          {carouselItems.map((item, index) => (
            <div key={index} className="carousel-box">{item}</div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="login__form">
        <h1 className="login__title">Login</h1>

        {successMessage && (
          <div className="p-3 mb-4 text-sm text-green-400 bg-green-900/50 rounded-xl border border-green-500/20" role="alert">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/50 rounded-xl border border-red-500/20" role="alert">
            {error}
          </div>
        )}

        <div className="login__content">
          <div className="login__box">
            <i className="ri-user-3-line login__icon"></i>
            <div className="login__box-input">
              <input
                type="email"
                required
                className="login__input"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="login-email" className="login__label">Email</label>
            </div>
          </div>

          <div className="login__box">
            <i className="ri-lock-2-line login__icon"></i>
            <div className="login__box-input">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="login__input"
                id="login-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="login-pass" className="login__label">Password</label>
              <i 
                className={`ri-eye${showPassword ? '' : '-off'}-line login__eye`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>
        </div>

        <div className="login__check">
          <div className="login__check-group">
            <input
              type="checkbox"
              className="login__check-input"
              id="login-check"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="login-check" className="login__check-label">Remember me</label>
          </div>

          <a href="#" className="login__forgot">Forgot Password?</a>
        </div>

        <button 
          type="submit" 
          className="login__button"
        >
          Login
        </button>

        <p className="login__register">
          Don't have an account? <Link to="/signup">Register</Link>
        </p>
      </form>
    </div>
  )
}
