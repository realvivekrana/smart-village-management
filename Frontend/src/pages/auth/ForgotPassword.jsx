import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast.error("Valid 10-digit phone number daalein");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      toast.error("Password me kam se kam 1 capital letter aur 1 number hona chahiye");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      toast.success("Password reset ho gaya! Ab login karein.");
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === "ECONNABORTED"
          ? "Server se jawab nahi aaya. Thodi der baad dobara koshish karein."
          : "Something went wrong. Please try again.");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">🏘️</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">Apna email aur registered phone number daalkar naya password set karein</p>
        </div>

        <div className="card p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set("email")} required autoFocus />
            </div>
            <div className="form-group">
              <label className="label">Registered Phone Number</label>
              <input type="tel" inputMode="numeric" maxLength={10} className="input" placeholder="10-digit mobile number" value={form.phone} onChange={set("phone")} required />
            </div>
            <div className="form-group">
              <label className="label">New Password</label>
              <input type="password" className="input" placeholder="Min 8 chars, 1 uppercase, 1 number" value={form.password} onChange={set("password")} required minLength={8} />
            </div>
            <div className="form-group">
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" placeholder="Re-enter new password" value={form.confirmPassword} onChange={set("confirmPassword")} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? "Saving..." : "Save New Password"}
            </button>
            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-primary-600 hover:underline">← Back to Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}