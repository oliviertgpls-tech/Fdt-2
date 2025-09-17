import React from 'react';

// Types pour les versions d'images
type ImageVersions = {
  thumbnail: string;
  medium: string;
  large: string;
}

// Tailles possibles avec leurs cas d'usage
type ImageSize = 'thumbnail' | 'medium' | 'large';

interface OptimizedImageProps {
  src: string | ImageVersions; // Peut être une URL simple ou un objet avec versions
  alt: string;
  size: ImageSize;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
}

/**
 * 🎯 Composant OptimizedImage
 * 
 * Usage:
 * - thumbnail: listes, vignettes, avatars (200px)
 * - medium: cartes, aperçus, galeries (800px)  
 * - large: affichage plein, détails (2400px)
 * 
 * Exemples:
 * <OptimizedImage src={recipe.imageUrl} alt="Recette" size="medium" />
 * <OptimizedImage src={recipe.imageVersions} alt="Recette" size="thumbnail" />
 */
export function OptimizedImage({ 
  src, 
  alt, 
  size, 
  className = '', 
  loading = 'lazy',
  onClick 
}: OptimizedImageProps) {
  
  // Détermine l'URL à utiliser selon le type de src et la taille demandée
  const getOptimizedUrl = (): string => {
    if (typeof src === 'string') {
      // URL simple (ancien format) - on essaie de l'optimiser via Cloudinary
      return optimizeCloudinaryUrl(src, size);
    } else {
      // Objet avec versions - on prend la bonne taille
      return src[size];
    }
  };

  const imageUrl = getOptimizedUrl();

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading={loading}
      onClick={onClick}
      onError={(e) => {
        // Fallback en cas d'erreur - essaie l'URL originale si disponible
        if (typeof src === 'object' && e.currentTarget.src !== src.large) {
          e.currentTarget.src = src.large;
        }
      }}
    />
  );
}

/**
 * 🔧 Fonction utilitaire pour optimiser les URLs Cloudinary existantes
 * Transforme une URL Cloudinary pour la bonne taille si possible
 */
function optimizeCloudinaryUrl(url: string, size: ImageSize): string {
  if (!url.includes('cloudinary.com')) {
    // Pas une URL Cloudinary, on retourne telle quelle
    return url;
  }

  try {
    // Paramètres selon la taille
    const transformations = {
      thumbnail: 'w_200,h_200,c_fill,q_auto:good,f_auto',
      medium: 'w_800,h_600,c_fill,q_auto:good,f_auto',
      large: 'w_2400,h_1800,c_limit,q_auto:good,f_auto'
    };

    // Si l'URL contient déjà des transformations, on les remplace
    if (url.includes('/image/upload/')) {
      const parts = url.split('/image/upload/');
      const baseUrl = parts[0];
      const pathPart = parts[1];
      
      // Enlève d'éventuelles transformations existantes
      const cleanPath = pathPart.replace(/^[^\/]*\//, '');
      
      return `${baseUrl}/image/upload/${transformations[size]}/${cleanPath}`;
    } else {
      // URL sans transformations, on les ajoute
      return url.replace('/upload/', `/upload/${transformations[size]}/`);
    }
  } catch (error) {
    console.warn('Impossible d\'optimiser l\'URL:', url, error);
    return url;
  }
}

/**
 * 🎨 Hook pour utiliser les bonnes tailles d'images selon le contexte
 */
export function useResponsiveImageSize(context: 'list' | 'card' | 'detail' | 'hero'): ImageSize {
  const sizeMap = {
    list: 'thumbnail' as const,      // Listes de recettes, carnets
    card: 'medium' as const,         // Cartes de recettes
    detail: 'large' as const,        // Page de détail de recette
    hero: 'large' as const           // Images de couverture
  };

  return sizeMap[context];
}
