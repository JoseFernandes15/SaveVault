import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { GameCard } from '@/components/GameCard';
import { AddGameModal } from '@/components/AddGameModal';
import { SavesModal } from '@/components/SavesModal';
import { useGames } from '@/hooks/useGames';
import { SortField, SortOrder, Game, GameSave } from '@/types';
import { Plus, LogOut, ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { games, addGame, updateGame, deleteGame, addSave, updateSave, deleteSave } = useGames();
  const { user, loading } = useAuth()

  const [showAddGame, setShowAddGame] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showSaves, setShowSaves] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [games, sortField, sortOrder]);

if (loading) return <div>Loading...</div>;
if (!user) return <div>Redirecting...</div>; // ou apenas navigate

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAddGame = (name: string, coverImage: string) => {
    addGame(name, coverImage);
  };

  const handleUpdateGame = (name: string, coverImage: string) => {
    if (editingGame) {
      updateGame(editingGame.id, name, coverImage);
      setEditingGame(null);
    }
  };

  const handleDeleteGame = () => {
    if (deletingGameId) {
      deleteGame(deletingGameId);
      setDeletingGameId(null);
    }
  };

  const handleAddSave = async (gameId: string, save: Omit<GameSave, 'id' | 'uploadedAt'>) => {
    await addSave(gameId, save);
    setShowSaves(false); // Fecha o modal após adicionar save
  };

  const handleUpdateSave = async (gameId: string, saveId: string, updates: Partial<GameSave>) => {
    await updateSave(gameId, saveId, updates);
  };

  const handleDeleteSave = async (gameId: string, saveId: string) => {
    await deleteSave(gameId, saveId);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              SaveVault
            </h1>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <Button variant="outline" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">{t('dashboard.title')}</h2>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <Button onClick={() => setShowAddGame(true)} className="gap-2 shadow-soft">
            <Plus className="h-5 w-5" />
            {t('dashboard.addGame')}
          </Button>

          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">{t('dashboard.sortBy')}:</span>
            <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t('dashboard.sortName')}</SelectItem>
                <SelectItem value="date">{t('dashboard.sortDate')}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {sortedGames.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">{t('dashboard.noGames')}</h3>
            <p className="text-muted-foreground">{t('dashboard.noGamesDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={() => setEditingGame(game)}
                onDelete={() => setDeletingGameId(game.id)}
                onViewSaves={() => {
                  setSelectedGame(game);
                  setShowSaves(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      <AddGameModal
        open={showAddGame}
        onClose={() => setShowAddGame(false)}
        onSubmit={handleAddGame}
      />

      <AddGameModal
        open={!!editingGame}
        onClose={() => setEditingGame(null)}
        onSubmit={handleUpdateGame}
        initialData={editingGame ? { name: editingGame.name, coverImage: editingGame.coverImage } : undefined}
        isEdit
      />

      <SavesModal
        open={showSaves}
        onClose={() => setShowSaves(false)}
        game={selectedGame}
        onAddSave={handleAddSave}
        onUpdateSave={handleUpdateSave}
        onDeleteSave={handleDeleteSave}
      />

      <AlertDialog open={!!deletingGameId} onOpenChange={() => setDeletingGameId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('modal.deleteGame')}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGame}>
              {t('actions.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
