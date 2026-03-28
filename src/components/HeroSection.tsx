import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, BrainCircuit, ShieldAlert, Sparkles, Scale, Cpu } from 'lucide-react';
import React, { useEffect, MouseEvent } from 'react';
import { Link } from 'react-router-dom';

// ── 1. The 3D Rotating Text Ring (SVG) ─────────────────
const TextRing = ({ size, duration, direction, text, opacity, color }: any) => {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        marginLeft: -size / 2, marginTop: -size / 2,
        opacity,
      }}
      animate={{ rotateZ: direction === 1 ? [0, 360] : [360, 0] }}
      transition={{ ease: "linear", duration, repeat: Infinity }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <path
          id={`ring-path-${size}`}
          d={`M ${size/2}, ${size/2} m -${size/2 - 20}, 0 a ${size/2 - 20},${size/2 - 20} 0 1,1 ${size - 40},0 a ${size/2 - 20},${size/2 - 20} 0 1,1 -${size - 40},0`}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="4 8"
          className="opacity-50"
        />
        <text className="text-[10px] font-mono tracking-[0.2em] font-bold" fill={color} style={{ opacity: 0.9 }}>
          <textPath href={`#ring-path-${size}`} startOffset="0%">
            {text.repeat(10)}
          </textPath>
        </text>
      </svg>
    </motion.div>
  );
};

// ── 2. The Holographic AI Core ─────────────────────────
const HolographicCore = ({ mouseX, mouseY }: { mouseX: any, mouseY: any }) => {
  const tiltX = useTransform(mouseY, [0, 1], [60, 80]); // 3D tilt
  const tiltY = useTransform(mouseX, [0, 1], [-15, 15]);

  return (
    <div className="absolute inset-0 flex items-center justify-center isolate pointer-events-none">
      
      {/* Intense Center Glow Orb */}
      <motion.div
        className="absolute z-10 w-[150px] h-[150px] rounded-full mix-blend-screen"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.9) 0%, rgba(59,130,246,0.4) 40%, transparent 70%)',
          boxShadow: '0 0 100px 20px rgba(139,92,246,0.6), 0 0 200px 40px rgba(59,130,246,0.4)',
        }}
      />

      {/* 3D Ring Structure */}
      <motion.div
        className="absolute z-0 w-full h-full flex items-center justify-center transform-gpu"
        style={{ rotateX: tiltX, rotateY: tiltY, perspective: 1000 }}
      >
        <TextRing size={400} duration={40} direction={1} opacity={1}   color="#93C5FD" text="BNS SECTION 318 · IPC 420 · " />
        <TextRing size={600} duration={60} direction={-1} opacity={0.6} color="#C4B5FD" text="BHARATIYA NYAYA SANHITA 2023 · " />
        <TextRing size={800} duration={90} direction={1} opacity={0.3} color="#60A5FA" text="ANALYZING CORPUS DATA · CONFIDENCE 99.9% · " />
        
        {/* Solid inner rings */}
        <div className="absolute w-[200px] h-[200px] border border-purple-500/50 rounded-full" />
        <div className="absolute w-[280px] h-[280px] border border-blue-500/30 rounded-full" />
      </motion.div>
    </div>
  );
};

// ── 3. Floating Hologram Data Chips ────────────────────
const FloatingChips = ({ mouseX, mouseY }: { mouseX: any, mouseY: any }) => {
  // Parallax offsets
  const x1 = useTransform(mouseX, [0, 1], [30, -30]);
  const y1 = useTransform(mouseY, [0, 1], [30, -30]);
  const x2 = useTransform(mouseX, [0, 1], [-40, 40]);
  const y2 = useTransform(mouseY, [0, 1], [-40, 40]);

  return (
    <>
      <motion.div
        style={{ x: x1, y: y1 }}
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[15%] md:right-[20%] z-20 flex items-center gap-3 px-4 py-2 bg-blue-950/40 border border-blue-400/20 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.15)] pointer-events-none"
      >
        <div className="p-1.5 bg-blue-500/20 rounded-lg"><Cpu className="w-4 h-4 text-blue-400" /></div>
        <div>
          <p className="text-[10px] text-blue-300/70 font-mono tracking-widest uppercase">Engine Status</p>
          <p className="text-[13px] font-bold text-white">Streaming Live</p>
        </div>
      </motion.div>

      <motion.div
        style={{ x: x2, y: y2 }}
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 7, delay: 1, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[25%] left-[10%] md:left-[20%] z-20 flex items-center gap-3 px-4 py-2 bg-purple-950/40 border border-purple-400/20 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.15)] pointer-events-none"
      >
        <div className="p-1.5 bg-purple-500/20 rounded-lg"><Scale className="w-4 h-4 text-purple-400" /></div>
        <div>
          <p className="text-[10px] text-purple-300/70 font-mono tracking-widest uppercase">Accuracy</p>
          <p className="text-[13px] font-bold text-white">99.4% BNS Mapped</p>
        </div>
      </motion.div>
    </>
  );
};

// ── Main Hero Component ────────────────────────────────
const HeroSection = () => {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section
      className="relative min-h-screen bg-[#030712] overflow-hidden flex flex-col justify-center items-center font-sans perspective-1000"
      onMouseMove={handleMouseMove}
      style={{ isolation: 'isolate' }}
    >
      {/* Grid Floor */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
        aria-hidden
      />

      <HolographicCore mouseX={mouseX} mouseY={mouseY} />
      <FloatingChips mouseX={mouseX} mouseY={mouseY} />

      {/* ── Content Front Layer ── */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-10">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-8"
        >
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span className="text-[12px] font-medium tracking-wide text-white/80">Lumina Intelligence Core v3.0</span>
        </motion.div>

        {/* Massive Cinematic Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl sm:text-7xl md:text-[90px] font-extrabold tracking-tighter leading-[0.95] mb-6 drop-shadow-2xl"
          style={{ letterSpacing: '-0.04em' }}
        >
          <span className="text-white block">Unleash</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Legal Supremacy
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl font-light leading-relaxed mb-12 drop-shadow-lg"
        >
          Tap into the most powerful BNS-mapped intelligence engine ever built. Real-time statute matching, instant FIR generation, and relentless accuracy.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-5"
        >
          <Link
            to="/bns-analysis"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-[15px] font-bold text-white overflow-hidden"
          >
            {/* Liquid button background */}
            <div className="absolute inset-0 bg-blue-600 transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
            
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-200" />
              Engage AI Core
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </span>
            {/* Box shadow glow */}
            <div className="absolute inset-0 rounded-xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.8)] opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            to="/dashboard"
            className="px-8 py-4 rounded-xl text-[15px] font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] border border-white/10 transition-all"
          >
            Enter Dashboard
          </Link>
        </motion.div>
      </div>

      {/* Gradual fade to dark at the bottom for smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030712] to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default HeroSection;
