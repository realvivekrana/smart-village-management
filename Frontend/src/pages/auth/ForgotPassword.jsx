import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("If this email is registered, a reset link has been sent.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">🏘️</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">We'll send a reset link to your email</p>
        </div>

        <div className="card p-8 shadow-lg">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Check Your Email</h2>
              <p className="text-sm text-gray-500 mb-6">
                If an account with <strong>{email}</strong> exists, a password reset link has been sent.
              </p>
              <Link to="/login" className="btn-primary">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-primary-600 hover:underline">← Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
