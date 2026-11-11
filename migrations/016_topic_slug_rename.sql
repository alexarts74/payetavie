-- Migration 016: Fusionner les topics santé (medecin-generaliste, pharmacie, analyses-medicales) → sante
-- Les données existantes sous ces 3 slugs sont remappées vers le nouveau slug unifié

UPDATE documents SET topic_slug = 'sante'
  WHERE topic_slug IN ('medecin-generaliste', 'pharmacie', 'analyses-medicales');

UPDATE reminders SET topic_slug = 'sante'
  WHERE topic_slug IN ('medecin-generaliste', 'pharmacie', 'analyses-medicales');

UPDATE checklist_progress SET topic_slug = 'sante'
  WHERE topic_slug IN ('medecin-generaliste', 'pharmacie', 'analyses-medicales');
