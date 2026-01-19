"use client";

import { useState } from "react";
import { X, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";

interface CustomRecipe {
  id: number;
  name: string;
  ingredients: string[];
  steps: string[];
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  time: string;
  fitTip: string;
  category: string;
  icon: string;
  tags: string[];
  isCustom: true;
}

interface AddCustomRecipeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: CustomRecipe) => void;
}

export default function AddCustomRecipeSheet({ isOpen, onClose, onSave }: AddCustomRecipeSheetProps) {
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [isCalculating, setIsCalculating] = useState(false);

  if (!isOpen) return null;

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  // Função para calcular macros usando IA (simulação inteligente)
  const calculateNutrition = (ingredients: string[]): { calories: number; protein: number; fat: number; carbs: number } => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    ingredients.forEach(ingredient => {
      const lower = ingredient.toLowerCase();
      
      // Açúcares e doces
      if (lower.includes("açúcar") || lower.includes("mel")) {
        const amount = extractAmount(lower);
        totalCalories += amount * 20; // ~20 kcal por colher
        totalCarbs += amount * 5; // ~5g carbs por colher
      }
      
      // Leite condensado
      if (lower.includes("leite condensado")) {
        const amount = extractAmount(lower);
        totalCalories += amount * 100; // ~100 kcal por colher
        totalCarbs += amount * 15;
        totalProtein += amount * 2;
        totalFat += amount * 3;
      }
      
      // Chocolate
      if (lower.includes("chocolate") && !lower.includes("pó")) {
        const amount = extractAmount(lower);
        totalCalories += amount * 50;
        totalCarbs += amount * 6;
        totalFat += amount * 3;
        totalProtein += amount * 1;
      }
      
      // Chocolate em pó
      if (lower.includes("chocolate em pó") || lower.includes("cacau")) {
        const amount = extractAmount(lower);
        totalCalories += amount * 15;
        totalCarbs += amount * 3;
        totalProtein += amount * 0.5;
      }
      
      // Leite
      if (lower.includes("leite") && !lower.includes("condensado") && !lower.includes("pó")) {
        totalCalories += 150; // 1 copo
        totalCarbs += 12;
        totalProtein += 8;
        totalFat += 8;
      }
      
      // Creme de leite
      if (lower.includes("creme de leite")) {
        totalCalories += 200;
        totalFat += 20;
        totalCarbs += 3;
        totalProtein += 2;
      }
      
      // Manteiga/óleo
      if (lower.includes("manteiga") || lower.includes("óleo")) {
        const amount = extractAmount(lower);
        totalCalories += amount * 45;
        totalFat += amount * 5;
      }
      
      // Farinha
      if (lower.includes("farinha")) {
        const amount = extractAmount(lower);
        totalCalories += amount * 30;
        totalCarbs += amount * 7;
        totalProtein += amount * 1;
      }
      
      // Ovo
      if (lower.includes("ovo")) {
        const amount = extractEggAmount(lower);
        totalCalories += amount * 70;
        totalProtein += amount * 6;
        totalFat += amount * 5;
      }
      
      // Frutas
      if (lower.includes("banana")) {
        totalCalories += 105;
        totalCarbs += 27;
        totalProtein += 1;
      }
      
      if (lower.includes("morango")) {
        totalCalories += 50;
        totalCarbs += 12;
      }
      
      if (lower.includes("maçã")) {
        totalCalories += 95;
        totalCarbs += 25;
      }
      
      // Iogurte
      if (lower.includes("iogurte")) {
        totalCalories += 120;
        totalProtein += 10;
        totalCarbs += 15;
        totalFat += 3;
      }
      
      // Aveia
      if (lower.includes("aveia")) {
        const amount = extractAmount(lower);
        totalCalories += amount * 35;
        totalCarbs += amount * 6;
        totalProtein += amount * 1.5;
        totalFat += amount * 0.7;
      }
      
      // Biscoito
      if (lower.includes("biscoito")) {
        const amount = extractAmount(lower);
        totalCalories += amount * 30;
        totalCarbs += amount * 5;
        totalFat += amount * 1;
      }
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat),
      carbs: Math.round(totalCarbs)
    };
  };

  // Extrai quantidade de colheres/xícaras
  const extractAmount = (text: string): number => {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  // Extrai quantidade de ovos
  const extractEggAmount = (text: string): number => {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  // Gera dica fitness baseada nos ingredientes
  const generateFitTip = (ingredients: string[]): string => {
    const lower = ingredients.join(" ").toLowerCase();
    
    if (lower.includes("açúcar")) {
      return "Troque o açúcar por adoçante culinário para reduzir calorias sem perder o sabor doce.";
    }
    
    if (lower.includes("leite condensado")) {
      return "Use metade do leite condensado e complete com iogurte grego para reduzir calorias e aumentar proteína.";
    }
    
    if (lower.includes("creme de leite")) {
      return "Use creme de leite light para reduzir gorduras mantendo a cremosidade.";
    }
    
    if (lower.includes("óleo")) {
      return "Substitua o óleo por iogurte natural ou purê de maçã para uma versão mais leve.";
    }
    
    if (lower.includes("chocolate") && !lower.includes("70%")) {
      return "Use chocolate 70% cacau para menos açúcar e mais benefícios do cacau puro.";
    }
    
    if (lower.includes("farinha de trigo")) {
      return "Troque metade da farinha de trigo por farinha de aveia para mais fibras.";
    }
    
    if (lower.includes("leite") && !lower.includes("desnatado")) {
      return "Use leite desnatado para reduzir gorduras mantendo o cálcio e proteína.";
    }
    
    return "Adicione frutas picadas para aumentar fibras e vitaminas sem muitas calorias extras.";
  };

  // Estima tempo de preparo baseado nos passos
  const estimateTime = (steps: string[]): string => {
    const lower = steps.join(" ").toLowerCase();
    
    if (lower.includes("micro-ondas") || lower.includes("microondas")) {
      return "3 min";
    }
    
    if (lower.includes("geladeira") || lower.includes("freezer")) {
      return "5 min";
    }
    
    if (lower.includes("forno")) {
      return "15 min";
    }
    
    if (steps.length <= 3) {
      return "2 min";
    }
    
    if (steps.length <= 5) {
      return "4 min";
    }
    
    return "5 min";
  };

  const handleSave = async () => {
    // Validação
    if (!recipeName.trim()) {
      alert("Por favor, dê um nome à sua receita!");
      return;
    }
    
    const validIngredients = ingredients.filter(i => i.trim() !== "");
    if (validIngredients.length === 0) {
      alert("Adicione pelo menos um ingrediente!");
      return;
    }
    
    const validSteps = steps.filter(s => s.trim() !== "");
    if (validSteps.length === 0) {
      alert("Adicione pelo menos um passo do modo de preparo!");
      return;
    }

    setIsCalculating(true);

    // Simula cálculo (em produção, poderia chamar uma API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calcula nutrição
    const nutrition = calculateNutrition(validIngredients);
    const fitTip = generateFitTip(validIngredients);
    const time = estimateTime(validSteps);

    // Determina categoria baseada nos ingredientes
    const ingredientsText = validIngredients.join(" ").toLowerCase();
    let category = "all";
    let tags: string[] = [];
    
    if (ingredientsText.includes("chocolate") || ingredientsText.includes("cacau")) {
      category = "chocolate";
      tags.push("chocolate");
    }
    
    if (ingredientsText.includes("banana") || ingredientsText.includes("morango") || 
        ingredientsText.includes("maçã") || ingredientsText.includes("fruta")) {
      category = "frutas";
      tags.push("frutas");
    }
    
    if (parseInt(time) <= 3) {
      tags.push("rapido");
    }

    const newRecipe: CustomRecipe = {
      id: Date.now(), // ID único baseado em timestamp
      name: recipeName,
      ingredients: validIngredients,
      steps: validSteps,
      calories: nutrition.calories,
      protein: nutrition.protein,
      fat: nutrition.fat,
      carbs: nutrition.carbs,
      time: time,
      fitTip: fitTip,
      category: category,
      icon: category === "chocolate" ? "Cookie" : category === "frutas" ? "Apple" : "Cake",
      tags: tags,
      isCustom: true
    };

    onSave(newRecipe);
    setIsCalculating(false);
    
    // Reset form
    setRecipeName("");
    setIngredients([""]);
    setSteps([""]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Nova Receita</h2>
              <p className="text-xs text-slate-500">Crie sua receita personalizada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Nome da receita */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nome da receita
            </label>
            <input
              type="text"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="Ex: Brigadeiro da vovó"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
            />
          </div>

          {/* Ingredientes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ingredientes
            </label>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`Ingrediente ${index + 1}`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-sm"
                  />
                  {ingredients.length > 1 && (
                    <button
                      onClick={() => removeIngredient(index)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addIngredient}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-pink-500 hover:text-pink-500 transition-all text-sm font-medium"
              >
                + Adicionar ingrediente
              </button>
            </div>
          </div>

          {/* Modo de preparo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Modo de preparo
            </label>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 text-pink-600 font-semibold flex items-center justify-center text-xs mt-2">
                    {index + 1}
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`Passo ${index + 1}`}
                    rows={2}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-sm resize-none"
                  />
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(index)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors h-fit mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addStep}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-pink-500 hover:text-pink-500 transition-all text-sm font-medium"
              >
                + Adicionar passo
              </button>
            </div>
          </div>

          {/* Info sobre cálculo automático */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-1">
                  Cálculo Automático
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ao salvar, calcularemos automaticamente as calorias, proteínas, gorduras, carboidratos e geraremos uma dica fitness personalizada para sua receita!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com botão salvar */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
          <button
            onClick={handleSave}
            disabled={isCalculating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Calculando nutrição...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Salvar receita
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
