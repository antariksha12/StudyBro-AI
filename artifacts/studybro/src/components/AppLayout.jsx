import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout({ children, streak = 0, chatMode = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu whenever the user navigates (selects a conversation, etc.)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const mobileNav = (
    <>
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="glass flex h-11 w-11 items-center justify-center text-white transition-all duration-250 hover:border-white/20 active:scale-95"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Sidebar panel */}
          <div className="h-full w-64 p-4 animate-fade-in">
            <Sidebar streak={streak} />
          </div>
          {/* Backdrop — tap to close */}
          <button
            className="flex-1 bg-black/70 backdrop-blur-sm transition-opacity duration-250"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="absolute top-8 right-8 text-white/70 transition-colors hover:text-white" size={22} />
          </button>
        </div>
      )}
    </>
  );

  if (chatMode) {
    return (
      <div className="flex h-dvh overflow-hidden bg-black bg-mesh">
        {/* Desktop sidebar — p-4 wrapper; sidebar fills via h-full */}
        <div className="hidden md:flex shrink-0 flex-col p-4">
          <Sidebar streak={streak} />
        </div>

        {mobileNav}

        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-mesh">
      <div className="mx-auto flex max-w-7xl gap-6 p-4">
        <div className="hidden md:flex shrink-0 flex-col">
          <Sidebar streak={streak} />
        </div>

        {mobileNav}

        <main className="min-w-0 flex-1 py-2 md:py-0">{children}</main>
      </div>
    </div>
  );
}
