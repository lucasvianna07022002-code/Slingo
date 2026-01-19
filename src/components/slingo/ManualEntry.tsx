"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { NutritionInfo } from "@/lib/types/meal";
import { estimateNutritionFromText, parseManualEntry } from "@/lib/utils/nutritionCalculator";

interface ManualEntryProps {
  onResult: (foodName: string, quantity: string, nutrition: NutritionInfo) => void;
  onBack: () => void;
}

export default function ManualEntry({ onResult, onBack }: ManualEntryProps) {
  const [manualMealText, setManualMealText] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState<NutritionInfo | null>(null);

  const handleCalculate = async () => {
    if (!manualMealText.trim()) return;

    setIsCalculating(true);

    // Simular delay de processamento
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const nutrition = estimateNutritionFromText(manualMealText);
    setCalculatedNutrition(nutrition);
    setIsCalculating(false);
  };

  const handleConfirm = () => {
    if (calculatedNutrition) {
      const parsed = parseManualEntry(manualMealText);
      onResult(
        parsed?.foodName || manualMealText,
        `${parsed?.quantity}${parsed?.unit}`,
        calculatedNutrition
      );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          O que você comeu?
        </label>
        <textarea
          value={manualMealText}
          onChange={(e) => {
            setManualMealText(e.target.value);
            setCalculatedNutrition(null);
          }}
          placeholder="Ex: 2 fatias de pão integral com queijo branco, 1 banana, 200g de frango grelhado..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          rows={5}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-sm text-blue-700">
          💡 <span className="font-semibold">Dica:</span> Seja específico com as quantidades (ex:
          "2 colheres", "150g", "1 unidade") para estimativas mais precisas.
        </p>
      </div>

      {!calculatedNutrition ? (
        <button
          onClick={handleCalculate}
          disabled={!manualMealText.trim() || isCalculating}
          className="w-full py-3 rounded-2xl bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Calcular Valores Nutricionais
            </>
          )}
        </button>
      ) : (
        <>
          {/* Nutrition Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-slate-800">Valores Estimados</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <p className="text-xs text-orange-600 mb-1">Calorias</p>
                <p className="text-2xl font-bold text-orange-700">
                  {calculatedNutrition.calories}
                </p>
                <p className="text-xs text-orange-600">kcal</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-600 mb-1">Carboidratos</p>
                <p className="text-2xl font-bold text-blue-700">{calculatedNutrition.carbs}</p>
                <p className="text-xs text-blue-600">gramas</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs text-green-600 mb-1">Proteínas</p>
                <p className="text-2xl font-bold text-green-700">{calculatedNutrition.protein}</p>
                <p className="text-xs text-green-600">gramas</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <p className="text-xs text-purple-600 mb-1">Gorduras</p>
                <p className="text-2xl font-bold text-purple-700">{calculatedNutrition.fat}</p>
                <p className="text-xs text-purple-600">gramas</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm text-amber-700">
              ⚠️ <span className="font-semibold">Atenção:</span> Estes são valores estimados
              baseados em porções padrão. Para maior precisão, use o scanner de código de barras.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCalculatedNutrition(null);
                setManualMealText("");
              }}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
            >
              Editar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Confirmar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
