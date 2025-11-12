import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface AddGameModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, coverImage: string) => void;
  initialData?: { name: string; coverImage: string };
  isEdit?: boolean;
}

export const AddGameModal = ({ open, onClose, onSubmit, initialData, isEdit }: AddGameModalProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState(initialData?.name || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [preview, setPreview] = useState(initialData?.coverImage || '');

  // Sincroniza estados quando o modal é aberto ou initialData muda
  useEffect(() => {
    if (open) {
      setName(initialData?.name || '');
      setCoverImage(initialData?.coverImage || '');
      setPreview(initialData?.coverImage || '');
    }
  }, [open, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        toast({ 
          title: 'Erro', 
          description: 'A imagem não pode exceder 50MB',
          variant: 'destructive'
        });
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCoverImage(result);
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Em edição, permitir submeter se houver nome (preenchido da initialData) e uma capa efetiva
    const effectiveCover = coverImage || initialData?.coverImage || ''
    const canSubmit = Boolean(name && (isEdit ? effectiveCover : coverImage))

    if (!canSubmit) return

    onSubmit(name, effectiveCover)
    handleClose()
  };
  
  // Para usar no botão de submit do formulário
  const effectiveCover = coverImage || initialData?.coverImage || ''
  const canSubmit = Boolean(name && (isEdit ? effectiveCover : coverImage))
  
  const handleClose = () => {
    setName('');
    setCoverImage('');
    setPreview('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('modal.editGame') : t('modal.addGame')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="game-name">{t('game.name')}</Label>
            <Input
              id="game-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('game.name')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="game-cover">{t('game.cover')} <span className="text-xs text-muted-foreground">(max 50MB)</span></Label>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Input
                  id="game-cover"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  required={!isEdit}
                />
              </div>
              {preview && (
                <div className="relative aspect-[3/4] w-32 overflow-hidden rounded-md border">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit} className="ml-2">
              {isEdit ? t('actions.save') : t('actions.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
