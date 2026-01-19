"use client";

import { Check } from "lucide-react";

interface AdjustmentNotificationProps {
  type: "adjustment" | "completion";
  currentGoal: number;
  onDismiss: () => void;
}

export default function AdjustmentNotification({
  type,
  currentGoal,
  onDismiss,
}: AdjustmentNotificationProps) {
  if (type === "adjustment") {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />

        {/* Modal */}
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-6 animate-in zoom-in-95 duration-300">
            {/* Conteúdo */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-800 leading-relaxed">
                  Dias assim fazem parte.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ajustamos automaticamente suas metas para manter o progresso no ritmo certo.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4">
                <p className="text-xs text-blue-700 font-medium mb-1">Meta atual</p>
                <p className="text-3xl font-bold text-blue-900">{currentGoal}</p>
                <p className="text-xs text-blue-700 font-medium">calorias</p>
              </div>

              <p className="text-xs text-slate-500 italic">
                Ajuste automático ativo.
              </p>
            </div>

            {/* Botão */}
            <button
              onClick={onDismiss}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              OK
            </button>
          </div>
        </div>
      </>
    );
  }

  // Notification de conclusão
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-6 animate-in zoom-in-95 duration-300">
          {/* Conteúdo */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-800 leading-relaxed">
                Seu ritmo voltou ao normal.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Seguimos no plano.
              </p>
            </div>
          </div>

          {/* Botão */}
          <button
            onClick={onDismiss}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            OK
          </button>
        </div>
      </div>
    </>
  );
}
