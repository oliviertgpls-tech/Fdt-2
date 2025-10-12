"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"
import { Camera, PenTool, Edit3, ArrowLeft, Sparkles, Upload, FileText, Tag, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { useToast } from '@/components/Toast';


// 🆕 NOUVEAU TYPE pour les résultats d'upload optimisé
type UploadResult = {
  success: boolean;
  versions: {
    thumbnail: string;  // 200px
    medium: string;     // 800px  
    large: string;      // 2400px
  };
  originalUrl: string;
  message: string;
}

// Service IA OpenAI avec debug
class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    console.log('🔑 OpenAI Key disponible:', this.apiKey ? 'OUI' : 'NON');
    console.log('🔑 Début de la clé:', this.apiKey ? this.apiKey.substring(0, 7) + '...' : 'MANQUANTE');
  }

  async analyzePhotoToRecipe(imageFile: File, firstName: string): Promise<{
    title: string;
    author: string;
    prepMinutes: number;
    servings: string;
    ingredients: string[];
    steps: string;
    confidence: number;
  }> {
    console.log('🚀 Début analyse photo...');
    
    if (!this.apiKey) {
      console.error('❌ Clé OpenAI manquante');
      throw new Error('Clé OpenAI manquante dans les variables d\'environnement');
    }

    if (!this.apiKey.startsWith('sk-')) {
      console.error('❌ Format de clé OpenAI invalide');
      throw new Error('Format de clé OpenAI invalide (doit commencer par sk-)');
    }

    try {
      console.log('📸 Conversion de l\'image en base64...');
      const base64Image = await this.fileToBase64(imageFile);
      console.log('✅ Image convertie, taille:', base64Image.length, 'caractères');
      
      console.log('🌐 Appel API OpenAI...');
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analysez cette photo de plat et créez une recette complète au format JSON.

INSTRUCTIONS :
- Identifiez le plat principal visible
- Estimez les ingrédients probables
- Proposez une méthode de préparation réaliste
- Donnez un niveau de confiance (0-100)

FORMAT DE RÉPONSE (JSON uniquement) :
{
  "title": "Nom du plat",
  "author": "${firstName}",
  "prepMinutes": 30,
  "servings": "4",
  "ingredients": ["ingrédient 1", "ingrédient 2"],
  "steps": "Étape 1...\\n\\nÉtape 2...",
  "confidence": 85
}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      console.log('📡 Réponse API reçue, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API OpenAI:', response.status, errorText);
        throw new Error(`Erreur API OpenAI: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Données reçues:', data);
      
      const content = data.choices[0]?.message?.content;
      console.log('📝 Contenu de la réponse:', content);
      
      if (!content) {
        throw new Error('Pas de réponse de l\'IA');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ Pas de JSON trouvé dans:', content);
        throw new Error('Format de réponse invalide - pas de JSON détecté');
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log('🎉 Analyse terminée avec succès:', result);
      return result;
      
    } catch (error) {
      console.error('💥 Erreur complète:', error);
      throw error;
    }
  }

async analyzeManuscriptToRecipe(imageFile: File, firstName: string): Promise<{   
    title: string;
    author: string;
    prepMinutes: number;
    servings: string;
    ingredients: string[];
    steps: string;
    confidence: number;
  }> {
    console.log('🚀 Début analyse manuscrit...');
    
    if (!this.apiKey) {
      throw new Error('Clé OpenAI manquante');
    }

    try {
      const base64Image = await this.fileToBase64(imageFile);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Lisez cette recette manuscrite et structurez-la au format JSON.

INSTRUCTIONS :
- Lisez tout le texte visible (titre, ingrédients, étapes)
- Extrayez et structurez les informations
- Corrigez l'orthographe si nécessaire
- Estimez temps et portions si non mentionnés

FORMAT DE RÉPONSE (JSON uniquement) :
{
  "title": "Titre de la recette",
  "author": "${firstName}",
  "prepMinutes": 30,
  "servings": "4",
  "ingredients": ["ingrédient 1", "ingrédient 2"],
  "steps": "Étape 1...\\n\\nÉtape 2...",
  "confidence": 90
}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          max_tokens: 1200,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API OpenAI OCR:', response.status, errorText);
        throw new Error(`Erreur API OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Pas de réponse de l\'IA');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format de réponse invalide');
      }

      return JSON.parse(jsonMatch[0]);
      
    } catch (error) {
      console.error('Erreur analyse manuscrit:', error);
      throw error;
    }
  }

 // NOUVELLE VERSION (avec import dynamique)
