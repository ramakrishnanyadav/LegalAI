import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Target, ShieldAlert, Cpu, Fingerprint, LockKeyhole, ArrowRight, Zap, Grip } from 'lucide-react';
import { useRef, useState } from 'react';

const timelineSteps = [
  {
    icon: Target,
    title: 'INCIDENT INFILTRATION',
    description: 'Raw event data ingestion and formal complaint filing',
    duration: 'T+24H',
    status: 'completed' as const,
    details: 'Initial system login. Officers authenticate and record user claims, generating a locked FIR data block on the primary ledger.',
  },
  {
    icon: Fingerprint,
    title: 'FORENSIC SCAN',
    description: 'Algorithmic evidence extraction and scene analysis',
    duration: 'T+30D',
    status: 'current' as const,
    details: 'Investigative operatives cross-reference physical and digital footprints, decrypting witness testimonials to forge an impenetrable case diary.',
  },
  {
    icon: LockKeyhole,
    title: 'CHARGE COMPILATION',
    description: 'Data locked. Formal BNS/IPC charges synthesized.',
    duration: 'T+90D',
    status: 'pending' as const,
    details: 'The central authority submits an encrypted charge sheet to the judiciary matrix, binding evidence to statutory violations.',
  },
  {
    icon: Cpu,
    title: 'TRIAL EXECUTION',
    description: 'Cross-examination algorithms and courtroom deployment',
    duration: 'T+1YR',
    status: 'pending' as const,
    details: 'Live processing phase. Prosecutorial and defense nodes engage in high-frequency argument loops to establish or dismantle reasonable doubt.',
  },
  {
    icon: ShieldAlert,
    title: 'FINAL DECRYPTION',
    description: 'Verdict transmission and absolute resolution',
    duration: 'T+END',
    status: 'pending' as const,
    details: 'The presiding node issues an unalterable judgment hash. Appellate protocols remain on standby for 90 cycles following decryption.',
  },
];

const springConfig = { damping: 20, stiffness: 300 };

