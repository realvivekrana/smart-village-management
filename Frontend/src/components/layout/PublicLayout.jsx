import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileMenu from "./MobileMenu";
import ChatAssistant from "../assistant/ChatAssistant";

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // A new page should start at the top; the menu closes on navigation.
  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar onMenuOpen={() => setMenuOpen(true)} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  );
}