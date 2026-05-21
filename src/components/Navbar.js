"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const email = localStorage.getItem("stake_user");
      if (email) {
        try {
          const res = await fetch("/api/user", {
            headers: { "x-email": email }
          });
          const data = await res.json();
          if (res.ok) {
            setUser({ email, balance: data.balance });
          } else {
            localStorage.removeItem("stake_user");
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    
    fetchUser();
    // Simple event listener for cross-component auth sync
    window.addEventListener("auth-change", fetchUser);
    
    const handleBalanceUpdate = (e) => {
      if (e.detail !== undefined) {
        setUser((prev) => prev ? { ...prev, balance: e.detail } : null);
      }
    };
    window.addEventListener("balance-update", handleBalanceUpdate);

    return () => {
      window.removeEventListener("auth-change", fetchUser);
      window.removeEventListener("balance-update", handleBalanceUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("stake_user");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-tile)] shadow-sm relative">
      <div className="flex items-center gap-3">
        {pathname !== "/" && (
          <Link href="/" className="text-[var(--color-text-secondary)] hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--color-tile)] opacity-60 hover:opacity-100 text-lg" title="Back to Home">
            ←
          </Link>
        )}
        <Link href="/" className="text-2xl font-black italic tracking-wider text-white">
          Stake
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center bg-[var(--color-page)] rounded-lg p-1 border border-[var(--color-tile)] hover:border-[var(--color-cta)] transition-colors cursor-pointer group shadow-sm">
              <div className="flex items-center gap-2 pl-3 pr-2 py-1">
                <span className="text-white font-bold text-sm tracking-wide">
                  {user.balance.toFixed(2)}
                </span>
                <span className="text-[var(--color-cta)] font-black text-xs mr-2">USDT</span>
              </div>
              <div className="bg-[var(--color-cta)] group-hover:bg-[var(--color-cta-hover)] transition-colors rounded-md px-4 py-1.5 text-white font-bold text-sm shadow-[0_2px_8px_rgba(20,117,225,0.3)] flex items-center gap-2">
                <span>Wallet</span>
              </div>
            </div>
            {/* Desktop Logout */}
            <button 
              onClick={handleLogout}
              className="hidden md:block px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-white transition-colors"
            >
              Logout
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1 text-[var(--color-text-secondary)] hover:text-white transition-colors ml-1"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
              <div className="absolute top-[100%] right-4 mt-2 bg-[#213743] border border-[var(--color-tile)] rounded-lg shadow-2xl py-2 w-48 z-50 md:hidden flex flex-col">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-4 py-3 text-left font-bold text-[var(--color-text-secondary)] hover:text-white hover:bg-[#2a4555] transition-colors w-full flex items-center gap-3"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-bold text-white hover:text-[var(--color-text-secondary)] transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 text-sm font-bold bg-[var(--color-cta)] text-white rounded hover:bg-[var(--color-cta-hover)] transition-colors shadow-[0_2px_10px_rgba(20,117,225,0.3)]"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
