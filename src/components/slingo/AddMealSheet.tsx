"use client";

import { useState, useEffect } from "react";
import { X, Search, Camera, Barcode, Edit3, Image } from "lucide-react";
import BarcodeScanner from "./BarcodeScanner";
import ManualEntry from "./ManualEntry";
import PlateScanner from "./PlateScanner";
import { Meal, BarcodeResult, PortionSize, PORTION_MULTIPLIERS, NutritionInfo, PlateAnalysisResult } from "@/lib/types/meal";
import { useMealStorage } from "@/lib/hooks/useMealStorage";
import { addMealToHistory } from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

interface AddMealSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = "main" | "barcode" | "manual" | "photo";

export default function AddMealSheet({ isOpen, onClose }: AddMealSheetProps) {
  const [mealType, setMealType] = useState<Meal["type"]>("breakfast");
  const [viewMode, setViewMode] = useState<ViewMode>("main");
  const { addMeal } = useMealStorage();
  const [userId, setUserId] = useState<string | null>(null);

  // Buscar usuário autenticado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  if (!isOpen) return null;

  const handleBarcodeResult = (result: BarcodeResult, portion: PortionSize) => {
    const multiplier = PORTION_MULTIPLIERS[portion];
    const meal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      timestamp: new Date(),
      foods: [
        {
          name: result.productName,
          portion: `${portion} (${Math.round(multiplier * 100)}%)`,
          nutrition: {
            calories: Math.round(result.nutrition.calories * multiplier),
            carbs: Math.round(result.nutrition.carbs * multiplier),
            protein: Math.round(result.nutrition.protein * multiplier),
            fat: Math.round(result.nutrition.fat * multiplier),
          },
        },
      ],
      totalNutrition: {
        calories: Math.round(result.nutrition.calories * multiplier),
        carbs: Math.round(result.nutrition.carbs * multiplier),
        protein: Math.round(result.nutrition.protein * multiplier),
        fat: Math.round(result.nutrition.fat * multiplier),
      },
      method: "barcode",
    };

    addMeal(meal);
    handleClose();
  };

  const handleManualResult = (foodName: string, quantity: string, nutrition: NutritionInfo) => {
    const meal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      timestamp: new Date(),
      foods: [
        {
          name: foodName,
          portion: quantity,
          nutrition,
        },
      ],
      totalNutrition: nutrition,
      method: "manual",
    };

    addMeal(meal);
    handleClose();
  };

  const handlePhotoResult = async (result: PlateAnalysisResult) => {
    const meal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      timestamp: new Date(),
      foods: result.foods.map((food) => ({
        name: food.name,
        portion: food.estimatedPortion,
        nutrition: food.nutrition,
        confidence: food.confidence,
      })),
      totalNutrition: result.totalNutrition,
      method: "photo",
    };

    // Salvar no localStorage
    addMeal(meal);

    // Salvar no Supabase se usuário estiver autenticado
    if (userId) {
      try {
        // Salvar cada alimento identificado como uma entrada separada
        for (const food of result.foods) {
          await addMealToHistory({
            user_id: userId,
            meal_type: mealType,
            food_name: food.name,
            calories: food.nutrition.calories,
            protein: food.nutrition.protein,
            carbs: food.nutrition.carbs,
            fat: food.nutrition.fat,
            notes: `Scanner de foto - ${food.estimatedPortion} (${Math.round((food.confidence || 0) * 100)}% confiança)`,
          });
        }
      } catch (error) {
        console.error("Erro ao salvar refeição no Supabase:", error);
      }
    }

    handleClose();
  };

  const handleClose = () => {
    setViewMode("main");
    onClose();
  };

  const handleBack = () => {
    setViewMode("main");
  };

  const getTitle = () => {
    switch (viewMode) {
      case "barcode":
        return "Código de Barras";
      case "manual":
        return "Digitar Refeição";
      case "photo":
        return "Scanner de Prato";
      default:
        return "Adicionar Refeição";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl z-50 animate-in slide-in-from-bottom duration-300 shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {viewMode !== "main" && (
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <h3 className="text-xl font-inter font-bold text-slate-800">{getTitle()}</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {viewMode === "barcode" && (
            <BarcodeScanner onResult={handleBarcodeResult} onBack={handleBack} />
          )}

          {viewMode === "manual" && (
            <ManualEntry onResult={handleManualResult} onBack={handleBack} />
          )}

          {viewMode === "photo" && (
            <PlateScanner onResult={handlePhotoResult} onBack={handleBack} />
          )}

          {viewMode === "main" && (
            <>
              {/* Meal Type Selector */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <MealTypeButton
                  label="Café"
                  active={mealType === "breakfast"}
                  onClick={() => setMealType("breakfast")}
                />
                <MealTypeButton
                  label="Almoço"
                  active={mealType === "lunch"}
                  onClick={() => setMealType("lunch")}
                />
                <MealTypeButton
                  label="Jantar"
                  active={mealType === "dinner"}
                  onClick={() => setMealType("dinner")}
                />
                <MealTypeButton
                  label="Outros"
                  active={mealType === "snack"}
                  onClick={() => setMealType("snack")}
                />
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700">Escolha o Método</h4>
                
                <QuickActionButton
                  icon={Barcode}
                  label="Código de Barras"
                  description="Escaneie o código do produto"
                  color="blue"
                  onClick={() => setViewMode("barcode")}
                />
                
                <QuickActionButton
                  icon={Edit3}
                  label="Digitar Refeição"
                  description="Descreva o que você comeu"
                  color="green"
                  onClick={() => setViewMode("manual")}
                />
                
                <QuickActionButton
                  icon={Image}
                  label="Scanner de Prato"
                  description="Tire uma foto da sua refeição"
                  color="purple"
                  onClick={() => setViewMode("photo")}
                />
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-700">
                  💡 <span className="font-semibold">Dica:</span> Para maior precisão, use o código
                  de barras. Para refeições caseiras, use o scanner de prato ou digitação manual.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function MealTypeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
        active
          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  description,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  description: string;
  color: "blue" | "green" | "purple";
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
    green: "from-green-500 to-green-600 shadow-green-500/30",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/30",
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:scale-105 transition-all duration-300"
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </button>
  );
}
