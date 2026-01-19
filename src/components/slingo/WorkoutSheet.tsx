"use client";

import { useState } from "react";
import { X, Dumbbell, ChevronRight } from "lucide-react";
import { WorkoutType, WorkoutIntensity } from "@/lib/types/meal";
import { calculateWorkoutCalories, formatWorkoutType, formatWorkoutIntensity } from "@/lib/utils/workoutCalculator";

interface WorkoutSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (workout: {
    type: WorkoutType;
    sportName?: string;
    intensity: WorkoutIntensity;
    duration: number;
    caloriesBurned: number;
  }) => void;
}

type Step = "type" | "intensity" | "duration";

export default function WorkoutSheet({ isOpen, onClose, onRegister }: WorkoutSheetProps) {
  const [step, setStep] = useState<Step>("type");
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
  const [sportName, setSportName] = useState("");
  const [intensity, setIntensity] = useState<WorkoutIntensity | null>(null);
  const [duration, setDuration] = useState(30);

  const handleClose = () => {
    setStep("type");
    setWorkoutType(null);
    setSportName("");
    setIntensity(null);
    setDuration(30);
    onClose();
  };

  const handleTypeSelect = (type: WorkoutType) => {
    setWorkoutType(type);
    if (type !== "esporte") {
      setStep("intensity");
    }
  };

  const handleSportSubmit = () => {
    if (sportName.trim()) {
      setStep("intensity");
    }
  };

  const handleIntensitySelect = (selectedIntensity: WorkoutIntensity) => {
    setIntensity(selectedIntensity);
    setStep("duration");
  };

  const handleRegister = () => {
    if (workoutType && intensity) {
      const caloriesBurned = calculateWorkoutCalories(workoutType, intensity, duration);
      onRegister({
        type: workoutType,
        sportName: workoutType === "esporte" ? sportName : undefined,
        intensity,
        duration,
        caloriesBurned,
      });
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Registrar Treino</h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "type" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-6">Que tipo de treino você fez?</p>
              
              <button
                onClick={() => handleTypeSelect("musculacao")}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-center justify-between group"
              >
                <span className="text-slate-800 font-medium">Musculação</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              <button
                onClick={() => handleTypeSelect("cardio")}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-center justify-between group"
              >
                <span className="text-slate-800 font-medium">Cardio</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              <button
                onClick={() => handleTypeSelect("esporte")}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-center justify-between group"
              >
                <span className="text-slate-800 font-medium">Esporte</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              {workoutType === "esporte" && (
                <div className="mt-6 space-y-3">
                  <label className="text-sm text-slate-600">Qual esporte?</label>
                  <input
                    type="text"
                    value={sportName}
                    onChange={(e) => setSportName(e.target.value)}
                    placeholder="Ex: Futebol, Natação, Tênis..."
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={handleSportSubmit}
                    disabled={!sportName.trim()}
                    className="w-full p-4 rounded-2xl bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "intensity" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-6">Qual foi a intensidade?</p>
              
              <button
                onClick={() => handleIntensitySelect("leve")}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-center justify-between group"
              >
                <span className="text-slate-800 font-medium">Leve</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              <button
                onClick={() => handleIntensitySelect("moderada")}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-center justify-between group"
              >
                <span className="text-slate-800 font-medium">Moderada</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              <button
                onClick={() => handleIntensitySelect("pesada")}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-center justify-between group"
              >
                <span className="text-slate-800 font-medium">Pesada</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            </div>
          )}

          {step === "duration" && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">Quanto tempo durou?</p>
              
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-5xl font-bold text-slate-800">{duration}</span>
                  <span className="text-2xl text-slate-500 ml-2">min</span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-800 [&::-webkit-slider-thumb]:cursor-pointer"
                />

                <div className="flex justify-between text-xs text-slate-400">
                  <span>10 min</span>
                  <span>120 min</span>
                </div>
              </div>

              <button
                onClick={handleRegister}
                className="w-full p-4 rounded-2xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors mt-8"
              >
                Registrar treino
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
