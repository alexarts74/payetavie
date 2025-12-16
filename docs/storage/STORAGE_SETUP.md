# Configuration Supabase Storage pour les Documents

## 📋 Étapes de configuration

### 1. Créer le bucket "Documents" dans Supabase Storage

1. Allez dans votre projet Supabase
2. Ouvrez **Storage** dans le menu de gauche
3. Cliquez sur **New bucket**
4. Nommez-le `Documents` (avec majuscule)
5. **IMPORTANT** : Cochez **Public bucket** (pour permettre le téléchargement des fichiers)
6. Cliquez sur **Create bucket**

### 2. Configurer les politiques de sécurité du bucket

1. Allez dans **Storage** > Cliquez sur le bucket `documents`
2. Allez dans l'onglet **Policies**
3. Cliquez sur **New Policy**
4. Créez les politiques suivantes :

#### Politique SELECT (lecture) - Permet de lire ses propres fichiers
```sql
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'Documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Politique INSERT (upload) - Permet d'uploader ses propres fichiers
```sql
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Politique DELETE (suppression) - Permet de supprimer ses propres fichiers
```sql
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'Documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Structure des fichiers

Les fichiers sont organisés ainsi :
```
documents/
  └── {user_id}/
      └── {topic_slug}/
          └── {timestamp}.{extension}
```

Exemple : `documents/abc123/impots/1701234567890.pdf`

### 4. Vérification rapide

Pour vérifier que le bucket existe :
1. Allez dans **Storage** > Vous devriez voir le bucket `Documents` dans la liste
2. Si vous ne le voyez pas, créez-le avec les étapes ci-dessus

### 5. Test

Après configuration, testez l'upload d'un document sur la page `/topics/impots` pour vérifier que tout fonctionne.

## 🔒 Sécurité

- Chaque utilisateur ne peut accéder qu'à ses propres documents
- Les fichiers sont organisés par utilisateur et par topic
- Les politiques RLS garantissent l'isolation des données
- Le bucket est public mais les politiques limitent l'accès aux fichiers de l'utilisateur

## ⚠️ Erreurs courantes

- **"Bucket not found"** → Le bucket `Documents` n'existe pas, créez-le
- **"new row violates row-level security policy"** → Les politiques RLS ne sont pas configurées correctement
- **"Access denied"** → Vérifiez que le bucket est public ET que les politiques sont créées
