/** @type {import('next').NextConfig} */
import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public", // Répertoire pour les fichiers PWA
  register: true, // Enregistre automatiquement le service worker
  skipWaiting: true, // Le service worker remplace immédiatement l'ancien
  disable: process.env.NODE_ENV === "development", // Désactiver PWA en mode développement
});

const nextConfig = {
  reactStrictMode: true, // Activer React Strict Mode
};

export default withPWA(nextConfig);
