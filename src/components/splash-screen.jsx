"use client";

import React, { useEffect } from "react";
import { RouLogo } from "./rou-logo";

export function SplashScreen({ finishLoading }) {
  // Déclencher finishLoading après le délai d'animation
  useEffect(() => {
    const timer = setTimeout(() => {
      finishLoading();
    }, 3000); // 3 secondes
    return () => clearTimeout(timer);
  }, [finishLoading]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background animate-fadeOut">
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600  animate-scaleIn">
          <RouLogo />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent animate-slideUp">
            Rou Assistant
          </h1>

          <p className="text-muted-foreground text-sm max-w-sm text-center animate-slideUpDelayed">
            Votre assistant IA personnel, prêt à vous aider dans vos tâches
            quotidiennes
          </p>
        </div>

        <div className="mt-8">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