const TimelineNode = ({ 
  step, 
  index, 
  isEven 
}: { 
  step: typeof timelineSteps[0]; 
  index: number; 
  isEven: boolean;
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);
  
  const isCompleted = step.status === 'completed';
  const isCurrent = step.status === 'current';

  return (
    <motion.div
      ref={nodeRef}
      className={`relative flex items-center mb-16 last:mb-0 ${
        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', ...springConfig, delay: index * 0.15 }}
    >
      {/* Duration - Left side on desktop */}
      <div className={`hidden md:flex md:w-1/2 ${isEven ? 'justify-end pr-10' : 'justify-start pl-10'}`}>
        {isEven && (
          <motion.div
            className="flex items-center gap-3 bg-[#0A0F1C]/80 px-4 py-2 rounded-md border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: index * 0.15 + 0.3 }}
          >
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-mono text-blue-400 tracking-widest">{step.duration}</span>
          </motion.div>
        )}
        {!isEven && (
          <motion.div
            className="bg-[#03060D]/90 backdrop-blur-xl rounded-none border-l-2 border-purple-500/50 p-6 max-w-md shadow-[0_0_30px_rgba(139,92,246,0.05)] border-y border-r border-[#1e293b]/50"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ type: 'spring', ...springConfig, delay: index * 0.15 + 0.2 }}
            whileHover={{ x: 5 }}
          >
            <h3 className="text-lg font-mono font-bold tracking-widest text-[#E2E8F0] mb-2 flex items-center gap-2">
              <span className="text-purple-400">[{index + 1}]</span> {step.title}
            </h3>
            <p className="text-blue-200/40 text-[13px] font-mono leading-relaxed">{step.description}</p>
          </motion.div>
        )}
      </div>

      {/* Center node with connecting beam */}
      <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 z-10 flex flex-col items-center">
        {/* Animated laser beam */}
        {index < timelineSteps.length - 1 && (
          <motion.div
            className="absolute top-14 w-0.5 h-20 origin-top"
            style={{
              background: isCompleted 
                ? 'linear-gradient(180deg, rgba(59,130,246,0.8), rgba(59,130,246,0.2))'
                : isCurrent
                ? 'linear-gradient(180deg, rgba(139,92,246,0.8), rgba(139,92,246,0.2))'
                : 'linear-gradient(180deg, rgba(255,255,255,0.1), transparent)',
              boxShadow: isCompleted || isCurrent ? '0 0 10px rgba(59,130,246,0.5)' : 'none'
            }}
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.8, delay: index * 0.15 + 0.4 }}
          />
        )}

        {/* Node Hexagon/Circle */}
        <motion.div
          className="relative cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', ...springConfig }}
        >
          <motion.div
            className={`w-12 h-12 flex items-center justify-center relative overflow-hidden rounded-md border text-white ${
              isCompleted
                ? 'bg-[#0F172A] border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                : isCurrent
                ? 'bg-[#1E1B4B] border-purple-500/60 shadow-[0_0_20px_rgba(139,92,246,0.6)]'
                : 'bg-[#03060D] border-white/10'
            }`}
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            initial={{ scale: 0, rotate: -90 }}
            animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
            transition={{ type: 'spring', ...springConfig, delay: index * 0.15 }}
          >
            {/* Inner pulse */}
            {isCurrent && (
              <motion.div
                className="absolute inset-0 bg-purple-500/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            
            <step.icon className={`w-5 h-5 relative z-10 ${isCompleted ? 'text-blue-400' : isCurrent ? 'text-purple-400' : 'text-white/20'}`} />
          </motion.div>

          {/* Glitch Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute left-[130%] top-1/2 -translate-y-1/2 w-64 pointer-events-none z-50 hidden md:block" // hidden on mobile to avoid offscreen
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-[#03060D]/95 border border-blue-500/30 p-4 font-mono text-xs text-blue-100/70 shadow-2xl relative">
                  <div className="absolute top-0 left-0 w-2 h-[1px] bg-blue-500" />
                  <div className="absolute top-0 left-0 w-[1px] h-2 bg-blue-500" />
                  {step.details}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Content - Right side on desktop */}
      <div className={`ml-20 md:ml-0 md:w-1/2 ${isEven ? 'md:pl-10' : 'md:pr-10 md:text-right flex md:justify-end'}`}>
        {isEven && (
          <motion.div
            className="bg-[#03060D]/90 backdrop-blur-xl rounded-none border-l-2 border-blue-500/50 p-6 max-w-md shadow-[0_0_30px_rgba(59,130,246,0.05)] border-y border-r border-[#1e293b]/50"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ type: 'spring', ...springConfig, delay: index * 0.15 + 0.2 }}
            whileHover={{ x: 5 }}
          >
            <h3 className="text-lg font-mono font-bold tracking-widest text-[#E2E8F0] mb-2 flex items-center gap-2">
              <span className="text-blue-400">[{index + 1}]</span> {step.title}
            </h3>
            <p className="text-blue-200/40 text-[13px] font-mono leading-relaxed">{step.description}</p>
          </motion.div>
        )}
        {!isEven && (
          <motion.div
            className="flex items-center gap-3 bg-[#0A0F1C]/80 px-4 py-2 rounded-md border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ delay: index * 0.15 + 0.3 }}
          >
            <span className="text-sm font-mono text-purple-400 tracking-widest">{step.duration}</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </motion.div>
        )}
      </div>

      {/* Mobile: Show all content on right */}
      <div className="md:hidden ml-20 w-full">
        <motion.div
          className="bg-[#03060D]/90 border border-white/10 p-5 w-full flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ type: 'spring', ...springConfig, delay: index * 0.15 + 0.2 }}
        >
          <div className="flex items-center gap-2 text-xs mb-2">
            <Zap className={`w-3 h-3 ${isCompleted ? 'text-blue-400' : 'text-purple-400'}`} />
            <span className={`font-mono tracking-widest ${isCompleted ? 'text-blue-400' : 'text-purple-400'}`}>{step.duration}</span>
          </div>
          <h3 className="text-sm font-mono font-bold mb-1 tracking-widest uppercase">
            {step.title}
          </h3>
          <p className="text-white/40 text-xs font-mono">{step.description}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ProceduralTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const lineHeight = useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"]);

  return (
    <section className="py-32 px-4 relative overflow-hidden bg-[#030712]" ref={containerRef}>
      {/* Heavy CRT/Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', ...springConfig }}
          className="text-center mb-24"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400 tracking-widest uppercase mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Grip className="w-3 h-3" />
            System Pipeline
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-[60px] font-black uppercase tracking-tighter mb-6 text-white leading-none">
            Judicial <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Data Flow</span>
          </h2>
          <p className="text-blue-100/30 font-mono text-xs md:text-sm tracking-widest max-w-2xl mx-auto uppercase">
            Trajectory of raw case data through the federal justice mainframe
          </p>
        </motion.div>

        <div className="relative">
          {/* Main vertical data trunk */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 md:-translate-x-1/2 w-[1px]">
            {/* Background track */}
            <div className="absolute inset-0 bg-white/5" />
            
            {/* Animated power laser */}
            <motion.div
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Timeline nodes */}
          {timelineSteps.map((step, index) => (
            <TimelineNode 
              key={step.title} 
              step={step} 
              index={index} 
              isEven={index % 2 === 0}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', ...springConfig, delay: 0.5 }}
        >
          <motion.button
            className="group relative inline-flex items-center gap-3 px-8 py-3 bg-[#0A0F1C] border border-blue-500/40 text-blue-400 font-mono text-sm uppercase tracking-widest overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-blue-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            Extract Full Protocol
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProceduralTimeline;
