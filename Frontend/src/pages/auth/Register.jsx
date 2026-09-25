import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/permissions";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "", role: "citizen",
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      toast.success("Registration successful! Welcome!");
      navigate(getDashboardPath(user), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">🏘️</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join your village community</p>
        </div>

        <div className="card p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Your full name" value={form.name} onChange={set("name")} required minLength={2} />
            </div>

            <div className="form-group">
              <label className="label">Email Address *</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            </div>

            <div className="form-group">
              <label className="label">Mobile Number *</label>
              <input className="input" placeholder="10-digit mobile number" value={form.phone} onChange={set("phone")} required pattern="[6-9][0-9]{9}" />
            </div>

            <div className="form-group">
              <label className="label">I am a</label>
              <select className="input" value={form.role} onChange={set("role")}>
                <option value="citizen">Citizen / Resident</option>
                <option value="business_owner">Business Owner</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={form.password}
                  onChange={set("password")}
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Confirm Password *</label>
              <input
                type="password"
                className="input"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
