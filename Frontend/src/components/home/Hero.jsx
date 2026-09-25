import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/permissions";

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative bg-gradient-to-br from-primary-700 to-primary-900 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white" />
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-white" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Welcome to <br />
            <span className="text-primary-200">Smart Village</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-8 leading-relaxed">
            Your one-stop platform for village services, community updates, local businesses, jobs, and government schemes — all in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            {user ? (
              <Link to={getDashboardPath(user)} className="btn bg-white text-primary-700 hover:bg-primary-50 font-semibold px-6 py-3 text-base">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 font-semibold px-6 py-3 text-base">
                  Join the Community
                </Link>
                <Link to="/login" className="btn border border-white text-white hover:bg-white/10 px-6 py-3 text-base">
                  Login
                </Link>
              </>
            )}
            <Link to="/emergency" className="btn bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-base">
              🚨 Emergency Contacts
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
