"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ArrowLeft, Scale, Ruler, Target, Heart, UtensilsCrossed, User, Activity, Calendar } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [idade, setIdade] = useState("");
  const [pesoAtual, setPesoAtual] = useState("");
  const [altura, setAltura] = useState("");
  const [pesoDesejado, setPesoDesejado] = useState("");
  const [sexoBiologico, setSexoBiologico] = useState("");
  const [nivelAtividade, setNivelAtividade] = useState("");
  const [motivosEmagrecer, setMotivosEmagrecer] = useState<string[]>([]);
  const [restricoesAlimentares, setRestricoesAlimentares] = useState("");
  const [error, setError] = useState("");

  // Opções de múltipla escolha
  const motivosOpcoes = [
    "Melhorar a saúde",
    "Aumentar a autoestima",
    "Ter mais energia",
    "Melhorar a aparência",
    "Recomendação médica",
    "Praticar esportes",
  ];

  const sexoOpcoes = [
    "Masculino",
    "Feminino",
  ];

  const atividadeOpcoes = [
    "Sedentário (pouco ou nenhum exercício)",
    "Levemente ativo (exercício leve 1-3 dias/semana)",
    "Moderadamente ativo (exercício moderado 3-5 dias/semana)",
    "Muito ativo (exercício intenso 6-7 dias/semana)",
    "Extremamente ativo (exercício muito intenso, trabalho físico)",
  ];

  const totalSteps = 8;

  // Verificar se usuário já preencheu o formulário
  useEffect(() => {
    let mounted = true;

    const checkProfile = async () => {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          router.replace("/login");
          return;
        }

        // Verificar se já existe perfil
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data && mounted) {
          // Já tem perfil, redirecionar para home
          router.replace("/");
        }
      } catch (err) {
        console.error("Erro ao verificar perfil:", err);
      } finally {
        if (mounted) {
          setCheckingProfile(false);
        }
      }
    };

    checkProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  const toggleMotivo = (motivo: string) => {
    setMotivosEmagrecer((prev) =>
      prev.includes(motivo)
        ? prev.filter((m) => m !== motivo)
        : [...prev, motivo]
    );
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return idade !== "" && parseInt(idade) > 0 && parseInt(idade) < 120;
      case 1:
        return pesoAtual !== "" && parseFloat(pesoAtual) > 0;
      case 2:
        return altura !== "" && parseFloat(altura) > 0;
      case 3:
        return pesoDesejado !== "" && parseFloat(pesoDesejado) > 0;
      case 4:
        return sexoBiologico !== "";
      case 5:
        return nivelAtividade !== "";
      case 6:
        return motivosEmagrecer.length > 0;
      case 7:
        return true; // Restrições é opcional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setError("");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const user = await getCurrentUser();
      
      if (!user) {
        router.replace("/login");
        return;
      }

      // Validações
      const idadeNum = parseInt(idade);
      const pesoAtualNum = parseFloat(pesoAtual);
      const alturaNum = parseFloat(altura);
      const pesoDesejadoNum = parseFloat(pesoDesejado);

      if (isNaN(idadeNum) || idadeNum <= 0 || idadeNum >= 120) {
        setError("Idade inválida");
        setLoading(false);
        return;
      }

      if (isNaN(pesoAtualNum) || pesoAtualNum <= 0) {
        setError("Peso atual inválido");
        setLoading(false);
        return;
      }

      if (isNaN(alturaNum) || alturaNum <= 0) {
        setError("Altura inválida");
        setLoading(false);
        return;
      }

      if (isNaN(pesoDesejadoNum) || pesoDesejadoNum <= 0) {
        setError("Peso desejado inválido");
        setLoading(false);
        return;
      }

      if (!sexoBiologico) {
        setError("Selecione o sexo biológico");
        setLoading(false);
        return;
      }

      if (!nivelAtividade) {
        setError("Selecione o nível de atividade física");
        setLoading(false);
        return;
      }

      if (motivosEmagrecer.length === 0) {
        setError("Selecione pelo menos um motivo");
        setLoading(false);
        return;
      }

      // Salvar perfil no banco
      // Concatenar todas as informações no campo motivo_emagrecer
      const informacoesCompletas = [
        `Idade: ${idadeNum}`,
        `Sexo: ${sexoBiologico}`,
        `Atividade: ${nivelAtividade}`,
        `Motivos: ${motivosEmagrecer.join(", ")}`,
        restricoesAlimentares.trim() ? `Restrições: ${restricoesAlimentares.trim()}` : ""
      ].filter(Boolean).join(" | ");

      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          peso_atual: pesoAtualNum,
          altura: alturaNum,
          peso_desejado: pesoDesejadoNum,
          motivo_emagrecer: informacoesCompletas,
        });

      if (insertError) {
        throw insertError;
      }

      // Redirecionar para home
      router.replace("/");
    } catch (err: any) {
      console.error("Erro ao salvar perfil:", err);
      setError(err.message || "Erro ao salvar informações");
    } finally {
      setLoading(false);
    }
  };

  // Loading enquanto verifica perfil
  if (checkingProfile) {
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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Qual a sua idade?</h2>
              <p className="text-slate-500 text-sm">Em anos</p>
            </div>
            <input
              type="number"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 text-center text-lg"
              placeholder="Ex: 25"
              autoFocus
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Scale className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Qual o seu peso atual?</h2>
              <p className="text-slate-500 text-sm">Em quilogramas (kg)</p>
            </div>
            <input
              type="number"
              step="0.1"
              value={pesoAtual}
              onChange={(e) => setPesoAtual(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 text-center text-lg"
              placeholder="Ex: 75.5"
              autoFocus
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Ruler className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Qual a sua altura?</h2>
              <p className="text-slate-500 text-sm">Em centímetros (cm)</p>
            </div>
            <input
              type="number"
              step="0.1"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 text-center text-lg"
              placeholder="Ex: 170"
              autoFocus
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Qual o seu peso desejado?</h2>
              <p className="text-slate-500 text-sm">Em quilogramas (kg)</p>
            </div>
            <input
              type="number"
              step="0.1"
              value={pesoDesejado}
              onChange={(e) => setPesoDesejado(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 text-center text-lg"
              placeholder="Ex: 65"
              autoFocus
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Sexo biológico</h2>
              <p className="text-slate-500 text-sm">Selecione uma opção</p>
            </div>
            <div className="space-y-3">
              {sexoOpcoes.map((sexo) => (
                <label
                  key={sexo}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    sexoBiologico === sexo
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="sexo"
                    value={sexo}
                    checked={sexoBiologico === sexo}
                    onChange={(e) => setSexoBiologico(e.target.value)}
                    className="w-5 h-5 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-slate-700 font-medium">{sexo}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Nível de atividade física</h2>
              <p className="text-slate-500 text-sm">Como você se descreve atualmente?</p>
            </div>
            <div className="space-y-3">
              {atividadeOpcoes.map((atividade) => (
                <label
                  key={atividade}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    nivelAtividade === atividade
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="atividade"
                    value={atividade}
                    checked={nivelAtividade === atividade}
                    onChange={(e) => setNivelAtividade(e.target.value)}
                    className="w-5 h-5 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-sm text-slate-700">{atividade}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Por que você quer emagrecer?</h2>
              <p className="text-slate-500 text-sm">Selecione um ou mais motivos</p>
            </div>
            <div className="space-y-3">
              {motivosOpcoes.map((motivo) => (
                <label
                  key={motivo}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    motivosEmagrecer.includes(motivo)
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={motivosEmagrecer.includes(motivo)}
                    onChange={() => toggleMotivo(motivo)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-slate-700 font-medium">{motivo}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <UtensilsCrossed className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Restrições alimentares</h2>
              <p className="text-slate-500 text-sm">Opcional - deixe em branco se não houver</p>
            </div>
            <textarea
              value={restricoesAlimentares}
              onChange={(e) => setRestricoesAlimentares(e.target.value)}
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 resize-none"
              placeholder="Ex: Intolerância à lactose, vegetariano, alergia a frutos do mar..."
              autoFocus
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Barra de Progresso */}
      <div className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">
              Pergunta {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-xs font-medium text-blue-600">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Card da Pergunta */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 p-8 mb-6">
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {renderStep()}
          </div>

          {/* Botões de Navegação */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
            )}

            {currentStep < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Próxima
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canGoNext()}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Começar minha jornada
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Suas informações são privadas e seguras
          </p>
        </div>
      </div>
    </div>
  );
}
