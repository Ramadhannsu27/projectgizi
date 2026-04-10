"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password harus diisi.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal. Periksa kredensial Anda.");
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_name", data.user.full_name);

      toast.success(`Selamat datang, ${data.user.full_name}!`);
      router.push("/dashboard");
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-3 sm:p-4">
      {/* Desktop mode hint for mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-blue-600 text-white px-3 py-2 text-center">
          <p className="text-[10px] sm:text-xs font-medium leading-tight">
            💻 Tampilan terbaik di Desktop Mode — aktifkan via menu browser
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-100 dark:bg-green-900/20 opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-100 dark:bg-emerald-900/20 opacity-50" />
      </div>

      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-green-600 text-white shadow-lg dark:shadow-green-900/50 mb-3 sm:mb-4 overflow-hidden">
            <img src="/logo-mbg.webp" alt="MBG" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200">
            MBG
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 px-2">
            Pemantauan Status Gizi Siswa
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-slate-900 shadow-green-100/50 border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-5 sm:p-6 lg:p-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              Masuk ke Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Masukkan kredensial petugas UKS
            </p>

            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                Masuk
              </Button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all"
              >
                <Users className="h-4 w-4" />
                Masuk sebagai Pengunjung
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 lg:px-8 py-3 sm:py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
            <p className="text-[10px] sm:text-xs text-center text-slate-400 dark:text-slate-500">
              Gunakan kredensial dari administrator
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-4 sm:mt-6">
          Standar WHO 2007 &middot; Powered by MBG
        </p>
      </div>
    </div>
  );
}
