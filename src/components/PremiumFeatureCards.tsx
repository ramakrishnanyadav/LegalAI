import { TrendingUp, Clock, DollarSign, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const PremiumFeatureCards = ({ actionPlan }: { actionPlan: any }) => {
  const vp = actionPlan?.victoryPrediction;
  const de = actionPlan?.durationEstimate;
  const dc = actionPlan?.detailedCosts;

  if (!vp && !de && !dc) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Victory Prediction Card */}
      {vp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border-2 border-green-500/50 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent backdrop-blur-sm group hover:border-green-500 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-foreground">Victory Prediction</h3>
              <Sparkles className="w-4 h-4 text-green-400 ml-auto" />
            </div>
            <div className="text-7xl font-black bg-gradient-to-br from-green-400 to-green-600 bg-clip-text text-transparent mb-3">
              {vp.victoryChance}%
            </div>
            <div className="text-base font-semibold text-green-400 mb-2">{vp.verdict}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{vp.reasoning?.substring(0, 100)}...</p>
          </div>
        </motion.div>
      )}
      
      {/* Duration Estimate Card */}
      {de && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent backdrop-blur-sm group hover:border-purple-500 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-foreground">Case Duration</h3>
              <Sparkles className="w-4 h-4 text-purple-400 ml-auto" />
            </div>
            <div className="text-6xl font-black bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent mb-3">
              {de.totalDuration?.average}
            </div>
            <div className="text-sm text-purple-400 font-semibold mb-2">
              Range: {de.totalDuration?.minimum} - {de.totalDuration?.maximum}
            </div>
            <p className="text-xs text-muted-foreground">Estimated timeline from filing to resolution</p>
          </div>
        </motion.div>
      )}
      
      {/* Cost Estimate Card */}
      {dc && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent backdrop-blur-sm group hover:border-emerald-500 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-foreground">Estimated Cost</h3>
              <Sparkles className="w-4 h-4 text-emerald-400 ml-auto" />
            </div>
            <div className="text-6xl font-black bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-3">
              {dc.summary?.averageCost}
            </div>
            <div className="text-sm text-emerald-400 font-semibold mb-2">
              Range: {dc.summary?.minimumCost} - {dc.summary?.maximumCost}
            </div>
            <p className="text-xs text-muted-foreground">Total legal fees and court expenses</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
