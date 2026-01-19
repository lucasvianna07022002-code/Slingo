"use client";

import { useState, useEffect } from "react";
import { Search, Heart, Clock, Sparkles, ChefHat, Flame, Timer, Coffee, Cookie, IceCream, Apple, Banana, Cherry, Grape, Circle, Milk, Candy, Cake, Croissant, Soup, Droplet, Snowflake, Zap, ArrowLeft, X, Plus } from "lucide-react";
import AddCustomRecipeSheet from "./AddCustomRecipeSheet";
import { addMealToHistory } from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

interface Recipe {
  id: number;
  name: string;
  calories: number;
  time: string;
  category: string;
  icon: string;
  tags: string[];
  ingredients?: string[];
  steps?: string[];
  fitTip?: string;
  protein?: number;
  fat?: number;
  carbs?: number;
  isCustom?: boolean;
}

export default function SOSScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [usedFitTip, setUsedFitTip] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [displayedCalories, setDisplayedCalories] = useState<number | null>(null);
  const [quickFilterActive, setQuickFilterActive] = useState<string | null>(null);
  const [displayedRecipesCount, setDisplayedRecipesCount] = useState(6);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [showAddRecipeSheet, setShowAddRecipeSheet] = useState(false);
  const [showFitTip, setShowFitTip] = useState(true);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Carrega usuário autenticado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Carrega receitas personalizadas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customRecipes");
    if (saved) {
      setCustomRecipes(JSON.parse(saved));
    }
  }, []);

  // Salva receitas personalizadas no localStorage
  const saveCustomRecipe = (recipe: Recipe) => {
    const updated = [...customRecipes, recipe];
    setCustomRecipes(updated);
    localStorage.setItem("customRecipes", JSON.stringify(updated));
  };

  const defaultRecipes: Recipe[] = [
    // 🍫 Bem doce + ⚡ Bem rápido (Chocolate até 3min)
    { 
      id: 1, 
      name: "Brigadeiro de Colher", 
      calories: 180, 
      time: "2 min", 
      category: "chocolate", 
      icon: "Cookie", 
      tags: ["chocolate", "rapido"],
      ingredients: [
        "3 colheres de leite condensado",
        "1 colher de chocolate em pó",
        "1 colher de manteiga"
      ],
      steps: [
        "Coloque todos os ingredientes em uma caneca.",
        "Misture bem até ficar homogêneo.",
        "Leve ao micro-ondas por 1 minuto.",
        "Mexa e leve por mais 30 segundos."
      ],
      fitTip: "Use metade do leite condensado e complete com iogurte grego para reduzir calorias.",
      protein: 3,
      carbs: 30,
      fat: 5
    },
    { 
      id: 2, 
      name: "Mousse de Chocolate Express", 
      calories: 220, 
      time: "3 min", 
      category: "chocolate", 
      icon: "Cake", 
      tags: ["chocolate", "rapido"],
      ingredients: [
        "1 caixinha de creme de leite",
        "3 colheres de chocolate em pó",
        "2 colheres de açúcar"
      ],
      steps: [
        "Bata todos os ingredientes no liquidificador por 2 minutos.",
        "Despeje em um pote.",
        "Leve à geladeira por 1 hora ou sirva imediatamente."
      ],
      fitTip: "Troque o açúcar por adoçante culinário e use creme de leite light.",
      protein: 4,
      carbs: 28,
      fat: 12
    },
    { 
      id: 3, 
      name: "Creme de Chocolate no Pote", 
      calories: 195, 
      time: "2 min", 
      category: "chocolate", 
      icon: "Coffee", 
      tags: ["chocolate", "rapido"],
      ingredients: [
        "2 colheres de achocolatado",
        "1 copo de leite",
        "1 colher de amido de milho"
      ],
      steps: [
        "Misture tudo em uma caneca.",
        "Leve ao micro-ondas por 1 minuto.",
        "Mexa bem e leve por mais 30 segundos.",
        "Deixe esfriar um pouco antes de comer."
      ],
      fitTip: "Use leite desnatado e achocolatado diet para gastar menos calorias.",
      protein: 6,
      carbs: 32,
      fat: 4
    },
    { 
      id: 4, 
      name: "Brigadeiro de Micro-ondas", 
      calories: 170, 
      time: "3 min", 
      category: "chocolate", 
      icon: "Zap", 
      tags: ["chocolate", "rapido"],
      ingredients: [
        "4 colheres de leite condensado",
        "2 colheres de chocolate em pó",
        "1 colher de manteiga"
      ],
      steps: [
        "Misture tudo em uma tigela.",
        "Leve ao micro-ondas por 1 minuto.",
        "Mexa e volte por mais 1 minuto.",
        "Deixe esfriar antes de enrolar."
      ],
      fitTip: "Reduza o leite condensado pela metade e adicione banana amassada.",
      protein: 3,
      carbs: 28,
      fat: 5
    },
    { 
      id: 5, 
      name: "Chocolate Quente Cremoso", 
      calories: 210, 
      time: "3 min", 
      category: "chocolate", 
      icon: "Coffee", 
      tags: ["chocolate", "rapido"],
      ingredients: [
        "1 copo de leite",
        "2 colheres de chocolate em pó",
        "1 colher de açúcar",
        "1 colher de amido de milho"
      ],
      steps: [
        "Misture tudo em uma caneca.",
        "Leve ao micro-ondas por 2 minutos.",
        "Mexa bem e sirva quente."
      ],
      fitTip: "Use leite desnatado e adoçante para reduzir calorias sem perder cremosidade.",
      protein: 7,
      carbs: 35,
      fat: 5
    },
    { 
      id: 6, 
      name: "Trufa Rápida", 
      calories: 160, 
      time: "2 min", 
      category: "chocolate", 
      icon: "Candy", 
      tags: ["chocolate", "rapido"],
      ingredients: [
        "3 colheres de leite condensado",
        "2 colheres de chocolate em pó",
        "1 colher de manteiga",
        "Chocolate granulado para cobrir"
      ],
      steps: [
        "Misture leite condensado, chocolate e manteiga.",
        "Leve ao micro-ondas por 1 minuto.",
        "Deixe esfriar e faça bolinhas.",
        "Passe no granulado."
      ],
      fitTip: "Passe no cacau em pó em vez de granulado para economizar calorias.",
      protein: 3,
      carbs: 26,
      fat: 5
    },
    { 
      id: 7, 
      name: "Creme de Cacau Instantâneo", 
      calories: 185, 
      time: "2 min", 
      category: "chocolate", 
      icon: "Coffee", 
      tags: ["chocolate", "rapido"],
      ingredients: [
        "1 copo de leite",
        "3 colheres de cacau em pó",
        "2 colheres de açúcar",
        "1 colher de amido de milho"
      ],
      steps: [
        "Misture tudo em uma caneca.",
        "Leve ao micro-ondas por 1 minuto e 30 segundos.",
        "Mexa bem e sirva."
      ],
      fitTip: "Troque o açúcar por adoçante e use leite desnatado.",
      protein: 6,
      carbs: 30,
      fat: 4
    },
    { 
      id: 8, 
      name: "Pudim de Chocolate Rápido", 
      calories: 200, 
      time: "3 min", 
      category: "chocolate", 
      icon: "Cake", 
      tags: ["chocolate", "rapido"],
      ingredients: [
        "1 copo de leite",
        "3 colheres de chocolate em pó",
        "2 colheres de açúcar",
        "2 colheres de amido de milho"
      ],
      steps: [
        "Bata tudo no liquidificador.",
        "Despeje em uma forma.",
        "Leve ao micro-ondas por 2 minutos.",
        "Deixe esfriar antes de desenformar."
      ],
      fitTip: "Use leite desnatado e reduza o açúcar pela metade.",
      protein: 6,
      carbs: 32,
      fat: 5
    },
    
    // 🍫 Bem doce (Chocolate 4-5min)
    { 
      id: 9, 
      name: "Bolo de Caneca de Chocolate", 
      calories: 250, 
      time: "4 min", 
      category: "chocolate", 
      icon: "Cake", 
      tags: ["chocolate"],
      ingredients: [
        "4 colheres de farinha de trigo",
        "3 colheres de açúcar",
        "2 colheres de chocolate em pó",
        "1 ovo",
        "3 colheres de leite",
        "2 colheres de óleo"
      ],
      steps: [
        "Misture tudo em uma caneca grande.",
        "Mexa até ficar homogêneo.",
        "Leve ao micro-ondas por 3 minutos.",
        "Deixe esfriar um pouco antes de comer."
      ],
      fitTip: "Troque o óleo por iogurte natural e use farinha integral.",
      protein: 7,
      carbs: 38,
      fat: 8
    },
    { 
      id: 10, 
      name: "Brownie de Caneca", 
      calories: 280, 
      time: "5 min", 
      category: "chocolate", 
      icon: "Cookie", 
      tags: ["chocolate"],
      ingredients: [
        "3 colheres de farinha de trigo",
        "3 colheres de açúcar",
        "2 colheres de chocolate em pó",
        "1 ovo",
        "2 colheres de óleo",
        "1 colher de gotas de chocolate"
      ],
      steps: [
        "Misture farinha, açúcar e chocolate na caneca.",
        "Adicione ovo e óleo, misture bem.",
        "Coloque as gotas de chocolate por cima.",
        "Leve ao micro-ondas por 2 minutos."
      ],
      fitTip: "Use metade do açúcar e adicione banana amassada para adoçar naturalmente.",
      protein: 6,
      carbs: 40,
      fat: 10
    },

    // 🍫 NOVAS 30 RECEITAS BEM DOCE (CHOCOLATE)
    { id: 11, name: "Palha Italiana Express", calories: 240, time: "4 min", category: "chocolate", icon: "Cookie", tags: ["chocolate"], ingredients: ["200g de biscoito maisena", "1 lata de leite condensado", "3 colheres de chocolate em pó", "2 colheres de manteiga"], steps: ["Triture o biscoito no processador.", "Misture leite condensado, chocolate e manteiga.", "Adicione o biscoito triturado.", "Modele em formato de palha."], fitTip: "Use biscoito integral e reduza o leite condensado pela metade.", protein: 5, carbs: 35, fat: 8 },
    { id: 12, name: "Bombom de Morango", calories: 190, time: "5 min", category: "chocolate", icon: "Candy", tags: ["chocolate"], ingredients: ["10 morangos grandes", "200g de chocolate meio amargo", "1 colher de manteiga"], steps: ["Derreta o chocolate com manteiga no micro-ondas.", "Lave e seque bem os morangos.", "Mergulhe cada morango no chocolate.", "Deixe secar em papel manteiga."], fitTip: "Use chocolate 70% cacau para menos açúcar e mais antioxidantes.", protein: 3, carbs: 25, fat: 9 },
    { id: 13, name: "Pavê de Chocolate Rápido", calories: 310, time: "5 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["1 pacote de biscoito champagne", "2 copos de leite", "1 lata de leite condensado", "3 colheres de chocolate em pó"], steps: ["Misture leite condensado com chocolate.", "Molhe os biscoitos no leite.", "Monte camadas alternadas.", "Leve à geladeira por 2 horas."], fitTip: "Use leite desnatado e biscoito integral para versão mais leve.", protein: 8, carbs: 45, fat: 12 },
    { id: 14, name: "Beijinho de Chocolate", calories: 165, time: "4 min", category: "chocolate", icon: "Candy", tags: ["chocolate"], ingredients: ["1 lata de leite condensado", "2 colheres de chocolate em pó", "1 colher de manteiga", "Coco ralado"], steps: ["Misture leite condensado, chocolate e manteiga.", "Leve ao micro-ondas por 2 minutos.", "Deixe esfriar e enrole.", "Passe no coco ralado."], fitTip: "Use coco sem açúcar e reduza o leite condensado.", protein: 3, carbs: 27, fat: 5 },
    { id: 15, name: "Sorvete de Chocolate Caseiro", calories: 220, time: "5 min", category: "chocolate", icon: "IceCream", tags: ["chocolate"], ingredients: ["2 bananas congeladas", "3 colheres de cacau em pó", "2 colheres de mel"], steps: ["Bata as bananas congeladas no processador.", "Adicione cacau e mel.", "Bata até ficar cremoso.", "Sirva imediatamente ou congele."], fitTip: "Pule o mel e use apenas banana para adoçar naturalmente.", protein: 4, carbs: 35, fat: 3 },
    { id: 16, name: "Fondue de Chocolate", calories: 280, time: "4 min", category: "chocolate", icon: "Coffee", tags: ["chocolate"], ingredients: ["200g de chocolate meio amargo", "1/2 caixinha de creme de leite", "Frutas para acompanhar"], steps: ["Derreta o chocolate no micro-ondas.", "Adicione o creme de leite.", "Misture até ficar homogêneo.", "Sirva com frutas picadas."], fitTip: "Use chocolate 70% cacau e creme de leite light.", protein: 5, carbs: 30, fat: 15 },
    { id: 17, name: "Rocambole de Chocolate", calories: 260, time: "5 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["4 ovos", "4 colheres de açúcar", "3 colheres de chocolate em pó", "3 colheres de farinha", "Doce de leite para rechear"], steps: ["Bata ovos com açúcar até dobrar de volume.", "Adicione chocolate e farinha.", "Asse em forma retangular por 10 minutos.", "Recheie com doce de leite e enrole."], fitTip: "Recheie com geleia de frutas sem açúcar em vez de doce de leite.", protein: 8, carbs: 35, fat: 9 },
    { id: 18, name: "Trufas de Oreo", calories: 230, time: "4 min", category: "chocolate", icon: "Cookie", tags: ["chocolate"], ingredients: ["1 pacote de biscoito Oreo", "200g de cream cheese", "200g de chocolate para cobertura"], steps: ["Triture os biscoitos Oreo.", "Misture com cream cheese.", "Faça bolinhas e leve à geladeira.", "Cubra com chocolate derretido."], fitTip: "Use cream cheese light e chocolate 70% cacau.", protein: 4, carbs: 32, fat: 11 },
    { id: 19, name: "Pudim de Chocolate com Calda", calories: 290, time: "5 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["1 lata de leite condensado", "2 copos de leite", "3 ovos", "3 colheres de chocolate em pó", "1 xícara de açúcar para calda"], steps: ["Bata todos os ingredientes no liquidificador.", "Faça a calda caramelizando o açúcar.", "Despeje a mistura sobre a calda.", "Leve ao micro-ondas por 8 minutos."], fitTip: "Pule a calda de açúcar e use apenas o pudim.", protein: 10, carbs: 42, fat: 8 },
    { id: 20, name: "Brigadeiro Gourmet", calories: 195, time: "4 min", category: "chocolate", icon: "Candy", tags: ["chocolate"], ingredients: ["1 lata de leite condensado", "3 colheres de chocolate em pó 50%", "1 colher de manteiga", "Chocolate granulado belga"], steps: ["Misture leite condensado, chocolate e manteiga.", "Leve ao micro-ondas por 2 minutos.", "Deixe esfriar completamente.", "Enrole e passe no granulado belga."], fitTip: "Use chocolate 70% cacau e granulado de cacau puro.", protein: 3, carbs: 30, fat: 6 },
    { id: 21, name: "Mousse de Chocolate Branco", calories: 250, time: "4 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["200g de chocolate branco", "1 caixinha de creme de leite", "3 claras em neve"], steps: ["Derreta o chocolate branco.", "Misture com creme de leite.", "Adicione as claras em neve delicadamente.", "Leve à geladeira por 2 horas."], fitTip: "Use chocolate branco diet e creme de leite light.", protein: 5, carbs: 32, fat: 13 },
    { id: 22, name: "Bolo de Chocolate Molhadinho", calories: 320, time: "5 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["2 xícaras de farinha", "2 xícaras de açúcar", "3/4 xícara de cacau", "2 ovos", "1 xícara de leite", "1/2 xícara de óleo"], steps: ["Misture todos os ingredientes secos.", "Adicione ovos, leite e óleo.", "Bata bem até ficar homogêneo.", "Leve ao micro-ondas por 8 minutos."], fitTip: "Use farinha integral e reduza o açúcar pela metade.", protein: 8, carbs: 50, fat: 12 },
    { id: 23, name: "Casadinho de Chocolate", calories: 175, time: "4 min", category: "chocolate", icon: "Cookie", tags: ["chocolate"], ingredients: ["1/2 lata de leite condensado", "1 colher de chocolate em pó", "1/2 lata de leite condensado", "1 colher de coco ralado"], steps: ["Faça brigadeiro com metade dos ingredientes.", "Faça beijinho com a outra metade.", "Una as duas metades.", "Passe no granulado misto."], fitTip: "Reduza o leite condensado e use cacau puro.", protein: 3, carbs: 28, fat: 5 },
    { id: 24, name: "Petit Gateau Express", calories: 340, time: "5 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["100g de chocolate meio amargo", "2 colheres de manteiga", "1 ovo", "2 colheres de açúcar", "2 colheres de farinha"], steps: ["Derreta chocolate com manteiga.", "Misture ovo e açúcar.", "Adicione farinha e chocolate derretido.", "Leve ao micro-ondas por 1 minuto."], fitTip: "Use chocolate 70% cacau e reduza o açúcar.", protein: 6, carbs: 38, fat: 18 },
    { id: 25, name: "Brigadeiro de Colher Gourmet", calories: 210, time: "4 min", category: "chocolate", icon: "Coffee", tags: ["chocolate"], ingredients: ["1 lata de leite condensado", "3 colheres de chocolate em pó 50%", "2 colheres de manteiga", "1 colher de creme de leite"], steps: ["Misture todos os ingredientes.", "Leve ao micro-ondas por 2 minutos.", "Mexa e volte por mais 1 minuto.", "Sirva em potinhos com granulado."], fitTip: "Use leite condensado light e chocolate 70% cacau.", protein: 4, carbs: 32, fat: 7 },
    { id: 26, name: "Cookies de Chocolate", calories: 180, time: "5 min", category: "chocolate", icon: "Cookie", tags: ["chocolate"], ingredients: ["1 xícara de farinha", "1/2 xícara de açúcar", "1/4 xícara de cacau", "1 ovo", "1/4 xícara de óleo", "Gotas de chocolate"], steps: ["Misture todos os ingredientes.", "Faça bolinhas e achate.", "Coloque gotas de chocolate por cima.", "Leve ao micro-ondas por 2 minutos."], fitTip: "Use farinha integral e reduza o açúcar pela metade.", protein: 4, carbs: 28, fat: 7 },
    { id: 27, name: "Torta de Chocolate Rápida", calories: 300, time: "5 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["1 pacote de biscoito maisena triturado", "100g de manteiga derretida", "1 lata de leite condensado", "3 colheres de chocolate em pó"], steps: ["Misture biscoito com manteiga.", "Forre uma forma com a mistura.", "Prepare creme com leite condensado e chocolate.", "Despeje sobre a base e leve à geladeira."], fitTip: "Use biscoito integral e leite condensado light.", protein: 6, carbs: 42, fat: 13 },
    { id: 28, name: "Brigadeiro de Nutella", calories: 220, time: "4 min", category: "chocolate", icon: "Candy", tags: ["chocolate"], ingredients: ["1 lata de leite condensado", "3 colheres de Nutella", "1 colher de manteiga"], steps: ["Misture todos os ingredientes.", "Leve ao micro-ondas por 2 minutos.", "Mexa bem e deixe esfriar.", "Enrole e passe no granulado."], fitTip: "Substitua Nutella por pasta de amendoim com cacau.", protein: 4, carbs: 33, fat: 8 },
    { id: 29, name: "Mousse de Chocolate Amargo", calories: 200, time: "4 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["200g de chocolate 70% cacau", "3 ovos", "2 colheres de açúcar"], steps: ["Derreta o chocolate.", "Separe gemas e claras.", "Misture gemas com chocolate.", "Bata claras em neve com açúcar e misture delicadamente."], fitTip: "Use chocolate 85% cacau e pule o açúcar.", protein: 7, carbs: 22, fat: 12 },
    { id: 30, name: "Bolo de Chocolate com Cobertura", calories: 330, time: "5 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["1 xícara de farinha", "1 xícara de açúcar", "1/2 xícara de cacau", "1 ovo", "1/2 xícara de leite", "200g de chocolate para cobertura"], steps: ["Misture ingredientes secos.", "Adicione ovo e leite.", "Leve ao micro-ondas por 4 minutos.", "Cubra com chocolate derretido."], fitTip: "Use farinha integral e chocolate 70% cacau.", protein: 7, carbs: 48, fat: 14 },
    { id: 31, name: "Trufa de Chocolate Branco", calories: 185, time: "4 min", category: "chocolate", icon: "Candy", tags: ["chocolate"], ingredients: ["200g de chocolate branco", "1/2 caixinha de creme de leite", "Coco ralado para cobrir"], steps: ["Derreta chocolate branco.", "Misture com creme de leite.", "Deixe esfriar e faça bolinhas.", "Passe no coco ralado."], fitTip: "Use chocolate branco diet e coco sem açúcar.", protein: 3, carbs: 26, fat: 9 },
    { id: 32, name: "Brigadeiro de Paçoca", calories: 205, time: "4 min", category: "chocolate", icon: "Cookie", tags: ["chocolate"], ingredients: ["1 lata de leite condensado", "2 colheres de chocolate em pó", "1 colher de manteiga", "Paçoca triturada"], steps: ["Faça brigadeiro tradicional.", "Deixe esfriar e enrole.", "Passe na paçoca triturada.", "Sirva em forminhas."], fitTip: "Use pasta de amendoim em vez de paçoca.", protein: 4, carbs: 31, fat: 7 },
    { id: 33, name: "Bolo de Chocolate Fit", calories: 180, time: "4 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["3 colheres de aveia", "2 colheres de cacau", "1 ovo", "1 banana amassada", "1 colher de mel"], steps: ["Misture todos os ingredientes.", "Despeje em uma caneca.", "Leve ao micro-ondas por 3 minutos.", "Deixe esfriar antes de comer."], fitTip: "Pule o mel e use apenas banana para adoçar.", protein: 7, carbs: 28, fat: 4 },
    { id: 34, name: "Mousse de Chocolate com Abacate", calories: 190, time: "4 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["1 abacate maduro", "3 colheres de cacau em pó", "3 colheres de mel", "1 colher de essência de baunilha"], steps: ["Bata todos os ingredientes no liquidificador.", "Bata até ficar cremoso.", "Despeje em potinhos.", "Leve à geladeira por 1 hora."], fitTip: "Reduza o mel pela metade para menos calorias.", protein: 3, carbs: 25, fat: 10 },
    { id: 35, name: "Brigadeiro de Café", calories: 195, time: "4 min", category: "chocolate", icon: "Coffee", tags: ["chocolate"], ingredients: ["1 lata de leite condensado", "2 colheres de chocolate em pó", "1 colher de café solúvel", "1 colher de manteiga"], steps: ["Misture todos os ingredientes.", "Leve ao micro-ondas por 2 minutos.", "Deixe esfriar e enrole.", "Passe no chocolate granulado."], fitTip: "Use leite condensado light e cacau puro.", protein: 3, carbs: 30, fat: 6 },
    { id: 36, name: "Bolo de Chocolate com Banana", calories: 240, time: "5 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["2 bananas maduras", "2 ovos", "3 colheres de cacau", "4 colheres de farinha", "1 colher de fermento"], steps: ["Amasse as bananas.", "Misture com ovos e cacau.", "Adicione farinha e fermento.", "Leve ao micro-ondas por 4 minutos."], fitTip: "Use farinha integral e pule o açúcar.", protein: 7, carbs: 36, fat: 6 },
    { id: 37, name: "Palha Italiana de Chocolate Branco", calories: 250, time: "4 min", category: "chocolate", icon: "Cookie", tags: ["chocolate"], ingredients: ["200g de biscoito maisena", "1 lata de leite condensado", "200g de chocolate branco", "2 colheres de manteiga"], steps: ["Triture o biscoito.", "Derreta chocolate branco com leite condensado.", "Misture com biscoito.", "Modele em formato de palha."], fitTip: "Use biscoito integral e chocolate branco diet.", protein: 5, carbs: 36, fat: 9 },
    { id: 38, name: "Brigadeiro de Pistache", calories: 210, time: "4 min", category: "chocolate", icon: "Candy", tags: ["chocolate"], ingredients: ["1 lata de leite condensado", "2 colheres de chocolate branco em pó", "1 colher de manteiga", "Pistache triturado"], steps: ["Misture leite condensado, chocolate e manteiga.", "Leve ao micro-ondas por 2 minutos.", "Deixe esfriar e enrole.", "Passe no pistache triturado."], fitTip: "Use leite condensado light e pistache sem sal.", protein: 4, carbs: 32, fat: 8 },
    { id: 39, name: "Torta Holandesa Express", calories: 310, time: "5 min", category: "chocolate", icon: "Cake", tags: ["chocolate"], ingredients: ["1 pacote de biscoito maisena", "100g de manteiga", "1 lata de leite condensado", "200g de chocolate meio amargo"], steps: ["Triture biscoito e misture com manteiga.", "Forre forma com a mistura.", "Derreta chocolate com leite condensado.", "Despeje sobre a base e leve à geladeira."], fitTip: "Use biscoito integral e chocolate 70% cacau.", protein: 6, carbs: 44, fat: 14 },
    { id: 40, name: "Brigadeiro de Doce de Leite", calories: 200, time: "4 min", category: "chocolate", icon: "Candy", tags: ["chocolate"], ingredients: ["1 lata de leite condensado", "3 colheres de doce de leite", "1 colher de manteiga", "Chocolate granulado"], steps: ["Misture leite condensado, doce de leite e manteiga.", "Leve ao micro-ondas por 2 minutos.", "Deixe esfriar e enrole.", "Passe no granulado."], fitTip: "Use doce de leite light e reduza a quantidade.", protein: 3, carbs: 31, fat: 6 },
    
    // ⚡ NOVAS 33 RECEITAS BEM RÁPIDO (2 MINUTOS)
    { id: 41, name: "Iogurte com Granola", calories: 150, time: "2 min", category: "rapido", icon: "Coffee", tags: ["rapido"], ingredients: ["1 pote de iogurte natural", "3 colheres de granola", "1 colher de mel"], steps: ["Coloque o iogurte em uma tigela.", "Adicione a granola por cima.", "Regue com mel.", "Sirva imediatamente."], fitTip: "Use iogurte grego desnatado e granola sem açúcar.", protein: 8, carbs: 22, fat: 3 },
    { id: 42, name: "Vitamina de Banana", calories: 180, time: "2 min", category: "rapido", icon: "Coffee", tags: ["rapido", "frutas"], ingredients: ["1 banana", "1 copo de leite", "1 colher de aveia", "Gelo"], steps: ["Bata todos os ingredientes no liquidificador.", "Bata por 1 minuto.", "Sirva gelado.", "Adicione canela se desejar."], fitTip: "Use leite desnatado e pule o açúcar.", protein: 8, carbs: 30, fat: 3 },
    { id: 43, name: "Tapioca Simples", calories: 120, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["3 colheres de goma de tapioca", "Queijo ralado a gosto"], steps: ["Aqueça uma frigideira antiaderente.", "Espalhe a tapioca.", "Adicione queijo por cima.", "Dobre ao meio e sirva."], fitTip: "Use queijo branco light em vez de queijo amarelo.", protein: 6, carbs: 20, fat: 3 },
    { id: 44, name: "Ovo Mexido Express", calories: 140, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["2 ovos", "Sal a gosto", "1 colher de manteiga"], steps: ["Quebre os ovos em uma tigela.", "Tempere com sal.", "Leve ao micro-ondas por 1 minuto.", "Mexa e volte por mais 30 segundos."], fitTip: "Use apenas claras para reduzir gordura.", protein: 12, carbs: 1, fat: 10 },
    { id: 45, name: "Smoothie de Morango", calories: 130, time: "2 min", category: "rapido", icon: "Cherry", tags: ["rapido", "frutas"], ingredients: ["1 xícara de morangos", "1/2 copo de leite", "1 colher de mel", "Gelo"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Sirva gelado.", "Decore com morango."], fitTip: "Use leite de amêndoas e pule o mel.", protein: 4, carbs: 24, fat: 2 },
    { id: 46, name: "Crepioca Rápida", calories: 160, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["1 ovo", "2 colheres de tapioca", "Sal a gosto", "Recheio a gosto"], steps: ["Misture ovo com tapioca.", "Despeje em frigideira quente.", "Adicione recheio.", "Dobre e sirva."], fitTip: "Recheie com vegetais em vez de queijo.", protein: 8, carbs: 18, fat: 6 },
    { id: 47, name: "Café com Leite Cremoso", calories: 110, time: "2 min", category: "rapido", icon: "Coffee", tags: ["rapido"], ingredients: ["1 xícara de café", "1/2 xícara de leite", "1 colher de açúcar"], steps: ["Prepare o café.", "Aqueça o leite no micro-ondas.", "Misture café com leite.", "Adoce a gosto."], fitTip: "Use leite desnatado e adoçante.", protein: 4, carbs: 15, fat: 2 },
    { id: 48, name: "Torrada com Abacate", calories: 170, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["2 fatias de pão integral", "1/2 abacate", "Sal e pimenta"], steps: ["Toste o pão.", "Amasse o abacate.", "Espalhe sobre o pão.", "Tempere com sal e pimenta."], fitTip: "Use pão integral e adicione tomate para mais nutrientes.", protein: 5, carbs: 22, fat: 8 },
    { id: 49, name: "Mingau de Aveia", calories: 140, time: "2 min", category: "rapido", icon: "Coffee", tags: ["rapido"], ingredients: ["3 colheres de aveia", "1 copo de leite", "1 colher de mel", "Canela"], steps: ["Misture aveia com leite.", "Leve ao micro-ondas por 1 minuto e 30 segundos.", "Mexa e adicione mel.", "Polvilhe canela."], fitTip: "Use leite desnatado e pule o mel.", protein: 8, carbs: 24, fat: 3 },
    { id: 50, name: "Salada de Frutas Express", calories: 100, time: "2 min", category: "rapido", icon: "Apple", tags: ["rapido", "frutas"], ingredients: ["1 maçã picada", "1 banana picada", "1/2 xícara de uvas", "Suco de 1 laranja"], steps: ["Pique todas as frutas.", "Misture em uma tigela.", "Regue com suco de laranja.", "Sirva imediatamente."], fitTip: "Adicione chia para mais fibras.", protein: 2, carbs: 25, fat: 0 },
    { id: 51, name: "Wrap de Queijo", calories: 180, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["1 tortilha", "2 fatias de queijo", "2 fatias de presunto"], steps: ["Coloque queijo e presunto na tortilha.", "Enrole bem apertado.", "Leve ao micro-ondas por 30 segundos.", "Corte ao meio e sirva."], fitTip: "Use queijo branco e peito de peru.", protein: 12, carbs: 20, fat: 6 },
    { id: 52, name: "Suco Verde Rápido", calories: 80, time: "2 min", category: "rapido", icon: "Apple", tags: ["rapido", "frutas"], ingredients: ["1 folha de couve", "1 maçã", "Suco de 1 limão", "1 copo de água"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Coe se preferir.", "Sirva gelado."], fitTip: "Adicione gengibre para acelerar metabolismo.", protein: 2, carbs: 18, fat: 0 },
    { id: 53, name: "Panqueca de Banana", calories: 160, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido", "frutas"], ingredients: ["1 banana", "1 ovo", "1 colher de aveia"], steps: ["Amasse a banana.", "Misture com ovo e aveia.", "Despeje em frigideira quente.", "Vire após 1 minuto."], fitTip: "Adicione canela para mais sabor sem calorias.", protein: 7, carbs: 24, fat: 5 },
    { id: 54, name: "Queijo Quente no Micro-ondas", calories: 200, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["2 fatias de pão", "2 fatias de queijo", "1 colher de manteiga"], steps: ["Passe manteiga no pão.", "Coloque queijo entre as fatias.", "Leve ao micro-ondas por 1 minuto.", "Sirva quente."], fitTip: "Use pão integral e queijo branco.", protein: 10, carbs: 24, fat: 8 },
    { id: 55, name: "Açaí na Tigela Express", calories: 190, time: "2 min", category: "rapido", icon: "Grape", tags: ["rapido", "frutas"], ingredients: ["1 pacote de polpa de açaí", "1 banana", "Granola"], steps: ["Bata açaí com banana no liquidificador.", "Despeje em uma tigela.", "Cubra com granola.", "Sirva imediatamente."], fitTip: "Use granola sem açúcar e adicione frutas frescas.", protein: 4, carbs: 32, fat: 5 },
    { id: 56, name: "Pipoca Doce", calories: 120, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["1/2 xícara de milho de pipoca", "2 colheres de açúcar", "1 colher de óleo"], steps: ["Coloque tudo em um saco de papel.", "Feche bem o saco.", "Leve ao micro-ondas por 2 minutos.", "Mexa e sirva."], fitTip: "Use adoçante em vez de açúcar.", protein: 2, carbs: 22, fat: 3 },
    { id: 57, name: "Vitamina de Abacate", calories: 200, time: "2 min", category: "rapido", icon: "Apple", tags: ["rapido", "frutas"], ingredients: ["1/2 abacate", "1 copo de leite", "1 colher de mel", "Gelo"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Sirva gelado.", "Adicione limão se desejar."], fitTip: "Use leite de coco e reduza o mel.", protein: 5, carbs: 26, fat: 10 },
    { id: 58, name: "Torrada com Pasta de Amendoim", calories: 180, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["2 fatias de pão integral", "2 colheres de pasta de amendoim", "1 banana fatiada"], steps: ["Toste o pão.", "Espalhe pasta de amendoim.", "Coloque fatias de banana.", "Sirva imediatamente."], fitTip: "Use pasta de amendoim natural sem açúcar.", protein: 8, carbs: 26, fat: 8 },
    { id: 59, name: "Chá Gelado de Frutas", calories: 60, time: "2 min", category: "rapido", icon: "Coffee", tags: ["rapido", "frutas"], ingredients: ["1 saquinho de chá de frutas", "1 copo de água quente", "Gelo", "Limão"], steps: ["Prepare o chá.", "Deixe esfriar rapidamente com gelo.", "Adicione rodelas de limão.", "Sirva gelado."], fitTip: "Pule o açúcar e use apenas frutas para sabor.", protein: 0, carbs: 15, fat: 0 },
    { id: 60, name: "Omelete de Micro-ondas", calories: 150, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["2 ovos", "2 colheres de leite", "Queijo ralado", "Sal"], steps: ["Bata ovos com leite.", "Adicione queijo e sal.", "Leve ao micro-ondas por 1 minuto e 30 segundos.", "Sirva quente."], fitTip: "Use apenas claras e vegetais.", protein: 14, carbs: 2, fat: 10 },
    { id: 61, name: "Smoothie de Manga", calories: 140, time: "2 min", category: "rapido", icon: "Apple", tags: ["rapido", "frutas"], ingredients: ["1 manga picada", "1/2 copo de iogurte", "1 colher de mel", "Gelo"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Sirva gelado.", "Decore com hortelã."], fitTip: "Use iogurte grego desnatado.", protein: 5, carbs: 28, fat: 2 },
    { id: 62, name: "Pão com Queijo Cottage", calories: 130, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["2 fatias de pão integral", "3 colheres de queijo cottage", "Tomate cereja"], steps: ["Toste o pão.", "Espalhe queijo cottage.", "Adicione tomates cortados.", "Tempere com ervas."], fitTip: "Adicione rúcula para mais nutrientes.", protein: 10, carbs: 18, fat: 3 },
    { id: 63, name: "Vitamina de Mamão", calories: 120, time: "2 min", category: "rapido", icon: "Apple", tags: ["rapido", "frutas"], ingredients: ["1 fatia de mamão", "1 copo de leite", "1 colher de aveia", "Gelo"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Sirva gelado.", "Adicione linhaça se desejar."], fitTip: "Use leite desnatado e pule o açúcar.", protein: 6, carbs: 22, fat: 2 },
    { id: 64, name: "Tapioca com Coco", calories: 140, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["3 colheres de tapioca", "2 colheres de coco ralado", "1 colher de mel"], steps: ["Aqueça frigideira.", "Espalhe tapioca.", "Adicione coco e mel.", "Dobre e sirva."], fitTip: "Use coco sem açúcar e pule o mel.", protein: 2, carbs: 26, fat: 4 },
    { id: 65, name: "Café Proteico", calories: 160, time: "2 min", category: "rapido", icon: "Coffee", tags: ["rapido"], ingredients: ["1 xícara de café", "1 scoop de whey protein", "1/2 copo de leite"], steps: ["Prepare o café.", "Bata com whey e leite.", "Sirva quente ou gelado.", "Adicione canela."], fitTip: "Use whey sem sabor e leite desnatado.", protein: 20, carbs: 8, fat: 3 },
    { id: 66, name: "Torrada com Ricota", calories: 120, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["2 fatias de pão integral", "3 colheres de ricota", "Mel", "Nozes"], steps: ["Toste o pão.", "Espalhe ricota.", "Regue com mel.", "Adicione nozes picadas."], fitTip: "Pule o mel e use apenas nozes.", protein: 8, carbs: 18, fat: 4 },
    { id: 67, name: "Suco de Laranja Natural", calories: 90, time: "2 min", category: "rapido", icon: "Apple", tags: ["rapido", "frutas"], ingredients: ["3 laranjas", "Água gelada", "Gelo"], steps: ["Esprema as laranjas.", "Adicione água se desejar.", "Coloque gelo.", "Sirva imediatamente."], fitTip: "Não coe para manter as fibras.", protein: 2, carbs: 20, fat: 0 },
    { id: 68, name: "Iogurte com Frutas", calories: 130, time: "2 min", category: "rapido", icon: "Cherry", tags: ["rapido", "frutas"], ingredients: ["1 pote de iogurte", "1/2 xícara de frutas picadas", "1 colher de mel"], steps: ["Coloque iogurte em tigela.", "Adicione frutas por cima.", "Regue com mel.", "Misture e sirva."], fitTip: "Use iogurte grego e pule o mel.", protein: 8, carbs: 22, fat: 3 },
    { id: 69, name: "Wrap de Atum", calories: 170, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["1 tortilha", "1 lata de atum", "Alface", "Tomate"], steps: ["Escorra o atum.", "Coloque sobre a tortilha.", "Adicione alface e tomate.", "Enrole e sirva."], fitTip: "Use atum em água em vez de óleo.", protein: 18, carbs: 20, fat: 3 },
    { id: 70, name: "Smoothie de Frutas Vermelhas", calories: 110, time: "2 min", category: "rapido", icon: "Cherry", tags: ["rapido", "frutas"], ingredients: ["1 xícara de frutas vermelhas", "1/2 copo de iogurte", "1 colher de mel", "Gelo"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Sirva gelado.", "Decore com frutas."], fitTip: "Use iogurte desnatado e pule o mel.", protein: 5, carbs: 20, fat: 2 },
    { id: 71, name: "Pão com Geleia", calories: 140, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["2 fatias de pão integral", "2 colheres de geleia", "1 colher de manteiga"], steps: ["Toste o pão.", "Passe manteiga.", "Espalhe geleia.", "Sirva imediatamente."], fitTip: "Use geleia sem açúcar e pule a manteiga.", protein: 4, carbs: 26, fat: 4 },
    { id: 72, name: "Vitamina de Melancia", calories: 80, time: "2 min", category: "rapido", icon: "Apple", tags: ["rapido", "frutas"], ingredients: ["2 fatias de melancia", "Suco de 1 limão", "Hortelã", "Gelo"], steps: ["Bata melancia no liquidificador.", "Adicione limão e hortelã.", "Bata por 1 minuto.", "Sirva gelado."], fitTip: "Adicione gengibre para acelerar metabolismo.", protein: 1, carbs: 18, fat: 0 },
    { id: 73, name: "Crepioca de Queijo", calories: 170, time: "2 min", category: "rapido", icon: "Circle", tags: ["rapido"], ingredients: ["1 ovo", "2 colheres de tapioca", "Queijo ralado", "Orégano"], steps: ["Misture ovo com tapioca.", "Despeje em frigideira.", "Adicione queijo e orégano.", "Dobre e sirva."], fitTip: "Use queijo branco light.", protein: 10, carbs: 18, fat: 7 },
    
    // 🥣 NOVAS 37 RECEITAS MAIS LEVE (FRUTAS)
    { id: 74, name: "Salada de Frutas Tropicais", calories: 110, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["1 manga picada", "1 kiwi picado", "1/2 abacaxi picado", "Suco de 1 limão", "Hortelã"], steps: ["Pique todas as frutas.", "Misture em uma tigela.", "Regue com suco de limão.", "Decore com hortelã."], fitTip: "Adicione chia para mais fibras e ômega-3.", protein: 2, carbs: 26, fat: 0 },
    { id: 75, name: "Espetinho de Frutas", calories: 90, time: "3 min", category: "frutas", icon: "Cherry", tags: ["frutas"], ingredients: ["Morangos", "Uvas", "Melão", "Abacaxi", "Palitos"], steps: ["Lave todas as frutas.", "Corte em pedaços uniformes.", "Monte nos palitos alternando cores.", "Sirva gelado."], fitTip: "Perfeito como está - puro e natural.", protein: 1, carbs: 22, fat: 0 },
    { id: 76, name: "Smoothie Bowl de Açaí", calories: 180, time: "4 min", category: "frutas", icon: "Grape", tags: ["frutas"], ingredients: ["1 pacote de açaí", "1 banana", "Granola", "Frutas frescas", "Mel"], steps: ["Bata açaí com banana.", "Despeje em tigela.", "Decore com granola e frutas.", "Regue com mel."], fitTip: "Use granola sem açúcar e pule o mel.", protein: 4, carbs: 32, fat: 5 },
    { id: 77, name: "Gelatina de Frutas", calories: 70, time: "5 min", category: "frutas", icon: "Cherry", tags: ["frutas"], ingredients: ["1 pacote de gelatina diet", "1 xícara de frutas picadas", "Água quente"], steps: ["Prepare a gelatina conforme embalagem.", "Adicione frutas picadas.", "Leve à geladeira por 2 horas.", "Sirva gelado."], fitTip: "Use gelatina sem açúcar e frutas variadas.", protein: 2, carbs: 16, fat: 0 },
    { id: 78, name: "Picolé de Frutas Natural", calories: 60, time: "5 min", category: "frutas", icon: "IceCream", tags: ["frutas"], ingredients: ["1 xícara de frutas", "1/2 copo de água", "1 colher de mel"], steps: ["Bata frutas com água e mel.", "Despeje em forminhas de picolé.", "Leve ao freezer por 4 horas.", "Desenforme e sirva."], fitTip: "Pule o mel e use apenas frutas maduras.", protein: 1, carbs: 14, fat: 0 },
    { id: 79, name: "Parfait de Iogurte com Frutas", calories: 150, time: "3 min", category: "frutas", icon: "Coffee", tags: ["frutas"], ingredients: ["1 pote de iogurte grego", "1/2 xícara de frutas vermelhas", "2 colheres de granola", "Mel"], steps: ["Coloque camada de iogurte no copo.", "Adicione camada de frutas.", "Repita as camadas.", "Finalize com granola."], fitTip: "Use iogurte desnatado e granola sem açúcar.", protein: 10, carbs: 22, fat: 3 },
    { id: 80, name: "Chips de Maçã", calories: 80, time: "5 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["2 maçãs", "Canela em pó"], steps: ["Corte maçãs em fatias finas.", "Disponha em prato.", "Polvilhe canela.", "Leve ao micro-ondas por 3 minutos."], fitTip: "Perfeito como está - sem açúcar.", protein: 0, carbs: 20, fat: 0 },
    { id: 81, name: "Mousse de Manga", calories: 130, time: "4 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["1 manga madura", "1 caixinha de creme de leite light", "2 colheres de açúcar"], steps: ["Bata manga no liquidificador.", "Adicione creme de leite e açúcar.", "Bata até ficar cremoso.", "Leve à geladeira por 1 hora."], fitTip: "Use adoçante em vez de açúcar.", protein: 2, carbs: 24, fat: 5 },
    { id: 82, name: "Salada de Melancia com Queijo", calories: 120, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["2 fatias de melancia", "100g de queijo branco", "Hortelã", "Azeite"], steps: ["Corte melancia em cubos.", "Corte queijo em cubos.", "Misture com hortelã.", "Regue com azeite."], fitTip: "Use queijo cottage para menos gordura.", protein: 8, carbs: 16, fat: 4 },
    { id: 83, name: "Suco Detox de Abacaxi", calories: 90, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas", "rapido"], ingredients: ["2 rodelas de abacaxi", "1 folha de couve", "Suco de 1 limão", "Água de coco"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Coe se preferir.", "Sirva gelado."], fitTip: "Adicione gengibre para acelerar metabolismo.", protein: 2, carbs: 20, fat: 0 },
    { id: 84, name: "Banana Assada com Canela", calories: 100, time: "4 min", category: "frutas", icon: "Banana", tags: ["frutas"], ingredients: ["2 bananas", "Canela em pó", "1 colher de mel"], steps: ["Corte bananas ao meio.", "Polvilhe canela.", "Regue com mel.", "Leve ao micro-ondas por 2 minutos."], fitTip: "Pule o mel e use apenas canela.", protein: 2, carbs: 24, fat: 0 },
    { id: 85, name: "Smoothie de Kiwi", calories: 110, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas", "rapido"], ingredients: ["2 kiwis", "1/2 copo de iogurte", "1 colher de mel", "Gelo"], steps: ["Descasque os kiwis.", "Bata com iogurte e mel.", "Adicione gelo.", "Sirva imediatamente."], fitTip: "Use iogurte desnatado e pule o mel.", protein: 4, carbs: 22, fat: 2 },
    { id: 86, name: "Salada de Frutas Cítricas", calories: 85, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["1 laranja", "1 tangerina", "1/2 toranja", "Hortelã"], steps: ["Descasque e corte as frutas.", "Misture em uma tigela.", "Adicione hortelã picada.", "Sirva gelado."], fitTip: "Perfeito como está - rico em vitamina C.", protein: 2, carbs: 20, fat: 0 },
    { id: 87, name: "Iogurte com Frutas Vermelhas", calories: 140, time: "2 min", category: "frutas", icon: "Cherry", tags: ["frutas", "rapido"], ingredients: ["1 pote de iogurte", "1/2 xícara de frutas vermelhas", "1 colher de mel"], steps: ["Coloque iogurte em tigela.", "Adicione frutas por cima.", "Regue com mel.", "Misture e sirva."], fitTip: "Use iogurte grego desnatado.", protein: 8, carbs: 22, fat: 3 },
    { id: 88, name: "Compota de Maçã", calories: 95, time: "5 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["2 maçãs", "1 colher de açúcar", "Canela", "Água"], steps: ["Descasque e pique as maçãs.", "Cozinhe com água e açúcar.", "Adicione canela.", "Cozinhe até amolecer."], fitTip: "Use adoçante em vez de açúcar.", protein: 0, carbs: 22, fat: 0 },
    { id: 89, name: "Vitamina de Frutas Mistas", calories: 130, time: "2 min", category: "frutas", icon: "Apple", tags: ["frutas", "rapido"], ingredients: ["1 banana", "5 morangos", "1/2 manga", "1 copo de leite"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Sirva gelado.", "Adicione gelo se desejar."], fitTip: "Use leite de amêndoas.", protein: 5, carbs: 28, fat: 2 },
    { id: 90, name: "Salada de Frutas com Iogurte", calories: 120, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["1 maçã", "1 banana", "5 morangos", "3 colheres de iogurte"], steps: ["Pique todas as frutas.", "Misture em uma tigela.", "Adicione iogurte por cima.", "Misture delicadamente."], fitTip: "Use iogurte grego natural.", protein: 5, carbs: 24, fat: 2 },
    { id: 91, name: "Suco de Melancia Natural", calories: 70, time: "2 min", category: "frutas", icon: "Apple", tags: ["frutas", "rapido"], ingredients: ["3 fatias de melancia", "Suco de 1 limão", "Hortelã"], steps: ["Bata melancia no liquidificador.", "Adicione limão.", "Coe se preferir.", "Sirva com hortelã."], fitTip: "Perfeito como está - hidratante natural.", protein: 1, carbs: 16, fat: 0 },
    { id: 92, name: "Mousse de Morango Light", calories: 100, time: "4 min", category: "frutas", icon: "Cherry", tags: ["frutas"], ingredients: ["1 xícara de morangos", "1 caixinha de creme de leite light", "2 colheres de açúcar"], steps: ["Bata morangos no liquidificador.", "Adicione creme de leite e açúcar.", "Bata até ficar cremoso.", "Leve à geladeira."], fitTip: "Use adoçante em vez de açúcar.", protein: 2, carbs: 18, fat: 4 },
    { id: 93, name: "Abacaxi Grelhado", calories: 80, time: "4 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["4 rodelas de abacaxi", "Canela em pó"], steps: ["Aqueça uma frigideira.", "Grelhe as rodelas de abacaxi.", "Polvilhe canela.", "Sirva quente."], fitTip: "Perfeito como está - sem açúcar.", protein: 1, carbs: 18, fat: 0 },
    { id: 94, name: "Smoothie de Mamão com Laranja", calories: 115, time: "2 min", category: "frutas", icon: "Apple", tags: ["frutas", "rapido"], ingredients: ["1 fatia de mamão", "Suco de 2 laranjas", "1 colher de mel", "Gelo"], steps: ["Bata mamão com suco de laranja.", "Adicione mel e gelo.", "Bata por 1 minuto.", "Sirva imediatamente."], fitTip: "Pule o mel - frutas já adoçam.", protein: 2, carbs: 26, fat: 0 },
    { id: 95, name: "Salada de Frutas com Granola", calories: 140, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["1 maçã", "1 pera", "1 banana", "3 colheres de granola"], steps: ["Pique todas as frutas.", "Misture em uma tigela.", "Adicione granola por cima.", "Sirva imediatamente."], fitTip: "Use granola sem açúcar.", protein: 3, carbs: 30, fat: 3 },
    { id: 96, name: "Picolé de Morango Natural", calories: 50, time: "5 min", category: "frutas", icon: "Cherry", tags: ["frutas"], ingredients: ["1 xícara de morangos", "1/2 copo de água", "1 colher de mel"], steps: ["Bata morangos com água e mel.", "Despeje em forminhas.", "Leve ao freezer por 4 horas.", "Desenforme e sirva."], fitTip: "Pule o mel - morangos já são doces.", protein: 1, carbs: 12, fat: 0 },
    { id: 97, name: "Vitamina de Abacate com Limão", calories: 180, time: "2 min", category: "frutas", icon: "Apple", tags: ["frutas", "rapido"], ingredients: ["1/2 abacate", "Suco de 1 limão", "1 copo de água", "1 colher de mel"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Sirva gelado.", "Adicione gelo se desejar."], fitTip: "Pule o mel e use adoçante.", protein: 2, carbs: 18, fat: 12 },
    { id: 98, name: "Salada de Frutas Vermelhas", calories: 95, time: "3 min", category: "frutas", icon: "Cherry", tags: ["frutas"], ingredients: ["1/2 xícara de morangos", "1/2 xícara de framboesas", "1/2 xícara de mirtilos", "Hortelã"], steps: ["Lave todas as frutas.", "Misture em uma tigela.", "Adicione hortelã picada.", "Sirva gelado."], fitTip: "Perfeito como está - antioxidantes naturais.", protein: 2, carbs: 22, fat: 0 },
    { id: 99, name: "Suco Verde com Maçã", calories: 85, time: "2 min", category: "frutas", icon: "Apple", tags: ["frutas", "rapido"], ingredients: ["1 maçã", "1 folha de couve", "Suco de 1 limão", "Água"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Coe se preferir.", "Sirva gelado."], fitTip: "Adicione gengibre para mais benefícios.", protein: 2, carbs: 20, fat: 0 },
    { id: 100, name: "Banana com Pasta de Amendoim", calories: 160, time: "2 min", category: "frutas", icon: "Banana", tags: ["frutas", "rapido"], ingredients: ["1 banana", "2 colheres de pasta de amendoim"], steps: ["Corte banana em rodelas.", "Espalhe pasta de amendoim.", "Sirva imediatamente.", "Adicione canela se desejar."], fitTip: "Use pasta de amendoim natural.", protein: 6, carbs: 24, fat: 8 },
    { id: 101, name: "Smoothie de Pêssego", calories: 120, time: "2 min", category: "frutas", icon: "Apple", tags: ["frutas", "rapido"], ingredients: ["2 pêssegos", "1/2 copo de iogurte", "1 colher de mel", "Gelo"], steps: ["Descasque os pêssegos.", "Bata com iogurte e mel.", "Adicione gelo.", "Sirva imediatamente."], fitTip: "Use iogurte desnatado.", protein: 4, carbs: 24, fat: 2 },
    { id: 102, name: "Salada de Frutas com Coco", calories: 130, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["1 manga", "1 kiwi", "1 banana", "2 colheres de coco ralado"], steps: ["Pique todas as frutas.", "Misture em uma tigela.", "Adicione coco ralado.", "Sirva gelado."], fitTip: "Use coco sem açúcar.", protein: 2, carbs: 28, fat: 3 },
    { id: 103, name: "Vitamina de Frutas Vermelhas", calories: 110, time: "2 min", category: "frutas", icon: "Cherry", tags: ["frutas", "rapido"], ingredients: ["1 xícara de frutas vermelhas", "1 copo de leite", "1 colher de mel"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Sirva gelado.", "Adicione gelo se desejar."], fitTip: "Use leite de amêndoas.", protein: 5, carbs: 22, fat: 2 },
    { id: 104, name: "Pera Assada com Canela", calories: 90, time: "4 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["2 peras", "Canela em pó", "1 colher de mel"], steps: ["Corte peras ao meio.", "Polvilhe canela.", "Regue com mel.", "Leve ao micro-ondas por 2 minutos."], fitTip: "Pule o mel e use apenas canela.", protein: 1, carbs: 22, fat: 0 },
    { id: 105, name: "Suco de Maracujá Natural", calories: 75, time: "2 min", category: "frutas", icon: "Apple", tags: ["frutas", "rapido"], ingredients: ["Polpa de 2 maracujás", "1 copo de água", "1 colher de açúcar"], steps: ["Bata polpa com água.", "Adicione açúcar.", "Coe as sementes.", "Sirva gelado."], fitTip: "Use adoçante em vez de açúcar.", protein: 1, carbs: 18, fat: 0 },
    { id: 106, name: "Smoothie Bowl de Frutas", calories: 150, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["1 banana congelada", "1/2 xícara de frutas vermelhas", "1/2 copo de leite", "Granola"], steps: ["Bata banana com frutas e leite.", "Despeje em tigela.", "Decore com granola.", "Adicione frutas frescas."], fitTip: "Use leite de coco e granola sem açúcar.", protein: 5, carbs: 30, fat: 3 },
    { id: 107, name: "Salada de Melão com Hortelã", calories: 70, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["2 fatias de melão", "Hortelã fresca", "Suco de limão"], steps: ["Corte melão em cubos.", "Adicione hortelã picada.", "Regue com suco de limão.", "Sirva gelado."], fitTip: "Perfeito como está - refrescante.", protein: 1, carbs: 16, fat: 0 },
    { id: 108, name: "Vitamina de Goiaba", calories: 105, time: "2 min", category: "frutas", icon: "Apple", tags: ["frutas", "rapido"], ingredients: ["2 goiabas", "1 copo de leite", "1 colher de açúcar"], steps: ["Corte goiabas em pedaços.", "Bata com leite e açúcar.", "Coe se preferir.", "Sirva gelado."], fitTip: "Use leite desnatado e adoçante.", protein: 5, carbs: 22, fat: 2 },
    { id: 109, name: "Salada de Frutas com Mel", calories: 125, time: "3 min", category: "frutas", icon: "Apple", tags: ["frutas"], ingredients: ["1 maçã", "1 pera", "1 banana", "2 colheres de mel"], steps: ["Pique todas as frutas.", "Misture em uma tigela.", "Regue com mel.", "Sirva imediatamente."], fitTip: "Pule o mel - frutas já são doces.", protein: 1, carbs: 30, fat: 0 },
    { id: 110, name: "Smoothie de Açaí com Banana", calories: 170, time: "2 min", category: "frutas", icon: "Grape", tags: ["frutas", "rapido"], ingredients: ["1 pacote de açaí", "1 banana", "1/2 copo de leite"], steps: ["Bata tudo no liquidificador.", "Bata por 1 minuto.", "Sirva imediatamente.", "Adicione granola se desejar."], fitTip: "Use leite de coco.", protein: 4, carbs: 32, fat: 5 },
    
    // 🤷 NOVAS 14 RECEITAS TANTO FAZ (FAVORITAS DOS BRASILEIROS)
    { id: 111, name: "Pudim de Leite Condensado", calories: 280, time: "5 min", category: "brasileiro", icon: "Cake", tags: ["brasileiro"], ingredients: ["1 lata de leite condensado", "2 copos de leite", "3 ovos", "1 xícara de açúcar para calda"], steps: ["Bata leite condensado, leite e ovos.", "Caramelize açúcar na forma.", "Despeje a mistura.", "Leve ao micro-ondas por 8 minutos."], fitTip: "Use leite condensado light e pule a calda.", protein: 10, carbs: 42, fat: 8 },
    { id: 112, name: "Beijinho Tradicional", calories: 155, time: "4 min", category: "brasileiro", icon: "Candy", tags: ["brasileiro"], ingredients: ["1 lata de leite condensado", "1 colher de manteiga", "Coco ralado"], steps: ["Misture leite condensado e manteiga.", "Leve ao micro-ondas por 2 minutos.", "Deixe esfriar e enrole.", "Passe no coco ralado."], fitTip: "Use coco sem açúcar e reduza leite condensado.", protein: 3, carbs: 26, fat: 5 },
    { id: 113, name: "Cocada Branca", calories: 190, time: "5 min", category: "brasileiro", icon: "Candy", tags: ["brasileiro"], ingredients: ["2 xícaras de coco ralado", "1 lata de leite condensado", "1 colher de manteiga"], steps: ["Misture todos os ingredientes.", "Leve ao micro-ondas por 3 minutos.", "Mexa e volte por mais 2 minutos.", "Despeje em forma e corte."], fitTip: "Use leite condensado light.", protein: 3, carbs: 28, fat: 8 },
    { id: 114, name: "Bolo de Fubá", calories: 240, time: "5 min", category: "brasileiro", icon: "Cake", tags: ["brasileiro"], ingredients: ["1 xícara de fubá", "1 xícara de açúcar", "3 ovos", "1/2 xícara de óleo", "1 copo de leite"], steps: ["Bata tudo no liquidificador.", "Despeje em forma.", "Leve ao micro-ondas por 6 minutos.", "Deixe esfriar antes de desenformar."], fitTip: "Reduza açúcar pela metade e use óleo de coco.", protein: 7, carbs: 36, fat: 8 },
    { id: 115, name: "Paçoca Caseira", calories: 210, time: "4 min", category: "brasileiro", icon: "Cookie", tags: ["brasileiro"], ingredients: ["1 xícara de amendoim torrado", "1/2 xícara de açúcar", "1/2 xícara de farinha de mandioca"], steps: ["Triture amendoim no processador.", "Adicione açúcar e farinha.", "Misture até formar uma farofa.", "Modele em formato de paçoca."], fitTip: "Reduza açúcar pela metade.", protein: 8, carbs: 26, fat: 10 },
    { id: 116, name: "Quindim", calories: 200, time: "5 min", category: "brasileiro", icon: "Candy", tags: ["brasileiro"], ingredients: ["5 gemas", "1 xícara de açúcar", "1/2 xícara de coco ralado", "1 colher de manteiga"], steps: ["Misture todos os ingredientes.", "Despeje em forminhas.", "Leve ao micro-ondas por 3 minutos.", "Deixe esfriar antes de desenformar."], fitTip: "Reduza açúcar e use coco sem açúcar.", protein: 6, carbs: 30, fat: 8 },
    { id: 117, name: "Bolo de Cenoura com Chocolate", calories: 270, time: "5 min", category: "brasileiro", icon: "Cake", tags: ["brasileiro"], ingredients: ["2 cenouras", "3 ovos", "1 xícara de açúcar", "1 xícara de farinha", "200g de chocolate"], steps: ["Bata cenoura com ovos e açúcar.", "Adicione farinha.", "Leve ao micro-ondas por 5 minutos.", "Cubra com chocolate derretido."], fitTip: "Reduza açúcar e use chocolate 70% cacau.", protein: 7, carbs: 40, fat: 10 },
    { id: 118, name: "Cajuzinho", calories: 175, time: "4 min", category: "brasileiro", icon: "Candy", tags: ["brasileiro"], ingredients: ["1 lata de leite condensado", "2 colheres de amendoim", "1 colher de manteiga", "Amendoim para decorar"], steps: ["Misture leite condensado, amendoim e manteiga.", "Leve ao micro-ondas por 2 minutos.", "Deixe esfriar e modele.", "Decore com amendoim."], fitTip: "Use pasta de amendoim natural.", protein: 5, carbs: 28, fat: 6 },
    { id: 119, name: "Arroz Doce", calories: 220, time: "5 min", category: "brasileiro", icon: "Coffee", tags: ["brasileiro"], ingredients: ["1 xícara de arroz cozido", "2 copos de leite", "1/2 xícara de açúcar", "Canela"], steps: ["Cozinhe arroz com leite e açúcar.", "Mexa até engrossar.", "Polvilhe canela.", "Sirva quente ou frio."], fitTip: "Use leite desnatado e reduza açúcar.", protein: 6, carbs: 40, fat: 4 },
    { id: 120, name: "Curau de Milho", calories: 180, time: "5 min", category: "brasileiro", icon: "Coffee", tags: ["brasileiro"], ingredients: ["2 espigas de milho", "2 copos de leite", "1/2 xícara de açúcar", "Canela"], steps: ["Bata milho com leite.", "Coe e leve ao fogo com açúcar.", "Mexa até engrossar.", "Polvilhe canela."], fitTip: "Use leite desnatado e adoçante.", protein: 5, carbs: 32, fat: 3 },
    { id: 121, name: "Pé de Moleque", calories: 230, time: "5 min", category: "brasileiro", icon: "Cookie", tags: ["brasileiro"], ingredients: ["2 xícaras de amendoim", "1 xícara de açúcar", "1/2 xícara de água"], steps: ["Faça calda com açúcar e água.", "Adicione amendoim.", "Mexa até secar.", "Despeje em forma e corte."], fitTip: "Reduza açúcar pela metade.", protein: 9, carbs: 28, fat: 12 },
    { id: 122, name: "Bolo de Milho", calories: 250, time: "5 min", category: "brasileiro", icon: "Cake", tags: ["brasileiro"], ingredients: ["2 espigas de milho", "3 ovos", "1 xícara de açúcar", "1/2 xícara de óleo", "1 copo de leite"], steps: ["Bata tudo no liquidificador.", "Despeje em forma.", "Leve ao micro-ondas por 6 minutos.", "Deixe esfriar."], fitTip: "Reduza açúcar e use óleo de coco.", protein: 7, carbs: 38, fat: 8 },
    { id: 123, name: "Doce de Leite Caseiro", calories: 260, time: "5 min", category: "brasileiro", icon: "Coffee", tags: ["brasileiro"], ingredients: ["1 lata de leite condensado"], steps: ["Coloque leite condensado em tigela.", "Cubra com filme plástico.", "Leve ao micro-ondas por 3 minutos.", "Mexa e volte por mais 2 minutos."], fitTip: "Use leite condensado light.", protein: 6, carbs: 42, fat: 6 },
    { id: 124, name: "Cocada Preta", calories: 200, time: "5 min", category: "brasileiro", icon: "Candy", tags: ["brasileiro"], ingredients: ["2 xícaras de coco ralado", "1 xícara de açúcar mascavo", "1/2 xícara de água"], steps: ["Faça calda com açúcar e água.", "Adicione coco.", "Mexa até secar.", "Despeje em forma e corte."], fitTip: "Reduza açúcar pela metade.", protein: 2, carbs: 30, fat: 8 },
    
    // 🥣 Mais leve + ⚡ Bem rápido (Frutas até 3min)
    { 
      id: 16, 
      name: "Banana com Cacau", 
      calories: 120, 
      time: "1 min", 
      category: "frutas", 
      icon: "Banana", 
      tags: ["frutas", "rapido"],
      ingredients: [
        "1 banana madura",
        "1 colher de cacau em pó"
      ],
      steps: [
        "Corte a banana em rodelas.",
        "Polvilhe o cacau por cima.",
        "Sirva imediatamente."
      ],
      fitTip: "Adicione canela em pó para dar mais sabor sem calorias extras.",
      protein: 2,
      carbs: 26,
      fat: 1
    },
    { 
      id: 17, 
      name: "Morango com Creme", 
      calories: 110, 
      time: "2 min", 
      category: "frutas", 
      icon: "Cherry", 
      tags: ["frutas", "rapido"],
      ingredients: [
        "1 xícara de morangos",
        "2 colheres de creme de leite",
        "1 colher de açúcar"
      ],
      steps: [
        "Lave e corte os morangos.",
        "Misture creme de leite com açúcar.",
        "Cubra os morangos com o creme."
      ],
      fitTip: "Troque o creme de leite por iogurte grego natural.",
      protein: 2,
      carbs: 18,
      fat: 5
    },
    { 
      id: 18, 
      name: "Maçã com Canela", 
      calories: 95, 
      time: "2 min", 
      category: "frutas", 
      icon: "Apple", 
      tags: ["frutas", "rapido"],
      ingredients: [
        "1 maçã",
        "1 colher de canela em pó",
        "1 colher de mel"
      ],
      steps: [
        "Corte a maçã em fatias.",
        "Polvilhe canela por cima.",
        "Regue com mel e sirva."
      ],
      fitTip: "Pule o mel e use apenas canela para reduzir calorias.",
      protein: 0,
      carbs: 24,
      fat: 0
    },
  ];

  // Combina receitas padrão com personalizadas
  const allRecipes = [...defaultRecipes, ...customRecipes];

  // Função para escolher receitas inteligentes (opção "Tanto faz")
  const getSmartRecipes = () => {
    const hour = new Date().getHours();
    let selectedRecipes: Recipe[] = [];

    // Lógica baseada no horário
    if (hour >= 6 && hour < 12) {
      // Manhã: receitas mais leves e rápidas
      selectedRecipes = allRecipes.filter(r => r.tags.includes("frutas") || r.calories < 150);
    } else if (hour >= 12 && hour < 18) {
      // Tarde: mix de tudo
      selectedRecipes = allRecipes.filter(r => r.tags.includes("rapido"));
    } else {
      // Noite: receitas mais indulgentes
      selectedRecipes = allRecipes.filter(r => r.tags.includes("chocolate"));
    }

    // Embaralha e retorna 6
    return selectedRecipes.sort(() => Math.random() - 0.5).slice(0, 6);
  };

  // Função para aplicar filtro rápido
  const applyQuickFilter = (filterType: string) => {
    setQuickFilterActive(filterType);
    setDisplayedRecipesCount(6);
    setShowOnlyFavorites(false);
  };

  // Função para obter receitas filtradas
  const getFilteredRecipes = () => {
    let filtered: Recipe[] = [];

    // Se filtro de favoritos está ativo, mostra apenas favoritos
    if (showOnlyFavorites) {
      filtered = allRecipes.filter(r => favorites.includes(r.id));
    } else if (quickFilterActive === "chocolate") {
      filtered = allRecipes.filter(r => r.tags.includes("chocolate"));
    } else if (quickFilterActive === "rapido") {
      filtered = allRecipes.filter(r => {
        const timeInMinutes = parseInt(r.time);
        return timeInMinutes <= 2;
      });
    } else if (quickFilterActive === "frutas") {
      filtered = allRecipes.filter(r => r.tags.includes("frutas"));
    } else if (quickFilterActive === "tanto-faz") {
      filtered = getSmartRecipes();
    } else if (quickFilterActive === "minhas") {
      // Filtro para receitas personalizadas
      filtered = customRecipes;
    }

    return filtered;
  };

  const filteredRecipes = getFilteredRecipes();
  const displayedRecipes = filteredRecipes.slice(0, displayedRecipesCount);
  const hasMoreRecipes = displayedRecipesCount < filteredRecipes.length;

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleUseFitTip = (recipe: Recipe) => {
    if (!usedFitTip) {
      setUsedFitTip(true);
      
      let caloriesReduction = 0;
      
      if (recipe.fitTip) {
        const fitTipLower = recipe.fitTip.toLowerCase();
        
        if (fitTipLower.includes("troque") || fitTipLower.includes("substitua") || fitTipLower.includes("metade")) {
          caloriesReduction = Math.round(recipe.calories * 0.20);
        } else if (fitTipLower.includes("reduza") || fitTipLower.includes("gordura") || fitTipLower.includes("light") || fitTipLower.includes("desnatado")) {
          caloriesReduction = Math.round(recipe.calories * 0.25);
        } else if (fitTipLower.includes("adicione") || fitTipLower.includes("aumente") || fitTipLower.includes("fruta")) {
          caloriesReduction = Math.round(recipe.calories * 0.15);
        } else {
          caloriesReduction = Math.round(recipe.calories * 0.20);
        }
      }
      
      const newCalories = recipe.calories - caloriesReduction;
      setDisplayedCalories(newCalories);
    } else {
      setUsedFitTip(false);
      setDisplayedCalories(null);
    }
  };

  const handleEatRecipe = async (recipe: Recipe) => {
    const finalCalories = displayedCalories !== null ? displayedCalories : recipe.calories;
    const caloriesReduction = recipe.calories - finalCalories;
    
    // Calcular valores nutricionais ajustados se a dica foi usada
    const adjustmentFactor = usedFitTip ? (finalCalories / recipe.calories) : 1;
    const finalProtein = Math.round((recipe.protein || 0) * adjustmentFactor);
    const finalCarbs = Math.round((recipe.carbs || 0) * adjustmentFactor);
    const finalFat = Math.round((recipe.fat || 0) * adjustmentFactor);
    
    if (usedFitTip && caloriesReduction > 0) {
      setFeedbackMessage(`Dica aplicada: −${caloriesReduction} kcal`);
      setTimeout(() => setFeedbackMessage(""), 3000);
    }

    const now = new Date();

    // Salvar no Supabase se usuário estiver autenticado
    if (userId) {
      try {
        await addMealToHistory({
          user_id: userId,
          meal_type: "snack",
          food_name: recipe.name,
          calories: finalCalories,
          protein: finalProtein,
          carbs: finalCarbs,
          fat: finalFat,
          notes: usedFitTip ? `Dica fit aplicada: ${recipe.fitTip}` : undefined,
        });
      } catch (error) {
        console.error("Erro ao salvar no Supabase:", error);
      }
    }

    // CORREÇÃO: Adicionar ao histórico de refeições no localStorage com estrutura IDÊNTICA
    const newMeal = {
      id: Date.now().toString(),
      type: "snack",
      timestamp: now.toISOString(),
      foods: [
        {
          name: recipe.name,
          quantity: 1,
          unit: "porção",
          calories: finalCalories,
          protein: finalProtein,
          carbs: finalCarbs,
          fat: finalFat,
        }
      ],
      totalNutrition: {
        calories: finalCalories,
        protein: finalProtein,
        carbs: finalCarbs,
        fat: finalFat,
      }
    };

    // Salvar no localStorage
    const existingMeals = JSON.parse(localStorage.getItem("meals") || "[]");
    existingMeals.push(newMeal);
    localStorage.setItem("meals", JSON.stringify(existingMeals));

    // Disparar evento de storage para atualizar outros componentes
    window.dispatchEvent(new Event('storage'));

    // Abrir modal com receita
    setShowRecipeModal(true);
  };

  const favoriteCount = favorites.length;

  // Mapeamento de ícones
  const iconMap: Record<string, any> = {
    Cookie,
    Cake,
    Coffee,
    Zap,
    Candy,
    Banana,
    Cherry,
    Apple,
    Grape,
    Snowflake,
    Milk,
    Droplet,
    Soup,
    IceCream,
    Circle,
    Croissant,
  };

  // Modal de receita (popup) - APENAS PARA ACOMPANHAR PREPARO
  if (showRecipeModal && selectedRecipe) {
    const IconComponent = iconMap[selectedRecipe.icon];
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header com botão fechar */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-lg border-b border-slate-200 p-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{selectedRecipe.name}</h2>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>{displayedCalories !== null ? displayedCalories : selectedRecipe.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-blue-500" />
                      <span>{selectedRecipe.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRecipeModal(false);
                  setSelectedRecipe(null);
                  setUsedFitTip(false);
                  setDisplayedCalories(null);
                  setFeedbackMessage("");
                  setShowFitTip(true);
                }}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>

          {/* Conteúdo - APENAS PARA ACOMPANHAR PREPARO */}
          <div className="p-6 space-y-6">
            {/* Ingredientes */}
            {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Ingredientes</h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-sm text-slate-700 leading-relaxed">
                      • {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modo de Preparo */}
            {selectedRecipe.steps && selectedRecipe.steps.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Modo de Preparo</h3>
                <ol className="space-y-3">
                  {selectedRecipe.steps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 text-pink-600 font-semibold flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <span className="flex-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* DICA FIT APLICADA (se usuário usou) */}
            {usedFitTip && selectedRecipe.fitTip && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
                <h3 className="text-base font-semibold text-green-800 mb-3">✓ Dica Fit Aplicada</h3>
                <p className="text-sm text-green-700 leading-relaxed">
                  {selectedRecipe.fitTip}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Se uma receita está selecionada (tela de detalhes antes de comer)
  if (selectedRecipe) {
    const IconComponent = iconMap[selectedRecipe.icon];
    const currentCalories = displayedCalories !== null ? displayedCalories : selectedRecipe.calories;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        {/* Header com botão voltar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedRecipe(null);
                setUsedFitTip(false);
                setDisplayedCalories(null);
                setFeedbackMessage("");
                setShowFitTip(true);
              }}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-800">{selectedRecipe.name}</h1>
                {selectedRecipe.isCustom && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-semibold">
                    Minha
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(selectedRecipe.id);
                  }}
                  className={`flex-shrink-0 transition-all duration-300 ${
                    favorites.includes(selectedRecipe.id) ? "text-pink-500 scale-110" : "text-slate-300 hover:text-pink-500"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${favorites.includes(selectedRecipe.id) ? "fill-current" : ""}`} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs mt-1">
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className={`transition-all duration-300 ${usedFitTip ? 'text-green-600 font-semibold' : ''}`}>
                    {currentCalories} kcal
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5 text-blue-500" />
                  <span>{selectedRecipe.time}</span>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Ingredientes */}
          {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Ingredientes</h3>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm text-slate-700 leading-relaxed">
                    • {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modo de Preparo */}
          {selectedRecipe.steps && selectedRecipe.steps.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Modo de Preparo</h3>
              <ol className="space-y-3">
                {selectedRecipe.steps.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 text-pink-600 font-semibold flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* DICA FIT COM CHECKBOX E BOTÃO FECHAR */}
          {showFitTip && selectedRecipe.fitTip && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 relative">
              <button
                onClick={() => setShowFitTip(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-green-100 transition-colors"
                aria-label="Não quero aderir"
              >
                <X className="w-4 h-4 text-green-700" />
              </button>
              
              <h2 className="text-base font-semibold text-green-800 mb-3">Dica Fit</h2>
              <p className="text-sm text-green-700 leading-relaxed mb-3">
                {selectedRecipe.fitTip}
              </p>
              
              {/* Checkbox discreto */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usedFitTip}
                  onChange={() => handleUseFitTip(selectedRecipe)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-xs text-gray-500">Usei essa dica</span>
              </label>
            </div>
          )}

          {/* BOTÃO "VOU COMER" */}
          <div className="space-y-2">
            <button
              onClick={() => handleEatRecipe(selectedRecipe)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold text-sm shadow-lg shadow-pink-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Vou comer
            </button>
            
            {/* Feedback sutil */}
            {feedbackMessage && (
              <p className="text-xs text-center text-green-600 animate-fade-in">
                {feedbackMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tela principal com lista de receitas
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-2xl shadow-pink-500/30 mb-2">
          <Heart className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-lg font-inter font-semibold text-slate-800">
          SOS Doce
        </h2>
        <p className="text-xs mt-1">
          Receitas rápidas para matar a vontade
        </p>
      </div>

      {/* BOTÃO FAVORITOS */}
      {favorites.length > 0 && !quickFilterActive && (
        <button
          onClick={() => {
            setShowOnlyFavorites(true);
            setQuickFilterActive("favorites");
            setDisplayedRecipesCount(6);
          }}
          className="w-full p-3 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 hover:border-pink-300 transition-all duration-300 flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600 fill-current" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-800">Minhas Favoritas</div>
              <div className="text-xs text-slate-500">{favorites.length} receita{favorites.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div className="text-pink-500">→</div>
        </button>
      )}

      {/* FILTROS RÁPIDOS */}
      {!quickFilterActive && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => applyQuickFilter("chocolate")}
              className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 text-left group hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-xl mb-1">🍫</div>
              <div className="text-xs font-semibold text-slate-800 mb-0.5">Bem doce</div>
              <div className="text-[10px] text-slate-500">chocolate, brigadeiro</div>
            </button>

            <button
              onClick={() => applyQuickFilter("rapido")}
              className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 text-left group hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-xl mb-1">⚡</div>
              <div className="text-xs font-semibold text-slate-800 mb-0.5">Bem rápido</div>
              <div className="text-[10px] text-slate-500">mata vontade em 2 min</div>
            </button>

            <button
              onClick={() => applyQuickFilter("frutas")}
              className="p-3 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-300 transition-all duration-300 text-left group hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-xl mb-1">🥣</div>
              <div className="text-xs font-semibold text-slate-800 mb-0.5">Mais leve</div>
              <div className="text-[10px] text-slate-500">doce com frutas</div>
            </button>

            <button
              onClick={() => applyQuickFilter("tanto-faz")}
              className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 text-left group hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-xl mb-1">🤷</div>
              <div className="text-xs font-semibold text-slate-800 mb-0.5">Tanto faz</div>
              <div className="text-[10px] text-slate-500">escolhe por mim</div>
            </button>
          </div>

          {/* BOTÃO MINHAS RECEITAS - NOVO */}
          {customRecipes.length > 0 && (
            <button
              onClick={() => applyQuickFilter("minhas")}
              className="w-full p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-800">Minhas Receitas</div>
                  <div className="text-xs text-slate-500">{customRecipes.length} receita{customRecipes.length !== 1 ? 's' : ''} personalizada{customRecipes.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div className="text-purple-500">→</div>
            </button>
          )}

          {/* BOTÃO ADICIONAR RECEITA - SEMPRE VISÍVEL */}
          <button
            onClick={() => setShowAddRecipeSheet(true)}
            className="w-full p-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            Minhas receitas
          </button>
        </div>
      )}

      {/* HEADER COM FILTRO ATIVO */}
      {quickFilterActive && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setQuickFilterActive(null);
                setShowOnlyFavorites(false);
                setDisplayedRecipesCount(6);
              }}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                {quickFilterActive === "favorites" && "❤️ Minhas Favoritas"}
                {quickFilterActive === "chocolate" && "🍫 Bem doce"}
                {quickFilterActive === "rapido" && "⚡ Bem rápido"}
                {quickFilterActive === "frutas" && "🥣 Mais leve"}
                {quickFilterActive === "tanto-faz" && "🤷 Escolhi por você"}
                {quickFilterActive === "minhas" && "👨‍🍳 Minhas Receitas"}
              </h3>
              <p className="text-[10px] text-slate-500">{filteredRecipes.length} receitas</p>
            </div>
          </div>
        </div>
      )}

      {/* Recipes Grid - SÓ MOSTRA SE FILTRO ATIVO */}
      {quickFilterActive && (
        <div className="space-y-2">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                {quickFilterActive === "minhas" 
                  ? "Nenhuma receita personalizada ainda" 
                  : "Nenhuma receita favorita ainda"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {quickFilterActive === "minhas"
                  ? "Clique em '+ Minhas receitas' para criar"
                  : "Favorite receitas para vê-las aqui"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {displayedRecipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    {...recipe} 
                    favorite={favorites.includes(recipe.id)}
                    onToggleFavorite={() => toggleFavorite(recipe.id)}
                    onSelect={() => setSelectedRecipe(recipe)}
                    IconComponent={iconMap[recipe.icon]}
                  />
                ))}
              </div>

              {/* Botão "Ver outras opções" */}
              {hasMoreRecipes && (
                <button
                  onClick={() => setDisplayedRecipesCount(prev => prev + 6)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 transition-all duration-200"
                >
                  Ver outras opções
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Sheet para adicionar receita */}
      <AddCustomRecipeSheet
        isOpen={showAddRecipeSheet}
        onClose={() => setShowAddRecipeSheet(false)}
        onSave={saveCustomRecipe}
      />
    </div>
  );
}

function RecipeCard({
  name,
  calories,
  time,
  favorite,
  IconComponent,
  onToggleFavorite,
  onSelect,
  isCustom,
}: {
  name: string;
  calories: number;
  time: string;
  favorite: boolean;
  IconComponent: any;
  onToggleFavorite: () => void;
  onSelect: () => void;
  isCustom?: boolean;
}) {
  return (
    <div 
      onClick={onSelect}
      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-pointer group relative"
    >
      {isCustom && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 text-[9px] font-semibold">
          Minha
        </div>
      )}
      <div className="flex flex-col gap-2">
        {/* Icon e Favorito */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <IconComponent className="w-5 h-5 text-pink-600" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`flex-shrink-0 transition-colors ${
              favorite ? "text-pink-500" : "text-slate-300 hover:text-pink-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${favorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Nome */}
        <h4 className="font-semibold text-xs text-slate-800 line-clamp-2 leading-tight">{name}</h4>

        {/* Info */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>{calories}</span>
          </div>
          <div className="flex items-center gap-1">
            <Timer className="w-3 h-3 text-blue-500" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
