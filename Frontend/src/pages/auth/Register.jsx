import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/permissions";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageToggle } from "../../components/common/LanguageSwitcher";

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
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
      toast.error(t("auth.passwordsMismatch"));
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      toast.success(t("auth.registerSuccess"));
      navigate(getDashboardPath(user), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t("auth.registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">🏘️</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{t("auth.createAccount")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("auth.joinSubtitle")}</p>
        </div>

        <div className="card p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">{t("auth.fullName")} *</label>
              <input className="input" placeholder={t("auth.fullNamePlaceholder")} value={form.name} onChange={set("name")} required minLength={2} />
            </div>

            <div className="form-group">
              <label className="label">{t("auth.emailAddress")} *</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            </div>

            <div className="form-group">
              <label className="label">{t("auth.mobileNumber")} *</label>
              <input className="input" placeholder={t("auth.mobilePlaceholder")} value={form.phone} onChange={set("phone")} required pattern="[6-9][0-9]{9}" />
            </div>

            <div className="form-group">
              <label className="label">{t("auth.password")} *</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className="input pr-10"
                  placeholder={t("auth.passwordPlaceholder")}
                  value={form.password}
                  onChange={set("password")}
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {showPwd ? t("auth.hide") : t("auth.show")}
                </button>
              </div>
              <p className={`mt-1 text-xs ${form.password && !(form.password.length >= 8 && /[A-Z]/.test(form.password) && /\d/.test(form.password)) ? "text-red-500" : "text-gray-500"}`}>
                {t("auth.passwordPlaceholder")}
              </p>
            </div>

            <div className="form-group">
              <label className="label">{t("auth.confirmPassword")} *</label>
              <input
                type="password"
                className="input"
                placeholder={t("auth.confirmPlaceholder")}
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base">
              {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("auth.haveAccount")}{" "}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">{t("auth.signInLink")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}