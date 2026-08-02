"use client";

import React from "react";

export function ConnectionNetwork() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <svg
        className="w-full h-full object-cover opacity-65 dark:opacity-40 transition-opacity"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle line gradients */}
          <linearGradient id="net-blue-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="net-cyan-blue" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="net-fade-inward" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.08" />
          </linearGradient>

          {/* Node glow filter */}
          <filter id="glow-node" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Connecting Lines Converging Toward Hero Area ── */}
        <g strokeWidth="1.2" strokeDasharray="3 3" className="opacity-70">
          {/* Left Wing -> Center Convergence */}
          <line x1="80" y1="220" x2="220" y2="280" stroke="url(#net-blue-cyan)" />
          <line x1="220" y1="280" x2="380" y2="220" stroke="url(#net-blue-cyan)" />
          <line x1="220" y1="280" x2="340" y2="400" stroke="url(#net-blue-cyan)" />
          <line x1="380" y1="220" x2="520" y2="300" stroke="url(#net-blue-cyan)" />
          <line x1="340" y1="400" x2="520" y2="300" stroke="url(#net-blue-cyan)" />
          <line x1="140" y1="480" x2="340" y2="400" stroke="url(#net-blue-cyan)" />
          <line x1="340" y1="400" x2="480" y2="520" stroke="url(#net-blue-cyan)" />
          <line x1="520" y1="300" x2="680" y2="360" stroke="url(#net-fade-inward)" />

          {/* Right Wing -> Center Convergence */}
          <line x1="1360" y1="200" x2="1220" y2="270" stroke="url(#net-cyan-blue)" />
          <line x1="1220" y1="270" x2="1080" y2="210" stroke="url(#net-cyan-blue)" />
          <line x1="1220" y1="270" x2="1120" y2="410" stroke="url(#net-cyan-blue)" />
          <line x1="1080" y1="210" x2="940" y2="290" stroke="url(#net-cyan-blue)" />
          <line x1="1120" y1="410" x2="940" y2="290" stroke="url(#net-cyan-blue)" />
          <line x1="1300" y1="490" x2="1120" y2="410" stroke="url(#net-cyan-blue)" />
          <line x1="1120" y1="410" x2="980" y2="530" stroke="url(#net-cyan-blue)" />
          <line x1="940" y1="290" x2="760" y2="360" stroke="url(#net-fade-inward)" />

          {/* Central Bridge / Collaboration Nexus */}
          <line x1="680" y1="360" x2="760" y2="360" stroke="url(#net-fade-inward)" strokeWidth="1.5" strokeDasharray="none" />
          <line x1="520" y1="300" x2="760" y2="360" stroke="url(#net-fade-inward)" />
          <line x1="940" y1="290" x2="680" y2="360" stroke="url(#net-fade-inward)" />
          <line x1="480" y1="520" x2="680" y2="360" stroke="url(#net-fade-inward)" />
          <line x1="980" y1="530" x2="760" y2="360" stroke="url(#net-fade-inward)" />
        </g>

        {/* ── Pulsing Connection Nodes ── */}
        {/* Left Nodes */}
        <g>
          <circle cx="80" cy="220" r="3" fill="#38BDF8" />
          <circle cx="220" cy="280" r="4" fill="#2563EB" />
          <circle cx="220" cy="280" r="8" fill="#2563EB" opacity="0.25" className="animate-pulse-subtle" />
          <circle cx="380" cy="220" r="3.5" fill="#06B6D4" />
          <circle cx="340" cy="400" r="4" fill="#2563EB" />
          <circle cx="140" cy="480" r="3" fill="#38BDF8" />
          <circle cx="480" cy="520" r="3.5" fill="#38BDF8" />
        </g>

        {/* Central Convergence Hubs */}
        <g filter="url(#glow-node)">
          <circle cx="520" cy="300" r="4.5" fill="#2563EB" />
          <circle cx="520" cy="300" r="10" fill="#2563EB" opacity="0.2" className="animate-pulse-subtle" />

          <circle cx="680" cy="360" r="5" fill="#0284C7" />
          <circle cx="680" cy="360" r="12" fill="#38BDF8" opacity="0.3" className="animate-pulse-subtle" />

          <circle cx="760" cy="360" r="5" fill="#0284C7" />
          <circle cx="760" cy="360" r="12" fill="#38BDF8" opacity="0.3" className="animate-pulse-subtle" />

          <circle cx="940" cy="290" r="4.5" fill="#2563EB" />
          <circle cx="940" cy="290" r="10" fill="#2563EB" opacity="0.2" className="animate-pulse-subtle" />
        </g>

        {/* Right Nodes */}
        <g>
          <circle cx="1360" cy="200" r="3" fill="#38BDF8" />
          <circle cx="1220" cy="270" r="4" fill="#2563EB" />
          <circle cx="1220" cy="270" r="8" fill="#2563EB" opacity="0.25" className="animate-pulse-subtle" />
          <circle cx="1080" cy="210" r="3.5" fill="#06B6D4" />
          <circle cx="1120" cy="410" r="4" fill="#2563EB" />
          <circle cx="1300" cy="490" r="3" fill="#38BDF8" />
          <circle cx="980" cy="530" r="3.5" fill="#38BDF8" />
        </g>
      </svg>
    </div>
  );
}
