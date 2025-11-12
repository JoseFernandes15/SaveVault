import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Game, GameSave } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface SavesModalProps {
  open: boolean;
  onClose: () => void;
  game: Game | null;
  // onAddSave agora deve retornar uma Promise para podermos aguardar o envio
  onAddSave: (gameId: string, save: Omit<GameSave, 'id' | 'uploadedAt'>) => Promise<void>;
  onUpdateSave: (gameId: string, saveId: string, updates: Partial<GameSave>) => void;
  onDeleteSave: (gameId: string, saveId: string) => void;
}

export const SavesModal = ({
  open,
  onClose,
  game,
  onAddSave,
  onUpdateSave,
  onDeleteSave,
}: SavesModalProps) => {
  const { t } = useLanguage();
  const [showAddSave, setShowAddSave] = useState(false);
  const [editingSave, setEditingSave] = useState<GameSave | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [saveName, setSaveName] = useState('');
  const [saveFile, setSaveFile] = useState('');
  const [saveFileName, setSaveFileName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // cópia local da lista de saves para atualizações instantâneas na UI
  const [localSaves, setLocalSaves] = useState<GameSave[]>([])

  // move/reset helper para cima para podermos chamá-lo no useEffect
  function resetForm() {
    setSaveName('');
    setSaveFile('');
    setSaveFileName('');
    setSaveDescription('');
    setEditingSave(null);
  }

  // Quando o modal abre/fecha, garante que o estado interno é reiniciado.
  useEffect(() => {
    if (!open) {
      // ao fechar, limpar tudo
      setShowAddSave(false);
      resetForm();
      setIsSubmitting(false);
    } else {
      // ao abrir, garantir que mostramos a lista (não o formulário/edição)
      setShowAddSave(false);
      resetForm();
      setIsSubmitting(false);
    }
  }, [open]);

  // sincroniza a cópia local sempre que o jogo ou o modal mudarem
  useEffect(() => {
    const filtered = (game?.saves ?? []).filter(
      (s) => s && (s.id != null || s.fileData || s.fileName || s.name)
    )
    setLocalSaves(filtered)
  }, [game, open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        toast({ 
          title: 'Erro', 
          description: 'O ficheiro não pode exceder 100MB',
          variant: 'destructive'
        });
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSaveFile(reader.result as string);
        setSaveFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !saveName || !saveFile) return;

    const savePayload = {
      name: saveName.trim(),
      description: saveDescription.trim(),
      fileData: saveFile, // assume base64
      fileName: saveFileName,
    };

    try {
      setIsSubmitting(true);
      if (editingSave) {
        await onUpdateSave(game.id, editingSave.id, {
          name: saveName,
          fileName: saveFileName,
          fileData: saveFile,
          description: saveDescription,
        });
        // atualiza imediatamente a lista local
        setLocalSaves(prev =>
          prev.map(s =>
            String(s.id) === String(editingSave.id)
              ? { ...s, name: saveName, description: saveDescription, fileName: saveFileName, fileData: saveFile || s.fileData }
              : s
          )
        )
        setEditingSave(null);
      } else {
        await onAddSave(game.id, savePayload);
        // adiciona otimisticamente à lista local (id temporário)
        const newSave: GameSave = {
          id: `tmp-${Date.now()}`,
          name: savePayload.name,
          fileName: savePayload.fileName,
          fileData: savePayload.fileData,
          description: savePayload.description,
          uploadedAt: new Date().toISOString(),
        }
        setLocalSaves(prev => [newSave, ...prev])
      }
      onClose();
    } catch (err) {
      console.error('Erro ao adicionar save:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (save: GameSave) => {
    setEditingSave(save);
    setSaveName(save.name);
    setSaveFile(save.fileData);
    setSaveFileName(save.fileName);
    setSaveDescription(save.description || '');
    setShowAddSave(true);
  };

  const handleCancelEdit = () => {
    setEditingSave(null);
    resetForm();
    setShowAddSave(false);
  };

  const handleDownload = async (saveId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/saves/${saveId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Erro ao fazer download do save.')

      // Converte resposta em blob e força o download
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao fazer download do save' })
    }
  }

  if (!game) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{game.name} - {t('game.saves')}</span>
              {!showAddSave && (
                <Button onClick={() => setShowAddSave(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('game.addSave')}
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {showAddSave ? (
            <form onSubmit={handleSubmitSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="save-name">{t('save.name')}</Label>
                <Input
                  id="save-name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="save-file">
                  {t('save.file')} <span className="text-xs text-muted-foreground">(max 100MB)</span>
                </Label>
                <Input
                  id="save-file"
                  type="file"
                  onChange={handleFileChange}
                  required={!editingSave}
                />
                <p className="text-xs text-muted-foreground">Caso seja mais do que 1 ficheiro submeta o save zipado</p>
                {saveFileName && (
                  <p className="text-sm text-muted-foreground">{saveFileName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="save-description">{t('save.description')}</Label>
                <Textarea
                  id="save-description"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  {t('actions.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="ml-2">
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      {t('saving')}
                    </span>
                  ) : (
                    t('actions.add')
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {localSaves.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t('dashboard.noGames')}
                </p>
              ) : (
                localSaves.map((save) => (
                   <Card key={save.id} className="overflow-hidden">
                     <CardContent className="p-4">
                       <div className="flex items-start justify-between gap-4">
                         <div className="flex-1 min-w-0">
                           <h4 className="font-semibold">{save.name}</h4>
                           <p className="text-sm text-muted-foreground truncate">
                             {save.fileName}
                           </p>
                           {save.description && (
                             <p className="text-sm mt-1">{save.description}</p>
                           )}
                           <p className="text-xs text-muted-foreground mt-2">
                             {t('save.uploadedOn')}: {new Date(save.uploadedAt).toLocaleString()}
                           </p>
                         </div>
                         <div className="flex gap-1">
                           <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(save.id, save.fileName)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(save)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(save.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                       </div>
                     </CardContent>
                   </Card>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
 
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('modal.deleteSave')}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  onDeleteSave(game.id, deleteConfirm);
                  // remove imediatamente da lista local
                  setLocalSaves(prev => prev.filter(s => String(s.id) !== String(deleteConfirm)))
                  setDeleteConfirm(null);
                }
               }}
             >
               {t('actions.confirm')}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </>
  );
};
