import { useState } from "react";

function Signup({ onSignup, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Signup failed.");
        return;
      }

      alert("Account created successfully! Please login.");

      // Signup ke baad Login page par bhejo
      onSignup();
    } catch (error) {
      console.error("Signup error:", error);
      alert("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <button className="auth-back" onClick={onBack}>
          ← Back
        </button>

        <div className="auth-header">
          <span className="auth-label">GET STARTED</span>
          <h1>Create Account</h1>
          <p>Create your FinCalc account to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" onClick={onSignup}>
            Login
          </button>
        </p>
      </div>
    </main>
  );
}

export default Signup;