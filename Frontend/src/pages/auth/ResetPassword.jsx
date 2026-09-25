import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (!token) { toast.error("Invalid or missing reset token"); return; }
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      toast.success("Password reset successfully! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Token may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">🏘️</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your new password</p>
        </div>
        <div className="card p-8 shadow-lg">
          {!token ? (
            <div className="text-center">
              <p className="text-red-500 mb-4">Invalid reset link. Please request a new one.</p>
              <Link to="/forgot-password" className="btn-primary">Request New Link</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label">New Password</label>
                <input type="password" className="input" placeholder="Min 8 chars, 1 uppercase, 1 number" value={form.password} onChange={set("password")} required minLength={8} />
              </div>
              <div className="form-group">
                <label className="label">Confirm Password</label>
                <input type="password" className="input" placeholder="Re-enter new password" value={form.confirmPassword} onChange={set("confirmPassword")} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
