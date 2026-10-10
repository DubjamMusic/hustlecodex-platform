import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// TelemetryOrb action-figure wave 20261010: density pulse stub for prestige tracking
interface DataStreak {
  id: number;
  left: string;
  duration: string;
  delay: string;
}

export interface GoldenGlobeRef {
  createPulseStreaks: () => void;
  getNodeStats: () => { nodes: number; latency: number };
}

const GoldenGlobe = forwardRef<GoldenGlobeRef>((props, ref) => {
  const [nodes, setNodes] = useState(247);
  const [latency, setLatency] = useState(23);
  const [dataStreaks, setDataStreaks] = useState<DataStreak[]>([]);
  const globeRef = useRef<HTMLDivElement>(null);
  const streakIdRef = useRef(0);

  // Ambient animation on mount
  useEffect(() => {
    const interval = setInterval(() => {
      addAmbientStreak();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addAmbientStreak = () => {
    const newStreak: DataStreak = {
      id: streakIdRef.current++,
      left: Math.random() * 100 + '%',
      duration: (Math.random() * 2 + 1) + 's',
      delay: '0s',
    };

    setDataStreaks((prev) => [...prev, newStreak]);

    // Remove streak after animation completes
    setTimeout(() => {
      setDataStreaks((prev) => prev.filter((s) => s.id !== newStreak.id));
    }, 3000);
  };

  const createPulseStreaks = () => {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const newStreak: DataStreak = {
          id: streakIdRef.current++,
          left: Math.random() * 100 + '%',
          duration: (Math.random() * 1 + 0.5) + 's',
          delay: (Math.random() * 0.5) + 's',
        };

        setDataStreaks((prev) => [...prev, newStreak]);

        // Remove streak after animation completes
        setTimeout(() => {
          setDataStreaks((prev) => prev.filter((s) => s.id !== newStreak.id));
        }, 2500);
      }, i * 80);
    }

    // Update node count with realistic fluctuation
    setTimeout(() => {
      setNodes(247 + Math.floor(Math.random() * 20));
      setLatency(20 + Math.floor(Math.random() * 15));
    }, 1000);
  };

  const getNodeStats = () => {
    return { nodes, latency };
  };

  useImperativeHandle(ref, () => ({
    createPulseStreaks,
    getNodeStats,
  }));

  return (
    <div className="relative bg-[radial-gradient(circle,#1a1a1a_0%,#000_100%)] flex justify-center items-center overflow-hidden">
      {/* Central Orb */}
      <div
        ref={globeRef}
        className="relative w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full flex justify-center items-center overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #1a1a1a, #000)',
          boxShadow: `
            0 0 100px rgba(212, 175, 55, 0.3),
            inset 0 0 50px rgba(212, 175, 55, 0.2),
            inset -20px -20px 40px rgba(0,0,0,0.8)
          `,
          border: '2px solid var(--gold)',
        }}
      >
        <div className="text-gold text-center z-[2] relative">
          <h1 className="m-0 text-2xl md:text-4xl font-cinzel">GOLDEN GLOBE</h1>
          <p className="text-[0.6rem] opacity-60 mt-2 mb-0 font-mono">
            RUST_WASM_ENGINE_ACTIVE
          </p>
          <p className="text-[0.5rem] opacity-40 mt-1 mb-0">
            NODES: {nodes} | LATENCY: {latency}ms | DENSITY: pulse
          </p>
        </div>
      </div>

      {/* Data Streaks */}
      {dataStreaks.map((streak) => (
        <div
          key={streak.id}
          className="absolute w-0.5 h-[100px] pointer-events-none"
          style={{
            left: streak.left,
            background: 'linear-gradient(to bottom, transparent, var(--gold))',
            filter: 'blur(1px)',
            animation: `fall ${streak.duration} linear`,
            animationDelay: streak.delay,
          }}
        />
      ))}
    </div>
  );
});

GoldenGlobe.displayName = 'GoldenGlobe';

export default GoldenGlobe;
