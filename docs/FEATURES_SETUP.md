# Configuration des Features - PayeTaVie

Ce document explique comment configurer les features (notes, rappels, favoris) dans Supabase.

## 📋 Étapes de configuration

### 1. Créer les tables dans Supabase

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu du fichier `supabase-schema.sql`
4. Exécutez la requête

Le script va créer :
- ✅ Table `notes` pour les notes personnelles
- ✅ Table `reminders` pour les rappels
- ✅ Table `bookmarks` pour les favoris
- ✅ Les index pour améliorer les performances
- ✅ Les politiques RLS (Row Level Security) pour la sécurité
- ✅ Les triggers pour mettre à jour automatiquement `updated_at`

### 2. Vérifier les politiques RLS

Les politiques RLS sont configurées pour que chaque utilisateur ne puisse voir et modifier que ses propres données :
- Les utilisateurs peuvent voir leurs propres notes/rappels/favoris
- Les utilisateurs peuvent créer leurs propres notes/rappels/favoris
- Les utilisateurs peuvent modifier leurs propres notes/rappels
- Les utilisateurs peuvent supprimer leurs propres notes/rappels/favoris

### 3. Tester les features

Une fois les tables créées, vous pouvez tester les features sur la page `/topics/impots` :
- **Notes personnelles** : Ajoutez, modifiez et supprimez des notes
- **Rappels** : Créez des rappels avec dates d'échéance
- **Favoris** : Ajoutez des ressources aux favoris en cliquant sur l'icône cœur

## 🎨 Features implémentées

### Notes personnelles
- ✅ Créer une note
- ✅ Modifier une note
- ✅ Supprimer une note
- ✅ Affichage avec date de création

### Rappels
- ✅ Créer un rappel avec titre, description et date d'échéance
- ✅ Marquer un rappel comme complété
- ✅ Supprimer un rappel
- ✅ Affichage des rappels en retard (en rouge)
- ✅ Tri par date d'échéance

### Favoris
- ✅ Ajouter une ressource aux favoris
- ✅ Retirer une ressource des favoris
- ✅ Section dédiée pour les favoris
- ✅ Indicateur visuel (cœur rempli) pour les ressources en favoris

## 📝 Notes importantes

- Les données sont stockées par utilisateur et par topic
- Chaque utilisateur a ses propres notes, rappels et favoris
- Les données sont automatiquement filtrées par `user_id` grâce aux politiques RLS
- Les pages sont automatiquement revalidées après chaque action (create/update/delete)

