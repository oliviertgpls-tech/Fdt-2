"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader, Database, Trash2, Users, BookOpen, NotebookPen, FileText } from 'lucide-react';

export function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Données globales (tous users) pour l'admin
  const [globalStats, setGlobalStats] = useState({
    totalRecipes: 0,
    totalNotebooks: 0,
    totalBooks: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);

  const [advancedStats, setAdvancedStats] = useState({
    totalUsers: 0,
    avgRecipesPerUser: 0,
    avgNotebooksPerUser: 0,
    avgBooksPerUser: 0,
  });

  // Charger les données au montage
  useEffect(() => {
    if (status === 'authenticated') {
      loadSessions();
      loadAdvancedStats();
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

  const loadAdvancedStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!data.error) {
        setAdvancedStats(data);
        // Mettre à jour aussi les stats globales
        setGlobalStats({
          totalRecipes: data.raw?.totalRecipes || 0,
          totalNotebooks: data.raw?.totalNotebooks || 0,
          totalBooks: data.raw?.totalBooks || 0,
        });
      }
    } catch (error) {
      console.error('Erreur chargement stats avancées:', error);
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

        {/* Stats globales - Données brutes */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard
            icon={<FileText className="w-6 h-6 md:w-8 md:h-8" />}
            label="Recettes totales"
            value={globalStats.totalRecipes}
            color="blue"
          />
          <StatCard
            icon={<NotebookPen className="w-6 h-6 md:w-8 md:h-8" />}
            label="Carnets totaux"
            value={globalStats.totalNotebooks}
            color="purple"
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6 md:w-8 md:h-8" />}
            label="Livres totaux"
            value={globalStats.totalBooks}
            color="green"
          />
          <StatCard
            icon={<Users className="w-6 h-6 md:w-8 md:h-8" />}
            label="Sessions actives"
            value={sessions.filter(s => !s.isExpired).length}
            color="orange"
          />
        </div>

        {/* Stats avancées - Moyennes par user */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📊 Statistiques utilisateurs
            <span className="text-sm font-normal text-gray-500">(hors compte test)</span>
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
              <div className="text-3xl font-bold text-indigo-900 mb-1">
                {advancedStats.totalUsers}
              </div>
              <div className="text-sm text-indigo-700">
                Utilisateurs uniques
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {advancedStats.avgRecipesPerUser}
              </div>
              <div className="text-sm text-blue-700">
                Recettes moy. / user
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="text-3xl font-bold text-purple-900 mb-1">
                {advancedStats.avgNotebooksPerUser}
              </div>
              <div className="text-sm text-purple-700">
                Carnets moy. / user
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-3xl font-bold text-green-900 mb-1">
                {advancedStats.avgBooksPerUser}
              </div>
              <div className="text-sm text-green-700">
                Livres moy. / user
              </div>
            </div>
          </div>
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