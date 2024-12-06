"use client";

import { useTheme } from "next-themes";

export function RouLogo() {
  const { theme } = useTheme();

  return (
    <img
      src={theme === "dark" ? "/rou-logo-d.jpg" : "/rou-logo-l.jpg"}
      alt="Rou Logo"
      className="w-full h-full "
    />
  );
}
