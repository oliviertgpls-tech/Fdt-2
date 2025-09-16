"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, PenTool, Edit3, ArrowLeft, Sparkles, Upload, FileText, Image as ImageIcon } from "lucide-react";

// Service IA OpenAI avec debug
class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    console.log('🔑 OpenAI Key disponible:', this.apiKey ? 'OUI' : 'NON');
    console.log('🔑 Début de la clé:', this.apiKey ? this.apiKey.substring(0, 7) + '...' : 'MANQUANTE');
  }

  async analyzePhotoToRecipe(imageFile: File): Promise<{
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
  "author": "Recette générée par IA",
  "prepMinutes": 30,
  "servings": "4 personnes",
  "ingredients": ["ingrédient 1", "ingrédient 2"],
  "steps": "Étape 1...\n\nÉtape 2...",
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

  async analyzeManuscriptToRecipe(imageFile: File): Promise<{
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
  "author": "Nom trouvé ou 'Recette familiale'",
  "prepMinutes": 30,
  "servings": "4 personnes",
  "ingredients": ["ingrédient 1", "ingrédient 2"],
  "steps": "Étape 1...\n\nÉtape 2...",
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

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
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
        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <ImageIcon className="w-4 h-4" />
        Chercher une image
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
        
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              🖼️ Choisir une image
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
              placeholder="Ex: pizza, gâteau au chocolat, salade..."
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
  const router = useRouter();
  
  const [mode, setMode] = useState<'choose' | 'manual' | 'photo' | 'scan'>('choose');
  const [isProcessing, setIsProcessing] = useState(false);

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

  // État pour IA
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  // 🆕 AJOUTER ICI - Fonction utilitaire d'upload
  const uploadImageToServer = async (file: File): Promise<string> => {
    console.log('📤 Upload vers le serveur...', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Résultat upload:', result);
    
    if (result.success) {
      return result.imageUrl; // Retourne /uploads/filename.jpg
    } else {
      throw new Error(result.error || 'Erreur upload');
    }
  };

  // Debug des variables d'environnement au chargement
  useState(() => {
    console.log('🔍 Variables d\'environnement:');
    console.log('OpenAI:', process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'PRÉSENTE' : 'MANQUANTE');
    console.log('Unsplash:', process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ? 'PRÉSENTE' : 'MANQUANTE');
  });

  // Upload d'image personnelle
  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const permanentUrl = await uploadImageToServer(file);
      setImageUrl(permanentUrl);
    } catch (error: any) {
      alert("Erreur lors de l'upload de l'image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleScanUpload = async (file: File) => {
  setIsProcessing(true);
  console.log('📄 Début handleScanUpload');
  
  try {
    // Analyser avec l'IA d'abord
    const aiResult = await openAIService.analyzeManuscriptToRecipe(file);
    console.log('🤖 Résultat IA manuscrit:', aiResult);
    
    // Puis uploader l'image RÉELLEMENT sur le serveur
    console.log('📤 Upload du manuscrit...');
    const permanentUrl = await uploadImageToServer(file);
    console.log('✅ Manuscrit uploadé:', permanentUrl);
    
    // Remplir les champs
    setTitle(aiResult.title);
    setAuthor(aiResult.author);
    setPrepMinutes(aiResult.prepMinutes.toString());
    setServings(aiResult.servings);
    setIngredients(aiResult.ingredients.join('\n'));
    setSteps(aiResult.steps);
    setAiConfidence(aiResult.confidence);
    
    // 🎯 UTILISER L'URL PERMANENTE
    setImageUrl(permanentUrl);
    
    setMode('manual');
    
    console.log('🎉 handleScanUpload terminé avec succès');
    
  } catch (error: any) {
    console.error('💥 Erreur dans handleScanUpload:', error);
    alert(`Erreur détaillée: ${error.message}`);
  } finally {
    setIsProcessing(false);
  }
};

  // Analyse photo avec debug détaillé
  const handlePhotoUpload = async (file: File) => {
    setIsProcessing(true);
    console.log('🎬 Début handlePhotoUpload');
    
    try {
      const aiResult = await openAIService.analyzePhotoToRecipe(file);
      
      setTitle(aiResult.title);
      setAuthor(aiResult.author);
      setPrepMinutes(aiResult.prepMinutes.toString());
      setServings(aiResult.servings);
      setIngredients(aiResult.ingredients.join('\n'));
      setSteps(aiResult.steps);
      setAiConfidence(aiResult.confidence);
      
      const permanentUrl = await uploadImageToServer(file);
      setImageUrl(permanentUrl);
      
      setMode('manual');
      
    } catch (error: any) {
      console.error('💥 Erreur dans handlePhotoUpload:', error);
      alert(`Erreur détaillée: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
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
            Notre IA OpenAI analyse votre {mode === 'photo' ? 'photo' : 'recette manuscrite'} et extrait automatiquement les informations
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Cela prend généralement 5-10 secondes...
          </p>
          <p className="text-xs text-gray-400 mt-2">
            🔧 Mode debug - Regardez la console (F12) pour plus d'infos
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
          
          {/* Debug info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            🔧 Debug: OpenAI {process.env.NEXT_PUBLIC_OPENAI_API_KEY ? '✅' : '❌'} | 
            Unsplash {process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ? '✅' : '❌'}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Mode 1 : Saisie manuelle */}
          <div 
            onClick={() => setMode('manual')}
            className="group bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                <Edit3 className="w-10 h-10 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Saisie manuelle
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Tapez votre recette directement. Parfait pour créer une nouvelle recette ou retranscrire fidèlement.
                </p>
              </div>
              
              <div className="pt-4">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-blue-100 transition-colors">
                  🆓 Gratuit
                </div>
              </div>
            </div>
          </div>

          {/* Mode 2 : Photo d'un plat */}
          <div 
            onClick={() => setMode('photo')}
            className="group bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-orange-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-orange-200 transition-colors">
                <Camera className="w-10 h-10 text-orange-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Photo d'un plat {!process.env.NEXT_PUBLIC_OPENAI_API_KEY && '🚫'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Prenez en photo votre plat terminé. Notre IA OpenAI devine la recette et génère automatiquement les instructions.
                </p>
              </div>
              
              <div className="pt-4 space-y-2">
                <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-orange-100 transition-colors">
                  🤖 IA OpenAI - ~0,01€
                </div>
                <p className="text-xs text-gray-500">
                  {process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Prêt à analyser' : 'Clé API manquante'}
                </p>
              </div>
            </div>
          </div>

          {/* Mode 3 : Scan recette manuscrite */}
          <div 
            onClick={() => setMode('scan')}
            className="group bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-green-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors">
                <PenTool className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Recette manuscrite {!process.env.NEXT_PUBLIC_OPENAI_API_KEY && '🚫'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Photographiez une recette écrite à la main ou imprimée. Notre IA OpenAI lit et structure automatiquement le texte.
                </p>
              </div>
              
              <div className="pt-4">
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-green-100 transition-colors">
                  🤖 IA OpenAI - ~0,01€
                </div>
                <p className="text-xs text-gray-500">
                  {process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Prêt à lire' : 'Clé API manquante'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🤖</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Powered by OpenAI GPT-4 Vision
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Analyse intelligente</strong> : Reconnaît les plats et ingrédients</li>
                <li>• <strong>OCR avancé</strong> : Lit même l'écriture manuscrite</li>
                <li>• <strong>Coût transparent</strong> : ~0,01€ par analyse</li>
                <li>• <strong>Éditable</strong> : Vous pouvez corriger le résultat</li>
              </ul>
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
            Notre IA OpenAI va analyser votre photo et créer automatiquement la recette complète
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
            📄 Recette manuscrite
          </h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Scannez votre recette
          </h2>
          <p className="text-gray-600 mb-8">
            Photographiez une recette écrite à la main ou imprimée. Notre IA OpenAI va lire et structurer le texte automatiquement.
          </p>

          <label className="inline-block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleScanUpload(file);
              }}
              className="hidden"
            />
            <div className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer inline-flex items-center gap-3">
              <Upload className="w-5 h-5" />
              Prendre une photo de la recette
            </div>
          </label>

          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">📝 Conseils pour l'OCR</h4>
            <ul className="text-sm text-green-700 text-left space-y-1">
              <li>• Placez la recette sur une surface plane</li>
              <li>• Assurez-vous que tout le texte est visible</li>
              <li>• Éclairage uniforme sans ombres</li>
              <li>• L'IA lit même l'écriture manuscrite !</li>
            </ul>
          </div>
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

        {/* Photo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Photo (optionnel)
          </label>
          
          <div className="space-y-3">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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
                📷 {isUploading ? "Upload..." : "Ma photo"}
              </label>

              <ImageSearch 
                onImageSelect={(url) => setImageUrl(url)}
                initialQuery={title}
              />
            </div>
            
            {imageUrl && (
              <div className="mt-3 relative">
                <img 
                  src={imageUrl} 
                  alt="Aperçu" 
                  className="w-full max-w-xs h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>
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
            placeholder="Écrivez les étapes naturellement :

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
            Changer de mode
          </button>
          <button
            type="button"
            onClick={handleSaveManual}
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
