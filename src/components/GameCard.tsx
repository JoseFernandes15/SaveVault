import { useState } from 'react';
import { MoreVertical, Edit, Trash2, FolderOpen } from 'lucide-react';
import { Game } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface GameCardProps {
  game: Game;
  onEdit: () => void;
  onDelete: () => void;
  onViewSaves: () => void;
}

export const GameCard = ({ game, onEdit, onDelete, onViewSaves }: GameCardProps) => {
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();

  const coverSrc = game.coverImage ?? (game as any).coverUrl ?? '';

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-card hover:scale-[1.02] duration-300">
      <div 
        className="relative aspect-[3/4] overflow-hidden bg-muted cursor-pointer"
        onClick={onViewSaves}
      >
        {!imageError && coverSrc ? (
          <img
            src={coverSrc}
            alt={game.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-primary text-primary-foreground">
            <span className="text-6xl font-bold">{game.name?.[0] ?? '?'}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()} // evita propagação para o onViewSaves
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e: any) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="mr-2 h-4 w-4" />
                {t('game.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e: any) => { e.stopPropagation(); onDelete(); }} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t('game.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{game.name}</h3>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {(game.saves?.length ?? 0)} {t('game.saves')}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewSaves}
            className="h-8 text-xs gap-1 hover:bg-primary hover:text-primary-foreground"
          >
            <FolderOpen className="h-3 w-3" />
            {t('game.viewSaves')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
