---
name: safe-commit
description: Use this skill when the user wants to commit and push their changes. Runs code-reviewer and security-analyzer agents before committing. If both pass, commits with a clean conventional message and pushes to the current branch. If issues are found, presents a structured bug report with a fix plan instead. Trigger when user says "commit", "push", "je veux commiter", "safe commit", "/commit".
---

Tu es le workflow de commit sécurisé de PayeTaVie. Ton rôle est d'orchestrer une review complète avant chaque commit, puis de commiter proprement ou de bloquer avec un plan de correction clair.

## Workflow complet

### Etape 1 — Collecte du contexte

Lance ces commandes pour comprendre ce qui va être commité :

```bash
git status
git diff HEAD
git branch --show-current
```

Si aucun changement stagé ni non-stagé : informe l'utilisateur qu'il n'y a rien à commiter et arrête-toi.

### Etape 2 — Lancement des agents en parallèle

Lance les deux agents **en parallèle** (dans le même message, deux appels Agent simultanés) :

**Agent 1 — code-reviewer** avec comme prompt :
> "Review tous les fichiers modifiés depuis le dernier commit. Donne-moi le verdict complet avec les problèmes critiques, majeurs, mineurs, et ton verdict final (Prêt à commiter / Corrections nécessaires)."

**Agent 2 — security-analyzer** avec comme prompt :
> "Analyse la sécurité de tous les fichiers modifiés depuis le dernier commit. Vérifie auth, RLS, Server Actions, Stripe, secrets exposés. Donne ton verdict final (Déployable / Corrections requises avant déploiement)."

### Etape 3 — Evaluation des résultats et attente de validation

**RÈGLE ABSOLUE : ne jamais passer à l'étape suivante sans approbation explicite de l'utilisateur.**

Présente le rapport complet des deux agents, puis **pose exactement cette question et attends la réponse** :

> "Voici le rapport de review. Que veux-tu faire ?"
> - ✅ **Commiter tel quel** — si tout est bon ou si tu acceptes les mineurs
> - 🔧 **Je corrige d'abord** — décris les corrections à faire
> - ❌ **Annuler** — ne rien faire

**Ne pas corriger soi-même les problèmes détectés.** Présente-les, propose un plan de correction, et laisse l'utilisateur décider et appliquer (ou demander explicitement à Claude de le faire).

**Cas A — Les deux agents donnent le feu vert** (aucun problème Critique, verdict positif) :

Informe l'utilisateur et attends son feu vert explicite avant de passer à l'étape 4.

**Cas B — Au moins un agent signale des problèmes Critiques ou Élevés** :

Présente le rapport (étape 6), propose un plan de fix, **attend que l'utilisateur confirme qu'il veut quand même commiter ou qu'il demande les corrections**.

**Cas C — Uniquement des problèmes Mineurs ou suggestions** :

Présente les mineurs et attends la confirmation :
> "Il y a quelques suggestions mineures mais rien de bloquant. Tu veux quand même commiter ?"

### Etape 4 — Mise à jour de ETAT_DU_PROJET.md

Avant de commiter, regarde si le commit introduit une **nouvelle feature** :

- Une nouvelle feature = nouvelle page, nouveau module, nouveau composant fonctionnel majeur, nouvelle route API, nouvelle fonctionnalité visible par l'utilisateur
- **Ne pas toucher au fichier** pour : fix de bug, correction de chemin, refactor, style/CSS, chore, dépendances, mise à jour de config
- Si et seulement si c'est une nouvelle feature : lis `ETAT_DU_PROJET.md`, ajoute la feature dans la section appropriée avec le statut **DONE**, met à jour la date en haut, puis stage le fichier

En cas de doute, ne pas mettre à jour — mieux vaut un fichier stable qu'un fichier pollué par des détails techniques.

### Etape 5 — Commit et push (après approbation)

**RÈGLE ABSOLUE : ne jamais pusher sans approbation explicite de l'utilisateur pour le push.**

1. Stage tous les changements : `git add -A` (sauf `.env*` — vérifie que rien de sensible n'est stagé)
2. Génère un message de commit conventionnel en analysant les changements :
   - `feat:` nouvelle fonctionnalité
   - `fix:` correction de bug
   - `refactor:` refactoring sans changement de comportement
   - `style:` changements CSS/UI uniquement
   - `chore:` configuration, dépendances
   - `docs:` documentation
   - Format : `type(scope): description courte en français`
   - Exemples : `feat(freelance): ajouter la conversion devis→facture`, `fix(auth): corriger la redirection après login`
3. Commite avec ce message (sans Co-Authored-By Claude)
4. **Avant de pusher**, présente le message de commit et demande confirmation :
   > "Commit créé : `<hash>` — `<message>`
   > Je push sur `<branche>` ?"
   > **Attends le oui explicite avant de lancer `git push`.**
5. Push sur la branche courante uniquement après confirmation
6. Confirme à l'utilisateur avec le hash du commit

### Etape 6 — Blocage avec plan de fix (problèmes détectés)

Présente un rapport structuré :

---

## Commit bloqué — Corrections requises

### Problèmes détectés

[Liste tous les problèmes Critiques et Élevés remontés par les agents, avec fichier:ligne]

### Plan de correction

Pour chaque problème, propose une correction concrète et ordonnée :

**Fix 1 — [nom du problème]** (`src/fichier.ts:42`)
- Cause : [explication simple]
- Correction : [ce qu'il faut faire exactement, avec exemple de code si utile]

**Fix 2 — ...**

### Prochaine étape

Une fois les corrections appliquées, relance `/commit` pour re-valider avant de pousser.

---

## Règles importantes

- Ne jamais commiter si un problème **Critique** de sécurité est détecté
- Ne jamais inclure `.env`, `.env.local`, ou tout fichier contenant des secrets dans le commit
- Le message de commit doit être en **français**, concis (max 72 chars pour le titre)
- Toujours push sur la **branche courante** (jamais forcer sur main sans confirmation explicite)
- Si la branche est `main` : avertir l'utilisateur et demander confirmation avant de push
