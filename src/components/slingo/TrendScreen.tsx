"use client";

import { TrendingUp, Target, Zap, Calendar, Award, Activity } from "lucide-react";

interface TrendScreenProps {
  userProfile?: any;
}

export default function TrendScreen({ userProfile }: TrendScreenProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-inter font-semibold text-slate-800">
          Bússola de Tendência
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Projeção do seu futuro
        </p>
      </div>

      {/* User Profile Summary - Exibir dados do formulário */}
      {userProfile && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Sua Meta</p>
              <h3 className="text-2xl font-bold text-slate-800">{userProfile.peso_desejado} kg</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Peso Atual</p>
              <p className="text-lg font-bold text-blue-600">{userProfile.peso_atual} kg</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Falta Perder</p>
              <p className="text-lg font-bold text-orange-600">
                {(userProfile.peso_atual - userProfile.peso_desejado).toFixed(1)} kg
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Sem dados suficientes */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <Activity className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600">Tendência Atual</p>
            <h3 className="text-2xl font-bold text-slate-800">Aguardando Dados</h3>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Registre suas refeições por pelo menos 7 dias para começar a ver projeções e tendências personalizadas.
        </p>
      </div>

      {/* Projection Timeline - Bloqueado */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 px-1">Projeções</h3>
        
        <ProjectionCard
          icon={Calendar}
          title="Em 7 dias"
          description="Dados insuficientes"
          progress={0}
          color="slate"
          locked={true}
        />

        <ProjectionCard
          icon={Target}
          title="Em 30 dias"
          description="Dados insuficientes"
          progress={0}
          color="slate"
          locked={true}
        />

        <ProjectionCard
          icon={Award}
          title="Meta Final"
          description={userProfile ? `Chegar aos ${userProfile.peso_desejado} kg` : "Configure sua meta primeiro"}
          progress={0}
          color="slate"
          locked={true}
        />
      </div>

      {/* Key Metrics - Zerado */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={Zap}
          label="Velocidade"
          value="--"
          subtitle="por semana"
        />
        <MetricCard
          icon={TrendingUp}
          label="Consistência"
          value="0%"
          subtitle="dos dias"
        />
      </div>

      {/* Insights - Vazio */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 px-1">Insights</h3>
        
        <InsightCard
          type="info"
          title="Comece sua jornada!"
          description="Adicione suas primeiras refeições para começar a receber insights personalizados sobre seu progresso."
        />
      </div>
    </div>
  );
}

function ProjectionCard({
  icon: Icon,
  title,
  description,
  progress,
  color,
  locked = false,
}: {
  icon: any;
  title: string;
  description: string;
  progress: number;
  color: "blue" | "emerald" | "purple" | "slate";
  locked?: boolean;
}) {
  const colorClasses = {
    blue: {
      bg: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/30",
      progress: "bg-blue-500",
    },
    emerald: {
      bg: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/30",
      progress: "bg-emerald-500",
    },
    purple: {
      bg: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-500/30",
      progress: "bg-purple-500",
    },
    slate: {
      bg: "from-slate-300 to-slate-400",
      shadow: "shadow-slate-500/20",
      progress: "bg-slate-400",
    },
  };

  return (
    <div className={`p-4 rounded-2xl bg-white border border-slate-200 ${locked ? 'opacity-60' : 'hover:border-slate-300'} transition-all duration-300`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color].bg} shadow-lg ${colorClasses[color].shadow} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800 mb-1">{title}</h4>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color].progress} rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  icon: any;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-600" />
        <p className="text-xs text-slate-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-1">{value}</p>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-500">{subtitle}</span>
      </div>
    </div>
  );
}

function InsightCard({
  type,
  title,
  description,
}: {
  type: "success" | "warning" | "info";
  title: string;
  description: string;
}) {
  const typeStyles = {
    success: {
      bg: "from-emerald-50 to-emerald-100/50",
      border: "border-emerald-200/60",
      icon: "bg-emerald-500",
      text: "text-emerald-900",
      desc: "text-emerald-700",
    },
    warning: {
      bg: "from-orange-50 to-orange-100/50",
      border: "border-orange-200/60",
      icon: "bg-orange-500",
      text: "text-orange-900",
      desc: "text-orange-700",
    },
    info: {
      bg: "from-blue-50 to-blue-100/50",
      border: "border-blue-200/60",
      icon: "bg-blue-500",
      text: "text-blue-900",
      desc: "text-blue-700",
    },
  };

  const style = typeStyles[type];

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${style.bg} border ${style.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full ${style.icon} mt-1.5 flex-shrink-0`} />
        <div>
          <h4 className={`font-semibold ${style.text} mb-1`}>{title}</h4>
          <p className={`text-sm ${style.desc} leading-relaxed`}>{description}</p>
        </div>
      </div>
    </div>
  );
}
