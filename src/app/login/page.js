"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("stake_user")) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requiresOtp) {
          setRequiresOtp(true);
          if (data.previewUrl) setPreviewUrl(data.previewUrl);
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("stake_user", data.email);
        window.dispatchEvent(new Event("auth-change"));
        router.push("/");
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--color-surface)] p-8 rounded-lg shadow-xl border border-[var(--color-tile)]">
        <h1 className="text-3xl font-black italic text-center mb-6">{requiresOtp ? "Verify OTP" : "Sign In"}</h1>
        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded text-sm font-semibold">{error}</div>}
        
        {requiresOtp && previewUrl && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded text-xs font-semibold">
            Test Email Sent! View OTP here: <a href={previewUrl} target="_blank" rel="noreferrer" className="underline font-bold text-white">Open Ethereal URL</a>
          </div>
        )}

        {!requiresOtp ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--color-page)] border border-[var(--color-tile)] rounded p-3 text-white focus:outline-none focus:border-[var(--color-cta)] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-page)] border border-[var(--color-tile)] rounded p-3 text-white focus:outline-none focus:border-[var(--color-cta)] transition-colors"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full mt-4 bg-[var(--color-cta)] hover:bg-[var(--color-cta-hover)] text-white font-bold py-3 rounded transition-colors shadow-[0_4px_14px_rgba(20,117,225,0.39)]"
            >
              Log In
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Enter 6-Digit OTP</label>
              <input 
                type="text" 
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-[var(--color-page)] border border-[var(--color-tile)] rounded p-3 text-white focus:outline-none focus:border-[var(--color-cta)] transition-colors text-center font-mono text-xl tracking-widest"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full mt-4 bg-[var(--color-cta)] hover:bg-[var(--color-cta-hover)] text-white font-bold py-3 rounded transition-colors shadow-[0_4px_14px_rgba(20,117,225,0.39)]"
            >
              Verify & Play
            </button>
            <button 
              type="button" 
              onClick={() => setRequiresOtp(false)}
              className="w-full text-center text-sm text-[var(--color-text-secondary)] hover:text-white mt-2"
            >
              Back to Login
            </button>
          </form>
        )}

        {!requiresOtp && (
          <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Don&apos;t have an account? <Link href="/register" className="text-[var(--color-cta)] hover:underline font-bold">Register</Link>
          </div>
        )}
      </div>
    </div>
  );
}
