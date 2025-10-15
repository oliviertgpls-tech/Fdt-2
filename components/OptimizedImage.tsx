import React from 'react';

// Types pour les versions d'images (doit matcher le format de l'API)
type ImageVersions = {
  thumbnail: string;  // 200px
  medium: string;     // 800px
  large: string;      // 2400px
}

// Tailles possibles avec leurs cas d'usage
type ImageSize = 'thumbnail' | 'medium' | 'large';

interface OptimizedImageProps {
  src: string | ImageVersions | null | undefined; // Plus robuste avec null/undefined
  alt: string;
  size: ImageSize;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
}

/**
 * 🎯 Composant OptimizedImage
 * 
 * Utilise automatiquement la bonne taille d'image selon le contexte :
 * 
 * - **thumbnail** (200px) : listes, vignettes, avatars
 * - **medium** (800px) : cartes, aperçus, galeries  
 * - **large** (2400px) : affichage plein écran, détails
 * 
 * Compatible avec :
 * - ✅ Nouveau format (objet avec versions) : `{ thumbnail: "...", medium: "...", large: "..." }`
 * - ✅ Ancien format (URL simple) : `"https://cloudinary.com/..."`
 * 
 * Exemples :
 * ```jsx
 * // Pour une liste de recettes (vignettes rapides)
 * <OptimizedImage src={recipe.imageVersions || recipe.imageUrl} alt="Recette" size="thumbnail" />
 * 
 * // Pour une carte de recette (aperçu de qualité) 
 * <OptimizedImage src={recipe.imageVersions || recipe.imageUrl} alt="Recette" size="medium" />
 * 
 * // Pour la page de détail (haute qualité)
 * <OptimizedImage src={recipe.imageVersions || recipe.imageUrl} alt="Recette" size="large" />
 * ```
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
    const getOptimizedUrl = (): string | null => {
      // Si pas d'image du tout, retourne null (on affichera le placeholder)
      if (!src) {
        return null;
      }

      if (typeof src === 'string') {
        // URL simple (ancien format) - on essaie de l'optimiser via Cloudinary
        return optimizeCloudinaryUrl(src, size);
      } else {
        // Objet avec versions (nouveau format) - on prend la bonne taille
        return src[size] || src.large || src.medium || src.thumbnail;
      }
    };

    const imageUrl = getOptimizedUrl();

    // 🆕 Si pas d'image, afficher placeholder coloré
    if (!imageUrl) {
      return (
        <div className={`flex items-center justify-center bg-accent-200 ${className}`}>
          <svg 
            className="w-1/3 h-1/3 text-accent-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        loading={loading}
        onClick={onClick}
        onError={(e) => {
          // Fallback en cas d'erreur - masque l'image
          e.currentTarget.style.display = 'none';
          // Tu pourrais aussi remplacer par le placeholder ici
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
