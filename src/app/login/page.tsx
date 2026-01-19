"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { signIn, signUp, resetPassword, getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verificar se usuário já está autenticado
  useEffect(() => {
    let mounted = true;
    
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user && mounted) {
          // Verificar se já tem perfil
          const { data } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (data) {
            // Já tem perfil, vai para home
            window.location.href = "/";
          } else {
            // Não tem perfil, vai para onboarding
            window.location.href = "/onboarding";
          }
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };
    
    checkUser();
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "signup") {
        // Validar senhas
        if (password !== confirmPassword) {
          setError("As senhas não coincidem");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("A senha deve ter pelo menos 6 caracteres");
          setLoading(false);
          return;
        }

        const result = await signUp(email, password);
        if (result.success) {
          // Após cadastro bem-sucedido, redirecionar para onboarding
          window.location.href = "/onboarding";
        } else {
          setError(result.error?.message || "Erro ao criar conta");
        }
      } else if (mode === "login") {
        const result = await signIn(email, password);
        if (result.success) {
          // Verificar se tem perfil
          const user = await getCurrentUser();
          if (user) {
            const { data } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("user_id", user.id)
              .single();

            if (data) {
              window.location.href = "/";
            } else {
              window.location.href = "/onboarding";
            }
          }
        } else {
          setError(result.error?.message || "Email ou senha incorretos");
        }
      } else if (mode === "reset") {
        const result = await resetPassword(email);
        if (result.success) {
          setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.");
          setTimeout(() => {
            setMode("login");
            setSuccess("");
          }, 3000);
        } else {
          setError(result.error?.message || "Erro ao enviar email");
        }
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-inter font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Slingo
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {mode === "login" && "Bem-vindo de volta!"}
            {mode === "signup" && "Crie sua conta"}
            {mode === "reset" && "Recuperar senha"}
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 p-8">
          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Senha */}
            {mode !== "reset" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Confirmar Senha (apenas no cadastro) */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" && "Entrar"}
                  {mode === "signup" && "Criar Conta"}
                  {mode === "reset" && "Enviar Email"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Links de navegação */}
          <div className="mt-6 space-y-3">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("reset")}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Esqueceu sua senha?
                </button>
                <div className="text-center text-sm text-slate-600">
                  Não tem uma conta?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Cadastre-se
                  </button>
                </div>
              </>
            )}

            {mode === "signup" && (
              <div className="text-center text-sm text-slate-600">
                Já tem uma conta?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Entrar
                </button>
              </div>
            )}

            {mode === "reset" && (
              <div className="text-center text-sm text-slate-600">
                <button
                  onClick={() => setMode("login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Voltar para login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Ao continuar, você concorda com nossos Termos de Uso
        </p>
      </div>
    </div>
  );
}
