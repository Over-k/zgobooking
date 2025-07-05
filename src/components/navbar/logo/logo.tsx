"use client";
import React, { useState, useEffect } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

const Logo = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      color: [
        "bg-primary",
        "bg-secondary",
        "bg-accent",
        "bg-muted",
        "bg-foreground",
        "bg-background",
      ][Math.floor(Math.random() * 6)],
    }));
    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: (particle.y - particle.speed) % 110,
          x: particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.5,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <a
        href=""
        className="flex items-center gap-3 relative z-10 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Magical particle background */}
        <div className="absolute inset-0 -m-4 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={`absolute rounded-full animate-pulse ${particle.color}`}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                filter: "blur(1px)",
                transform: isHovered ? "scale(1.5)" : "scale(1)",
                transition: "transform 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Magical glow effect */}
        <div
          className={`absolute inset-0 -m-2 rounded-full transition-all duration-700 ${
            isHovered
              ? "bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 blur-md scale-110"
              : "bg-gradient-to-r from-muted/10 via-secondary/10 to-accent/10 blur-sm"
          }`}
        />

        {/* Magical text with gradient and animations */}
        <span
          className={`text-lg font-bold tracking-tighter sm:hidden lg:inline-flex relative transition-all duration-500 ${
            isHovered
              ? "bg-gradient-to-r from-primary to-secondary to-accent bg-clip-text text-transparent scale-105"
              : "bg-gradient-to-r from-foreground via-muted to-foreground bg-clip-text text-transparent"
          }`}
        >
          ZgoBook
          {/* Sparkle effects on hover */}
          {isHovered && (
            <>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping" />
              <div
                className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-secondary rounded-full animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              />
            </>
          )}
        </span>

        {/* Magic trail effect */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-1000 ${
            isHovered
              ? "bg-gradient-to-r from-primary/20 via-transparent to-accent/20 scale-150 blur-xl"
              : "opacity-0"
          }`}
        />
      </a>

      {/* Floating magical orbs */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-foreground rounded-full animate-bounce"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + Math.sin(i) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1.5s",
                opacity: 0.8,
                filter: "blur(0.5px)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { Logo };
