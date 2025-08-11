import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import "@/styles/Login.css"

const carouselItems = [
  "Secure Registration",
  "Data Protection",
  "Smart Features",
  "Real-time Updates",
  "City-wide Integration"
]

export function SignupPage() {
  const navigate = useNavigate()
  const { signup, loading, error: authError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await signup(email, password, name)
      navigate("/login", { 
        replace: true,
        state: { message: "Account created successfully! Please log in." }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up")
    }
  }

  return (
    <div className="login">
      <video src="/assets/loginbg.mp4" className="login__video" autoPlay loop muted />
      
      <h2 className="login__tagline">
        "Join the Smart City Revolution.<br/>
        Connect, Collaborate, Transform.<br/>
        Your Gateway to Urban Innovation.<br/>
        Building Tomorrow's Cities Today."
      </h2>

      <div className="carousel-container">
        <div className="carousel-wrapper">
          {carouselItems.map((item, index) => (
            <div key={index} className="carousel-box">{item}</div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="login__form">
        <h1 className="login__title">Sign Up</h1>

        {(error || authError) && (
          <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/50 rounded-xl border border-red-500/20" role="alert">
            {error || authError}
          </div>
        )}

        <div className="login__content">
          <div className="login__box">
            <i className="ri-user-3-line login__icon"></i>
            <div className="login__box-input">
              <input
                type="text"
                required
                className="login__input"
                id="signup-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="signup-name" className="login__label">Full Name</label>
            </div>
          </div>

          <div className="login__box">
            <i className="ri-mail-line login__icon"></i>
            <div className="login__box-input">
              <input
                type="email"
                required
                className="login__input"
                id="signup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="signup-email" className="login__label">Email</label>
            </div>
          </div>

          <div className="login__box">
            <i className="ri-lock-2-line login__icon"></i>
            <div className="login__box-input">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="login__input"
                id="signup-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="signup-pass" className="login__label">Password</label>
              <i 
                className={`ri-eye${showPassword ? '' : '-off'}-line login__eye`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>

          <div className="login__box">
            <i className="ri-lock-2-line login__icon"></i>
            <div className="login__box-input">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                className="login__input"
                id="signup-confirm-pass"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="signup-confirm-pass" className="login__label">Confirm Password</label>
              <i 
                className={`ri-eye${showConfirmPassword ? '' : '-off'}-line login__eye`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              ></i>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="login__button"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="login__register">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}