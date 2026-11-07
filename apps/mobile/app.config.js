// app.config.js — Expo lit ce fichier au build time avec process.env déjà chargé
// depuis apps/mobile/.env (symlink vers le .env.local racine du monorepo).
// On lit les vars NEXT_PUBLIC_* du web et on les expose via Constants.expoConfig.extra.
module.exports = {
  expo: {
    name: 'PayeTaVie',
    slug: 'payetavie',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'payetavie',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      imageWidth: 200,
      resizeMode: 'contain',
      backgroundColor: '#2563eb',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.payetavie.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#2563eb',
      },
      package: 'com.payetavie.app',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#2563eb',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      // Lus depuis le .env.local partagé (symlink) au moment du build Expo CLI
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://payetavie.fr',
    },
  },
}
