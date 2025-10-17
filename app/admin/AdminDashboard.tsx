"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRecipes } from '@/contexts/RecipesProvider';
import { Loader, Database, Trash2, Users, BookOpen, NotebookPen, FileText } from 'lucide-react';

export function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { recipes, notebooks, books } = useRecipes();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);

  // Rediriger si pas connecté
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Charger les stats au montage
  useEffect(() => {
    if (status === 'authenticated') {
      loadSessions();
    }
  }, [status]);

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/admin/list-sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    }
  };

  const handleResetSessions = async () => {
    if (!confirm('⚠️ Supprimer TOUTES les sessions actives ? (déconnexion générale)')) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/admin/reset-sessions', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setMessage('✅ Sessions supprimées');
        await loadSessions();
      } else {
        setMessage('❌ Erreur: ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupUserSessions = async () => {
    const email = prompt('Email de l\'utilisateur :');
    if (!email) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/admin/cleanup-user-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${data.deletedSessions} session(s) supprimée(s) pour ${email}`);
        await loadSessions();
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            🔧 Administration
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Connecté en tant que <span className="font-medium">{session?.user?.email}</span>
          </p>
        </div>

        {/* Stats globales */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard
            icon={<FileText className="w-6 h-6 md:w-8 md:h-8" />}
            label="Recettes"
            value={recipes.length}
            color="blue"
          />
          <StatCard
            icon={<NotebookPen className="w-6 h-6 md:w-8 md:h-8" />}
            label="Carnets"
            value={notebooks.length}
            color="purple"
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6 md:w-8 md:h-8" />}
            label="Livres"
            value={books.length}
            color="green"
          />
          <StatCard
            icon={<Users className="w-6 h-6 md:w-8 md:h-8" />}
            label="Sessions"
            value={sessions.filter(s => !s.isExpired).length}
            color="orange"
          />
        </div>

        {/* Actions de maintenance */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Maintenance
          </h2>

          <div className="space-y-3">
            <button
              onClick={handleResetSessions}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Trash2 className="w-4 h-4" />
              Réinitialiser toutes les sessions
            </button>

            <button
              onClick={handleCleanupUserSessions}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Users className="w-4 h-4" />
              Nettoyer sessions d'un utilisateur
            </button>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Liste des sessions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            Sessions actives ({sessions.filter(s => !s.isExpired).length})
          </h2>

          {sessions.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune session trouvée</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    session.isExpired 
                      ? 'bg-gray-50 border-gray-200 text-gray-500' 
                      : 'bg-green-50 border-green-200 text-green-900'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm">{session.userEmail}</span>
                    <span className="text-xs sm:text-sm">
                      {session.isExpired ? '❌ Expirée' : '✅ Active'} - 
                      Expire: {new Date(session.expires).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// Composant carte de statistique
function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  // Classes complètes en dur pour que Tailwind les détecte
  let gradientClass = '';
  
  if (color === 'blue') gradientClass = 'bg-gradient-to-br from-blue-500 to-blue-600';
  if (color === 'purple') gradientClass = 'bg-gradient-to-br from-purple-500 to-purple-600';
  if (color === 'green') gradientClass = 'bg-gradient-to-br from-green-500 to-green-600';
  if (color === 'orange') gradientClass = 'bg-gradient-to-br from-orange-500 to-orange-600';

  return (
    <div className={`${gradientClass} text-white rounded-lg p-4 md:p-6`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl md:text-3xl font-bold">{value}</span>
      </div>
      <p className="text-xs md:text-sm opacity-90">{label}</p>
    </div>
  );
}

📝 Commandes Git
bashgit add app/admin/AdminDashboard.tsx
git commit -m "fix: use static Tailwind classes for gradient colors"
git push

💡 Concept dev : Tailwind et classes dynamiques
Pourquoi colors[color] ne marche pas ?
Tailwind fonctionne en scannant ton code au build pour trouver les classes utilisées :

✅ className="bg-blue-500" → Tailwind voit "bg-blue-500" et l'inclut
❌ className={colors[color]} → Tailwind ne peut pas deviner la valeur à l'exécution

Solution : Écrire toutes les classes en dur pour que Tailwind les voie pendant le scan.

Ça devrait compiler maintenant ! 🚀RéessayerClaude peut faire des erreurs. Assurez-vous de vérifier ses réponses.