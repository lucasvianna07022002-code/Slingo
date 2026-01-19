"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Check, Loader2, Edit2, Plus, Minus, AlertCircle, X, RotateCw } from "lucide-react";
import { PlateAnalysisResult, NutritionInfo } from "@/lib/types/meal";
import { findTacoFood, calculateNutrition, extractQuantityFromPortion, TacoFood } from "@/lib/tacoTable";
import { analyzeFoodImage } from "@/lib/openai/foodAnalysis";

interface PlateScannerProps {
  onResult: (result: PlateAnalysisResult) => void;
  onBack: () => void;
}

interface FoodWithQuantity {
  name: string;
  estimatedPortion: string;
  nutrition: NutritionInfo;
  confidence: number;
  tacoFood: TacoFood | null;
  currentQuantity: number; // Quantidade atual de porções
}

export default function PlateScanner({ onResult, onBack }: PlateScannerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PlateAnalysisResult | null>(null);
  const [editedFoods, setEditedFoods] = useState<FoodWithQuantity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Iniciar câmera
  const startCamera = async () => {
    try {
      setError(null);
      setIsCameraLoading(true);
      console.log("Tentando acessar câmera com facingMode:", facingMode);

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Câmera acessada com sucesso!", mediaStream);
      console.log("Tracks de vídeo:", mediaStream.getVideoTracks());

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        const video = videoRef.current;

        // Adicionar event listeners
        video.onloadedmetadata = () => {
          console.log("Metadata carregada:", {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
          });
        };

        video.onloadeddata = () => {
          console.log("Dados do vídeo carregados");
        };

        video.srcObject = mediaStream;
        console.log("Stream atribuído ao vídeo");

        // Tentar reproduzir o vídeo
        try {
          await video.play();
          console.log("Vídeo reproduzindo");
        } catch (playError) {
          console.error("Erro ao reproduzir vídeo:", playError);
        }
      }

      setIsCameraLoading(false);
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setError(`Não foi possível acessar a câmera. ${err instanceof Error ? err.message : 'Verifique as permissões.'}`);
      setIsCameraLoading(false);
      setIsCameraActive(false);
    }
  };

  // Parar câmera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  // Alternar entre câmera frontal e traseira
  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    setTimeout(() => startCamera(), 100);
  };

  // Atualizar facingMode quando mudar
  useEffect(() => {
    if (isCameraActive) {
      // Reiniciar câmera quando facingMode mudar
      startCamera();
    }
  }, [facingMode]);

  // Limpar recursos ao desmontar componente
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Tirar foto da câmera
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Configurar tamanho do canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame atual do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter canvas para blob com tipo JPEG explícito
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Falha ao criar blob da imagem");
        return;
      }

      console.log("Blob criado:", {
        type: blob.type,
        size: blob.size
      });

      // Criar um File object com tipo MIME explícito (mais confiável que Blob)
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

      console.log("File criado:", {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Criar URL da imagem
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);

      // Parar câmera
      stopCamera();

      // Analisar imagem usando File ao invés de Blob
      await analyzeImage(file);
    }, 'image/jpeg', 0.95);
  };

  const handleCapture = async () => {
    fileInputRef.current?.click();
  };

  // Função genérica de análise de imagem
  const analyzeImage = async (imageBlob: Blob) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Analisar imagem com OpenAI Vision API
      const aiResult = await analyzeFoodImage(imageBlob);

      // Processar resultados da IA e tentar enriquecer com dados da tabela TACO
      const foodsWithTaco: FoodWithQuantity[] = aiResult.foods.map((food) => {
        const tacoFood = findTacoFood(food.name);
        const quantity = extractQuantityFromPortion(food.estimatedPortion);

        if (tacoFood) {
          // Usar dados da tabela TACO (mais precisos)
          const nutrition = calculateNutrition(tacoFood, quantity, "portion");
          return {
            name: tacoFood.name,
            estimatedPortion: food.estimatedPortion,
            nutrition,
            confidence: food.confidence,
            tacoFood,
            currentQuantity: quantity,
          };
        }

        // Usar dados da OpenAI se não encontrar na TACO
        return {
          name: food.name,
          estimatedPortion: food.estimatedPortion,
          nutrition: {
            calories: food.calories,
            carbs: food.carbs,
            protein: food.protein,
            fat: food.fat,
          },
          confidence: food.confidence,
          tacoFood: null,
          currentQuantity: quantity,
        };
      });

      const totalNutrition = foodsWithTaco.reduce(
        (acc, food) => ({
          calories: acc.calories + food.nutrition.calories,
          carbs: acc.carbs + food.nutrition.carbs,
          protein: acc.protein + food.nutrition.protein,
          fat: acc.fat + food.nutrition.fat,
        }),
        { calories: 0, carbs: 0, protein: 0, fat: 0 }
      );

      const result: PlateAnalysisResult = {
        foods: foodsWithTaco.map(f => ({
          name: f.name,
          estimatedPortion: f.estimatedPortion,
          nutrition: f.nutrition,
          confidence: f.confidence,
        })),
        totalNutrition,
      };

      setAnalysisResult(result);
      setEditedFoods(foodsWithTaco);
    } catch (error) {
      console.error("Erro na análise:", error);
      setError("Erro ao analisar a imagem. Tente novamente ou use outro método.");
      setCapturedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Criar preview da imagem
    const imageUrl = URL.createObjectURL(file);
    setCapturedImage(imageUrl);

    // Analisar imagem
    await analyzeImage(file);
  };

  const handleAdjustQuantity = (index: number, increment: boolean) => {
    const newFoods = [...editedFoods];
    const food = newFoods[index];

    if (!food.tacoFood) {
      // Se não tem dados TACO, ajusta proporcionalmente (fallback antigo)
      const multiplier = increment ? 1.25 : 0.75;
      newFoods[index] = {
        ...food,
        nutrition: {
          calories: Math.round(food.nutrition.calories * multiplier),
          carbs: Math.round(food.nutrition.carbs * multiplier * 10) / 10,
          protein: Math.round(food.nutrition.protein * multiplier * 10) / 10,
          fat: Math.round(food.nutrition.fat * multiplier * 10) / 10,
        },
      };
    } else {
      // Ajusta a quantidade de porções (incremento de 0.5)
      const newQuantity = increment 
        ? food.currentQuantity + 0.5 
        : Math.max(0.5, food.currentQuantity - 0.5);

      const newNutrition = calculateNutrition(food.tacoFood, newQuantity, "portion");
      
      // Atualiza a descrição da porção
      const portionUnit = food.tacoFood.portionReference.replace(/^\d+(\.\d+)?\s*/, "");
      const newPortionDescription = `${newQuantity} ${portionUnit}${newQuantity !== 1 ? 's' : ''}`;

      newFoods[index] = {
        ...food,
        currentQuantity: newQuantity,
        estimatedPortion: newPortionDescription,
        nutrition: newNutrition,
      };
    }

    setEditedFoods(newFoods);
  };

  const calculateTotals = (): NutritionInfo => {
    return editedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.nutrition.calories,
        carbs: acc.carbs + food.nutrition.carbs,
        protein: acc.protein + food.nutrition.protein,
        fat: acc.fat + food.nutrition.fat,
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  };

  const handleConfirm = () => {
    if (analysisResult) {
      onResult({
        foods: editedFoods.map(f => ({
          name: f.name,
          estimatedPortion: f.estimatedPortion,
          nutrition: f.nutrition,
          confidence: f.confidence,
        })),
        totalNutrition: calculateTotals(),
      });
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Preview */}
      <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
        {capturedImage ? (
          <>
            {/* Imagem capturada */}
            <img
              src={capturedImage}
              alt="Foto capturada"
              className="w-full h-full object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-700">Analisando com IA...</p>
                  <p className="text-xs text-slate-500">Identificando alimentos e calorias</p>
                </div>
              </div>
            )}
            {analysisResult && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-4">
                <div className="text-center text-white">
                  <Check className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm font-semibold">{editedFoods.length} alimentos identificados</p>
                </div>
              </div>
            )}
          </>
        ) : isCameraActive || isCameraLoading ? (
          <>
            {/* Câmera ao vivo */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ display: isCameraLoading ? 'none' : 'block' }}
            />

            {/* Loading da câmera */}
            {isCameraLoading && (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin" />
                  <p className="text-sm font-medium">Ativando câmera...</p>
                </div>
              </div>
            )}

            {/* Botão para alternar câmera (mobile) */}
            {!isCameraLoading && (
              <>
                <button
                  onClick={switchCamera}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <RotateCw className="w-5 h-5 text-white" />
                </button>
                {/* Guia de enquadramento */}
                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-2xl" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-white text-center bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <p className="text-sm font-medium">Enquadre seu prato</p>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Estado inicial */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-pulse" />
            <Camera className="w-16 h-16 text-white/50" />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Erro na análise</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!analysisResult ? (
        <>
          <p className="text-center text-sm text-slate-600">
            {isCameraActive
              ? "Posicione a câmera sobre seu prato e clique para capturar"
              : "Ative a câmera ou escolha uma foto da galeria"}
          </p>

          {isCameraActive ? (
            <div className="flex gap-3">
              <button
                onClick={stopCamera}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
              <button
                onClick={takePhoto}
                disabled={isAnalyzing}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capturar
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={startCamera}
                disabled={isAnalyzing}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Abrir Câmera
              </button>
              <button
                onClick={handleCapture}
                disabled={isAnalyzing}
                className="flex-1 py-3 rounded-2xl border-2 border-purple-500 text-purple-600 font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Galeria
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Foods List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700">Alimentos Identificados</h4>
              <span className="text-xs text-slate-500">Ajuste as quantidades</span>
            </div>

            {editedFoods.map((food, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-slate-800">{food.name}</h5>
                    <p className="text-sm text-slate-500">{food.estimatedPortion}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            food.confidence > 0.9
                              ? "bg-green-500"
                              : food.confidence > 0.8
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                          }`}
                        />
                        <span className="text-xs text-slate-500">
                          {Math.round(food.confidence * 100)}% confiança
                        </span>
                      </div>
                      {food.tacoFood && (
                        <span className="text-xs text-purple-600 font-medium">
                          • Tabela TACO
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAdjustQuantity(index, false)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleAdjustQuantity(index, true)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Cal</p>
                    <p className="text-sm font-bold text-slate-800">{food.nutrition.calories}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Carbs</p>
                    <p className="text-sm font-bold text-slate-800">{food.nutrition.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Prot</p>
                    <p className="text-sm font-bold text-slate-800">{food.nutrition.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Gord</p>
                    <p className="text-sm font-bold text-slate-800">{food.nutrition.fat}g</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Nutrition */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-4">
            <h4 className="font-semibold text-purple-900 mb-3">Total da Refeição</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 rounded-xl p-3">
                <p className="text-xs text-purple-600 mb-1">Calorias</p>
                <p className="text-2xl font-bold text-purple-900">{calculateTotals().calories}</p>
                <p className="text-xs text-purple-600">kcal</p>
              </div>
              <div className="bg-white/80 rounded-xl p-3">
                <p className="text-xs text-purple-600 mb-1">Carboidratos</p>
                <p className="text-2xl font-bold text-purple-900">{calculateTotals().carbs}</p>
                <p className="text-xs text-purple-600">gramas</p>
              </div>
              <div className="bg-white/80 rounded-xl p-3">
                <p className="text-xs text-purple-600 mb-1">Proteínas</p>
                <p className="text-2xl font-bold text-purple-900">{calculateTotals().protein}</p>
                <p className="text-xs text-purple-600">gramas</p>
              </div>
              <div className="bg-white/80 rounded-xl p-3">
                <p className="text-xs text-purple-600 mb-1">Gorduras</p>
                <p className="text-2xl font-bold text-purple-900">{calculateTotals().fat}</p>
                <p className="text-xs text-purple-600">gramas</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm text-amber-700">
              💡 <span className="font-semibold">Dica:</span> Use os botões + e - para ajustar as
              quantidades. Os valores nutricionais são calculados automaticamente com base na tabela TACO.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setAnalysisResult(null);
                setEditedFoods([]);
                setCapturedImage(null);
                setError(null);
                stopCamera();
              }}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
            >
              Nova Foto
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Confirmar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
