"use client";

import { useState, useRef } from "react";
import { Camera, X, Check, Loader2 } from "lucide-react";
import { BarcodeResult, PortionSize, PORTION_MULTIPLIERS } from "@/lib/types/meal";

interface BarcodeScannerProps {
  onResult: (result: BarcodeResult, portion: PortionSize) => void;
  onBack: () => void;
}

export default function BarcodeScanner({ onResult, onBack }: BarcodeScannerProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<PortionSize | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<BarcodeResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Simular escaneamento (em produção, usar biblioteca de barcode scanner)
  const handleScan = async () => {
    setIsScanning(true);

    // Simular delay de escaneamento
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Produto simulado (em produção, viria da API após escanear)
    const mockProduct: BarcodeResult = {
      productName: "Biscoito Integral Fit",
      barcode: "7891234567890",
      nutrition: {
        calories: 120,
        carbs: 18,
        protein: 3,
        fat: 4,
      },
    };

    setScannedProduct(mockProduct);
    setIsScanning(false);
  };

  const handleConfirm = () => {
    if (scannedProduct && selectedQuantity) {
      onResult(scannedProduct, selectedQuantity);
    }
  };

  return (
    <div className="space-y-4">
      {/* Camera Preview */}
      <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
        {!scannedProduct ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-pulse" />
            <Camera className="w-16 h-16 text-white/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-32 border-2 border-blue-400 rounded-xl" />
            </div>
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-700">Escaneando...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <div className="text-center text-white">
              <Check className="w-16 h-16 mx-auto mb-3" />
              <p className="text-lg font-semibold">Produto Identificado!</p>
            </div>
          </div>
        )}
      </div>

      {!scannedProduct ? (
        <>
          <p className="text-center text-sm text-slate-600">
            Posicione o código de barras dentro do quadro
          </p>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full py-3 rounded-2xl bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isScanning ? "Escaneando..." : "Iniciar Escaneamento"}
          </button>
        </>
      ) : (
        <>
          {/* Product Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h4 className="font-semibold text-slate-800 mb-3">{scannedProduct.productName}</h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xs text-slate-500 mb-1">Calorias</p>
                <p className="text-sm font-bold text-slate-800">
                  {scannedProduct.nutrition.calories}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Carbs</p>
                <p className="text-sm font-bold text-slate-800">{scannedProduct.nutrition.carbs}g</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Proteína</p>
                <p className="text-sm font-bold text-slate-800">
                  {scannedProduct.nutrition.protein}g
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Gordura</p>
                <p className="text-sm font-bold text-slate-800">{scannedProduct.nutrition.fat}g</p>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Selecione a Quantidade</h4>
            <div className="grid grid-cols-4 gap-2">
              <QuantityButton
                label="P"
                description="25%"
                active={selectedQuantity === "P"}
                onClick={() => setSelectedQuantity("P")}
              />
              <QuantityButton
                label="M"
                description="50%"
                active={selectedQuantity === "M"}
                onClick={() => setSelectedQuantity("M")}
              />
              <QuantityButton
                label="G"
                description="75%"
                active={selectedQuantity === "G"}
                onClick={() => setSelectedQuantity("G")}
              />
              <QuantityButton
                label="T"
                description="100%"
                active={selectedQuantity === "T"}
                onClick={() => setSelectedQuantity("T")}
              />
            </div>
          </div>

          {/* Preview with selected portion */}
          {selectedQuantity && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Valores Calculados:</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs text-blue-600 mb-1">Calorias</p>
                  <p className="text-sm font-bold text-blue-900">
                    {Math.round(
                      scannedProduct.nutrition.calories * PORTION_MULTIPLIERS[selectedQuantity]
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Carbs</p>
                  <p className="text-sm font-bold text-blue-900">
                    {Math.round(
                      scannedProduct.nutrition.carbs * PORTION_MULTIPLIERS[selectedQuantity]
                    )}
                    g
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Proteína</p>
                  <p className="text-sm font-bold text-blue-900">
                    {Math.round(
                      scannedProduct.nutrition.protein * PORTION_MULTIPLIERS[selectedQuantity]
                    )}
                    g
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Gordura</p>
                  <p className="text-sm font-bold text-blue-900">
                    {Math.round(
                      scannedProduct.nutrition.fat * PORTION_MULTIPLIERS[selectedQuantity]
                    )}
                    g
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!selectedQuantity}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Confirmar Refeição
          </button>
        </>
      )}
    </div>
  );
}

function QuantityButton({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
        active
          ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className={`text-2xl font-bold ${active ? "text-blue-600" : "text-slate-700"}`}>
        {label}
      </span>
      <span className={`text-xs mt-1 ${active ? "text-blue-600" : "text-slate-500"}`}>
        {description}
      </span>
    </button>
  );
}
