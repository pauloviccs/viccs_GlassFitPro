import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Save, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTemplateModal({ isOpen, onClose, onSuccess }: CreateTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
      setName('');
      setDescription('');
      setSelectedExercises([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('exercises').select('*').order('name');
      if (error) throw error;
      if (data) setExercises(data);
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao carregar biblioteca de exercícios.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExercise = (id: string) => {
    setSelectedExercises(prev => 
      prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Atenção", description: "O nome do treino é obrigatório.", variant: "destructive" });
      return;
    }
    if (selectedExercises.length === 0) {
      toast({ title: "Atenção", description: "Selecione ao menos um exercício.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      // 1. Criar o template
      const { data: templateData, error: templateError } = await supabase
        .from('workout_templates')
        .insert([{ name: name.trim(), description: description.trim() }])
        .select()
        .single();

      if (templateError) throw templateError;

      // 2. Criar os exercícios vinculados
      const templateExercises = selectedExercises.map((exId, index) => {
        const exDetail = exercises.find(e => e.id === exId);
        return {
          template_id: templateData.id,
          exercise_id: exId,
          default_sets: exDetail?.default_sets || 3,
          default_reps: exDetail?.default_reps || 12,
          order_index: index
        };
      });

      const { error: exercisesError } = await supabase
        .from('workout_template_exercises')
        .insert(templateExercises);

      if (exercisesError) throw exercisesError;

      toast({ title: "Sucesso", description: "Template criado com sucesso!" });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Não foi possível criar o template.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg glass-strong rounded-3xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 shrink-0">
            <h2 className="text-xl font-bold text-foreground">Novo Template</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Nome do Treino</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Peito e Bíceps"
                  className="w-full glass-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Descrição (Opcional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Foco em hipertrofia, 45 min"
                  className="w-full glass-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Selecione os Exercícios ({selectedExercises.length})
                  </label>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-3 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar exercício..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hidden">
                    {exercises
                      .filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((ex) => {
                    const isSelected = selectedExercises.includes(ex.id);
                    return (
                      <button
                        key={ex.id}
                        onClick={() => toggleExercise(ex.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-primary/20 border-primary/50' 
                            : 'glass border-white/5 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {ex.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                            {ex.default_sets}x{ex.default_reps}
                          </span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                  {exercises.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">Nenhum exercício encontrado.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-black/20 shrink-0">
            <Button 
              className="w-full h-12 rounded-xl flex items-center gap-2" 
              onClick={handleSave}
              disabled={isSaving || isLoading}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" /> Salvar Template
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