private async fileToBase64(file: File): Promise<string> {
  // 🔄 Conversion HEIC → JPEG si nécessaire
  let processedFile = file;
  
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    console.log('🔄 Conversion HEIC → JPEG en cours...');
    try {
      // ✨ IMPORT DYNAMIQUE : charge la librairie uniquement ici, côté client
      const heic2any = (await import('heic2any')).default;
      
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      });
      
      // heic2any peut retourner un tableau de Blobs, on prend le premier
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      
      processedFile = new File(
        [blob], 
        file.name.replace(/\.heic$/i, '.jpg'),
        { type: 'image/jpeg' }
      );
      console.log('✅ Conversion HEIC réussie');
    } catch (error) {
      console.error('❌ Erreur conversion HEIC:', error);
      // On continue avec le fichier original en cas d'échec
    }
  }
  
  // 📤 Conversion en base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(processedFile);
  });
}
  }

// Composant pour recherche d'images Unsplash simplifié
function ImageSearch({ onImageSelect, initialQuery = "" }: {
  onImageSelect: (imageUrl: string) => void;
  initialQuery?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  const searchImages = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      if (!unsplashKey) {
        throw new Error('Clé Unsplash manquante');
      }

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${unsplashKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche d\'images');
      }
      
      const data = await response.json();
      setImages(data.results || []);
      
      if (data.results?.length === 0) {
        setError("Aucune image trouvée. Essayez d'autres mots-clés.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la recherche.");
      console.error('Erreur Unsplash:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages(query);
  };

  const handleImageSelect = (image: any) => {
    onImageSelect(image.urls.regular);
    setIsOpen(false);
    setQuery("");
    setImages([]);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <ImageIcon className="w-4 h-4" />
        Ou choisir une image libre de droits
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
        
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              🖼️ Bibliothèque Unsplash. (Libre de droits)
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Essayez en FR sinon en EN"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "..." : "Chercher"}
            </button>
          </form>

          {!unsplashKey && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ Clé Unsplash manquante - recherche d'images désactivée
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="text-center py-8">
              <p className="text-gray-600">{error}</p>
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  onClick={() => handleImageSelect(image)}
                  className="aspect-[4/3] rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                >
                  <img
                    src={image.urls.small}
                    alt={image.alt_description || "Photo de recette"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const openAIService = new OpenAIService();

export default function AddRecipePage() {
  const { data: session } = useSession() 
  const firstName = session?.user?.name?.split(' ')[0] || 'Utilisateur' 
  const router = useRouter();
  const [mode, setMode] = useState<'choose' | 'manual' | 'photo' | 'scan'| 'link'>('choose');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  // États pour saisie manuelle
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isFromExternalUrl, setIsFromExternalUrl] = useState(false);

  // 🆕 NOUVEL ÉTAT pour les versions optimisées
  const [imageVersions, setImageVersions] = useState<UploadResult['versions'] | null>(null);

  // État pour IA
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [tags, setTags] = useState(""); // 🆕 Tags séparés par virgules
  const [scannedImages, setScannedImages] = useState<File[]>([]); // Liste des photos de texte
  const [currentScanIndex, setCurrentScanIndex] = useState(0); // Index du scan en cours
  const [scanResults, setScanResults] = useState<string[]>([]); // Résultats de chaque scan
  const [dishPhotoUrl, setDishPhotoUrl] = useState(""); // Photo du plat (séparée)

  // Debug des variables d'environnement au chargement
  useState(() => {
    console.log('🔍 Variables d\'environnement:');
    console.log('OpenAI:', process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'PRÉSENTE' : 'MANQUANTE');
    console.log('Unsplash:', process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ? 'PRÉSENTE' : 'MANQUANTE');
  });

const handleImageUpload = async (file: File): Promise<UploadResult | null> => {
  setIsUploading(true);
  
  try {
    console.log('📤 Upload optimisé en cours...', file.name);
    console.log('📦 Taille fichier:', (file.size / 1024 / 1024).toFixed(2), 'Mo');
    console.log('📦 Type fichier:', file.type);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    console.log('📡 Réponse API upload, status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erreur API upload:', errorData);
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }
    
    const result: UploadResult = await response.json();
    console.log('✅ Résultat upload:', result);
    
    if (result.success) {
      // 🆕 Stocker les versions optimisées
      setImageVersions(result.versions);
      // Garder compatibilité avec l'ancien système
      setImageUrl(result.originalUrl);
      
      console.log('✅ Image URL sauvegardée:', result.originalUrl);
      showToast('Photo uploadée avec succès !', 'success');
      return result;
    } else {
      throw new Error(result.message || 'Erreur upload');
    }
    
  } catch (error: any) {
    console.error('💥 Erreur complète dans handleImageUpload:', error);
    showToast(`Erreur upload : ${error.message}`, 'error');
    return null;
  } finally {
    setIsUploading(false);
  }
};

// 🆕 NOUVELLE FONCTION : Traiter plusieurs scans séquentiellement
const handleMultipleScanUpload = async () => {
  if (scannedImages.length === 0) return;
  
  setIsProcessing(true);
  setCurrentScanIndex(0);
  setScanResults([]);
  
  try {
    const allResults: any[] = [];
    
    // Analyser chaque photo séquentiellement
    for (let i = 0; i < scannedImages.length; i++) {
      setCurrentScanIndex(i);
      console.log(`🔍 Analyse de la page ${i + 1}/${scannedImages.length}...`);
      
      const result = await openAIService.analyzeManuscriptToRecipe(scannedImages[i], firstName);
      allResults.push(result);
      
      console.log(`✅ Page ${i + 1} analysée:`, result);
    }
    
    // Combiner les résultats
    const combinedResult = combineMultipleScanResults(allResults);

    // 🧹 DÉDUPLICATION INTELLIGENTE DES INGRÉDIENTS
    let finalIngredients = combinedResult.ingredients || [];
    if (finalIngredients.length > 0) {
      console.log('🔄 Lancement déduplication intelligente...');
      finalIngredients = await openAIService.deduplicateIngredients(finalIngredients);
      console.log('✅ Ingrédients après déduplication:', finalIngredients);
    }
    
    // Pré-remplir le formulaire avec les données combinées
    setTitle(combinedResult.title || '');
    setAuthor(combinedResult.author || '');
    setIngredients(combinedResult.ingredients?.join('\n') || '');
    setSteps(combinedResult.steps || '');
    setPrepMinutes(combinedResult.prepMinutes?.toString() || '');
    setServings(combinedResult.servings || '');
    setTags(combinedResult.tags?.join(', ') || '');
    setAiConfidence(combinedResult.confidence || null);
    
    // Passer en mode manuel pour éditer
    setMode('manual');
    showToast(`✅ ${scannedImages.length} page(s) analysée(s) avec succès !`, 'success');
    
  } catch (error: any) {
    console.error('❌ Erreur analyse multi-scan:', error);
    showToast(`Erreur lors de l'analyse: ${error.message}`, 'error');
  } finally {
    setIsProcessing(false);
    setCurrentScanIndex(0);
  }
};

  // 🆕 FONCTION HELPER : Combiner les résultats de plusieurs scans
  const combineMultipleScanResults = (results: any[]) => {
    if (results.length === 0) return {};
    if (results.length === 1) return results[0];
    
    // Prendre le titre de la première page
    const title = results[0].title || '';
    const author = results[0].author || '';
    
// ⭐ NOUVELLE LOGIQUE : Prioriser les vraies listes d'ingrédients
const allIngredients = new Set<string>();

// D'abord, chercher s'il y a une photo avec une vraie liste officielle
const resultsWithLists = results.filter(r => r.hasIngredientsList === true);

if (resultsWithLists.length > 0) {
  // Si on a trouvé une/des vraie(s) liste(s), prendre UNIQUEMENT celle(s)-ci
  console.log(`✅ ${resultsWithLists.length} photo(s) avec liste officielle trouvée(s)`);
  resultsWithLists.forEach(r => {
    (r.ingredients || []).forEach((ing: string) => allIngredients.add(ing));
  });
} else {
  // Sinon, combiner tous les ingrédients trouvés (ancien comportement)
  console.log('⚠️ Aucune liste officielle trouvée, extraction de tous les ingrédients');
  results.forEach(r => {
    (r.ingredients || []).forEach((ing: string) => allIngredients.add(ing));
  });
}
    
  // Combiner toutes les étapes dans l'ordre (SANS numérotation)
      const allSteps = results
        .map((r: any) => {
          const steps = r.steps || '';
          if (!steps.trim()) return '';
          
          // Retirer les numéros existants si l'IA en a ajouté
          return steps
            .split(/\n\n+/)
            .map((step: string) => step.trim())
            .filter((step: string) => step !== '')
            .map((step: string) => step.replace(/^(Étape\s+)?\d+[\.)]\s*:?\s*/i, ''))
            .join('\n\n');
        })
        .filter((s: string) => s !== '')
        .join('\n\n');
    
    // Combiner tous les tags (dédupliqués)
    const allTags = new Set<string>();
    results.forEach(r => {
      (r.tags || []).forEach((tag: string) => allTags.add(tag));
    });
    
    // Prendre le temps de préparation le plus long
    const maxPrepMinutes = Math.max(
      ...results.map(r => r.prepMinutes || 0)
    );
    
    // Prendre le nombre de portions de la première page
    const servings = results[0].servings || '';
    
    // Calculer la confiance moyenne
    const avgConfidence = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length)
      : 0;
    
    return {
      title,
      author,
      ingredients: Array.from(allIngredients),
      steps: allSteps,
      tags: Array.from(allTags),
      prepMinutes: maxPrepMinutes > 0 ? maxPrepMinutes : undefined,
      servings,
      confidence: avgConfidence
    };
  };

  // 🔄 FONCTION DE SAUVEGARDE MISE À JOUR
  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Le titre est obligatoire', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const recipeData = {
        title: title.trim(),
        author: author.trim() || undefined,
        prepMinutes: prepMinutes ? parseInt(prepMinutes) : undefined,
        servings: servings.trim() || undefined,
        // 🆕 NOUVEAU : stocker les versions optimisées
        imageUrl: imageUrl.trim() || undefined,
        imageVersions: imageVersions || undefined,
        ingredients: ingredients
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== ""),
          tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag !== ""),
        steps: steps.trim(),
        isFromExternalUrl: isFromExternalUrl, // 🆕 MARQUEUR pour recettes externes
        sourceUrl: linkUrl.trim(), // 🆕 Optionnel : garder l'URL source
        updatedAt: Date.now()
      };

      console.log('💾 Sauvegarde avec optimisations:', recipeData);

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
      
      const newRecipe = await response.json();
      console.log('✅ Recette créée avec optimisations:', newRecipe);
      
      // Rediriger vers la liste des recettes
      window.location.href = "/recipes";
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde:', error);
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };

    // 🆕 Fonction d'extraction (ajoutez cette fonction)
  const handleExtractFromUrl = async () => {
    if (!linkUrl.trim()) {
      showToast('Veuillez saisir une URL', 'error');
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch('/api/recipes/extract-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkUrl.trim() })
      });

      const result = await response.json();

      if (result.success && result.recipe) {
        // Pré-remplir le formulaire avec les données extraites
        setTitle(result.recipe.title || '');
        setAuthor(result.recipe.author || '');
        setIngredients(result.recipe.ingredients?.join('\n') || '');
        setSteps(result.recipe.steps || '');
        setImageUrl(result.recipe.image || '');
        setPrepMinutes(result.recipe.prepMinutes?.toString() || '');
        setServings(result.recipe.servings || '');
        setIsFromExternalUrl(true); 
        
        // Passer en mode manuel pour éditer
        setMode('manual');
        showToast(`Recette extraite avec succès depuis l'url!`, 'success');
      } else {
        // Échec - proposer saisie manuelle
        showToast('Impossible d\'extraire automatiquement. Voulez-vous saisir manuellement ?', 'error');
        setMode('manual');
      }
    } catch (error) {
      console.error('Erreur extraction:', error);
      showToast('Erreur lors de l\'extraction. Veuillez réessayer.','error');
    } finally {
      setIsExtracting(false);
    }
  };

 const handlePhotoUpload = async (file: File) => {
  setIsProcessing(true);
  console.log('🎬 Début handlePhotoUpload');
  console.log('📸 Fichier:', file.name, '-', (file.size / 1024 / 1024).toFixed(2), 'Mo');
  
  try {
    // 1️⃣ Analyse IA
    console.log('🤖 Analyse IA en cours...');
    const aiResult = await openAIService.analyzePhotoToRecipe(file, firstName);
    console.log('✅ IA terminée:', aiResult.title);
    
    // 2️⃣ Remplir les champs
    setTitle(aiResult.title);
    setAuthor(aiResult.author);
    setPrepMinutes(aiResult.prepMinutes.toString());
    setServings(aiResult.servings);
    setIngredients(aiResult.ingredients.join('\n'));
    setSteps(aiResult.steps);
    setAiConfidence(aiResult.confidence);
    
    // 3️⃣ Upload de la photo (AVEC VÉRIFICATION DU RÉSULTAT)
    console.log('📤 Upload de la photo en cours...');
    const uploadResult = await handleImageUpload(file);
    
    if (!uploadResult) {
      console.error('❌ Upload a échoué, mais on continue avec les données IA');
      showToast('⚠️ Photo non uploadée, mais recette analysée', 'error');
    } else {
      console.log('✅ Photo uploadée avec succès:', uploadResult.originalUrl);
    }
    
    // 4️⃣ Passer en mode manuel pour éditer
    console.log('✅ Passage en mode manuel');
    showToast('✅ Image optimisée et données IA prêtes', 'success');
    setMode('manual');
    
  } catch (error: any) {
    console.error('💥 Erreur dans handlePhotoUpload:', error);
    showToast(`Erreur : ${error.message}`, 'error');
  } finally {
    setIsProcessing(false);
  }
};

  // Mode "link" - Interface pour ajout par lien
  if (mode === 'link') {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <button 
            onClick={() => setMode('choose')}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2 mx-auto"
          >
            ← Retour aux options
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            🔗 Ajouter depuis un lien
          </h1>
          <p className="text-gray-600">
            Collez le lien d'une recette et nous essaierons de l'importer automatiquement
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Lien de la recette
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://www.pinterest.com/pin/... ou https://www.marmiton.org/..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Sites supportés :</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>✅ <strong>Sites de recettes</strong> - Marmiton, 750g, blogs culinaires</div>
              <div>⚠️ <strong>Réseaux sociaux</strong> - Mode manuel assisté (Instagram, TikTok)</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setMode('choose')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={() => setMode('choose')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={handleExtractFromUrl}
              disabled={isExtracting || !linkUrl.trim()}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {isExtracting ? "🔄 Extraction..." : "🚀 Extraire la recette"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 🎨 COMPOSANT APERÇU AMÉLIORÉ
  const PreviewSection = () => {
    if (!imageUrl && !imageVersions) return null; // ⬅️ Check OK

    return (
      <div className="mt-3 relative">
        {/* 🆕 Utilise la version medium pour l'aperçu (800px au lieu de 2400px) */}
         <img 
          src={imageVersions ? imageVersions.medium : imageUrl}
          alt="Aperçu" 
          className="w-full max-w-xs h-32 object-cover rounded-lg border"
          onError={(e) => {
            // Fallback vers l'URL originale si erreur
            if (imageVersions && e.currentTarget.src !== imageVersions.large) {
              e.currentTarget.src = imageVersions.large;
            }
          }}
        />
        <button
          onClick={() => {
            setImageUrl("");
            setImageVersions(null); // 🆕 Reset aussi les versions
          }}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
        >
          ×
        </button>
        
        {/* 🆕 Indicateur d'optimisation */}
        {imageVersions && (
          <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
            ✨ Optimisé
          </div>
        )}
      </div>
    );
  };
  
  if (isProcessing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🤖 IA en cours d'analyse...
          </h2>
          <p className="text-gray-600 mb-8">
            Notre IA analyse votre {mode === 'photo' ? 'photo' : 'recette manuscrite'} et extrait automatiquement les informations
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Cela prend généralement 5-10 secondes...
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'choose') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            ✨ Nouvelle recette
          </h1>
          <p className="text-xl text-gray-600">
            Choisissez comment vous souhaitez ajouter votre recette
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
          
          
          {/* Mode 2 : Photo d'un plat */}
          <div 
            onClick={() => setMode('photo')}
            className="group bg-white rounded-2xl border-2 border-gray-200 p-4 md:p-6 hover:border-orange-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="text-center space-y-3 md:space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-orange-200 transition-colors">
                <Camera className="w-10 h-10 text-orange-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Depuis une photo de plat{!process.env.NEXT_PUBLIC_OPENAI_API_KEY && '🚫'}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Prenez en photo votre plat terminé. Notre IA devine la recette et génère automatiquement les instructions.
                </p>
              </div>
              
              <div className="pt-4 space-y-2">
                <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-orange-100 transition-colors">
                  🤖 IA - 5 offertes
                </div>
              </div>
            </div>
          </div>

          {/* Mode 3 : Scan recette manuscrite */}
          <div 
            onClick={() => setMode('scan')}
            className="group bg-white rounded-2xl border-2 border-gray-200 p-4 md:p-6 hover:border-green-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="text-center space-y-3 md:space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors">
                <PenTool className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Depuis une photo de texte{!process.env.NEXT_PUBLIC_OPENAI_API_KEY && '🚫'}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Photographiez une recette écrite à la main ou imprimée. Notre IA lit et structure automatiquement le texte.
                </p>
              </div>
              
              <div className="pt-4">
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-green-100 transition-colors">
                  🤖 IA - 5 offertes
                </div>
              </div>
            </div>
          </div>

          {/* Mode 1 : Saisie manuelle */}
          <div 
            onClick={() => setMode('manual')}
            className="group bg-white rounded-2xl border-2 border-gray-200 p-4 md:p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
            <div className="text-center space-y-3 md:space-y-4">
              
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Ou saisie manuelle
                </h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Entrez votre recette directement. Parfait pour créer une nouvelle recette ou retranscrire fidèlement.
                </p>
              </div>
              
              <div className="pt-4">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-blue-100 transition-colors">
                  🆓 Gratuit
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    );
  }

  if (mode === 'photo') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setMode('choose')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            📸 Photo d'un plat
          </h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="w-12 h-12 text-orange-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Photographiez votre plat
          </h2>
          <p className="text-gray-600 mb-8">
            Notre IA OpenAI va analyser votre photo et créer automatiquement la recette complète avec optimisation d'image
          </p>

          <label className="inline-block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
              className="hidden"
            />
            <div className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition-colors font-medium cursor-pointer inline-flex items-center gap-3">
              <Upload className="w-5 h-5" />
              Prendre une photo / Choisir une image
            </div>
          </label>

          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">🤖 Conseils pour l'IA</h4>
            <ul className="text-sm text-orange-700 text-left space-y-1">
              <li>• Cadrez bien le plat au centre</li>
              <li>• Éclairage naturel de préférence</li>
              <li>• Évitez les reflets et ombres fortes</li>
              <li>• L'IA fonctionne mieux avec des plats reconnaissables</li>
              <li>• 🆕 Votre image sera automatiquement optimisée (3 tailles)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'scan') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setMode('choose')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            📄 Recette manuscrite ou imprimée
          </h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          
          {/* 🆕 SECTION : Photos de texte uploadées */}
          {scannedImages.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                📚 Pages scannées ({scannedImages.length}/3)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {scannedImages.map((img, index) => (
                  <div key={index} className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Page {index + 1}
                    </div>
                    <button
                      onClick={() => {
                        const newImages = scannedImages.filter((_, i) => i !== index);
                        setScannedImages(newImages);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🆕 BOUTON : Ajouter une photo de texte */}
          {scannedImages.length < 3 && (
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-12 h-12 text-green-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {scannedImages.length === 0 
                  ? "Scannez votre recette" 
                  : "Ajouter une autre page ?"}
              </h2>
              <p className="text-gray-600 mb-6">
                {scannedImages.length === 0
                  ? "Photographiez une recette écrite ou imprimée"
                  : `Vous pouvez ajouter jusqu'à ${3 - scannedImages.length} page(s) supplémentaire(s)`}
              </p>

              <label className="inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setScannedImages(prev => [...prev, file]);
                    }
                  }}
                  className="hidden"
                />
                <div className="bg-green-100 text-green-700 px-8 py-4 rounded-lg hover:bg-green-200 transition-colors font-medium cursor-pointer inline-flex items-center gap-3">
                  <Upload className="w-5 h-5" />
                  {scannedImages.length === 0 
                    ? "Prendre une photo de la recette"
                    : "Ajouter une page supplémentaire"}
                </div>
              </label>
            </div>
          )}

          {/* 🆕 BOUTON : Analyser les scans */}
          {scannedImages.length > 0 && (
            <div className="space-y-4">
              <button
                onClick={handleMultipleScanUpload}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Analyse en cours... ({currentScanIndex + 1}/{scannedImages.length})
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyser {scannedImages.length} page{scannedImages.length > 1 ? 's' : ''}
                  </>
                )}
              </button>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">📝 Conseils pour l'OCR</h4>
                <ul className="text-sm text-green-700 text-left space-y-1">
                  <li>• Les pages seront analysées dans l'ordre d'ajout</li>
                  <li>• Les étapes seront numérotées automatiquement</li>
                  <li>• Assurez-vous que le texte est lisible</li>
                  <li>• Éclairage uniforme sans ombres</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mode saisie manuelle
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setMode('choose')}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          ✍️ Saisie manuelle
        </h1>
      </div>

      {aiConfidence && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <h4 className="font-medium text-green-800">Analyse IA terminée</h4>
              <p className="text-sm text-green-700">
                Confiance : {aiConfidence}% • Vous pouvez modifier les champs ci-dessous
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        
        {/* Titre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nom de la recette *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="Ex: Gâteau de Mamie"
            required
          />
        </div>

        {/* Rangée rapide */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Par qui ?
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              placeholder="Mamie, Papa..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Temps (min)
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={prepMinutes}
              onChange={(e) => setPrepMinutes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              placeholder="30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Personnes
            </label>
            <input
              type="text"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              placeholder="4, 6-8..."
            />
          </div>
        </div>

        {/* 🔄 SECTION PHOTO MISE À JOUR avec optimisations */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Photo (optionnel)
          </label>
          
          <div className="space-y-3">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageVersions(null); // Reset versions si URL manuelle
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              placeholder="Collez un lien d'image..."
            />
            
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  disabled={isUploading}
                />
                📷 {isUploading ? "Optimisation..." : "Ajouter ma photo"}
              </label>

              <ImageSearch 
                onImageSelect={(url) => {
                  setImageUrl(url);
                  setImageVersions(null); // Reset versions pour URL externe
                }}
                initialQuery={title}
              />
            </div>
            
            {/* 🆕 APERÇU OPTIMISÉ */}
            <PreviewSection />
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            💡 Upload optimisé automatique : 3 tailles (200px, 800px, 2400px) pour des performances optimales !
          </p>
        </div>

        {/* Ingrédients */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🥄 Ingrédients
          </label>
          <textarea
            rows={6}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none resize-none"
            placeholder="Un ingrédient par ligne :

200g de farine
3 œufs
100ml de lait"
          />
        </div>

        {/* 🆕 TAGS */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🏷️ Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="Ex: dessert, rapide, végétarien"
          />
          <p className="text-xs text-gray-500 mt-1">
            Séparez les tags par des virgules
          </p>
        </div>


        {/* Étapes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📋 Instructions
          </label>
          <textarea
            rows={8}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none resize-none"
            placeholder="Écrivez les étapes naturellement en laissant une ligne vide entre chacune  :

Préchauffer le four à 180°C.

Mélanger la farine et le sucre.

Enfourner 25 minutes."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setMode('choose')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !title.trim() || isUploading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "⏳ Sauvegarde..." : "✨ Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
