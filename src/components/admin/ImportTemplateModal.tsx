import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface ImportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (templateExercises: any[]) => void;
}

export function ImportTemplateModal({ isOpen, onClose, onImport }: ImportTemplateModalProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setSearchQuery('');
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          id,
          name,
          description,
          workout_template_exercises (
            id,
            exercise_id,
            default_sets,
            default_reps,
            exercises (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTemplates(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao carregar templates.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (template: any) => {
    if (!template.workout_template_exercises || template.workout_template_exercises.length === 0) {
      toast({ title: "Atenção", description: "Este template não possui exercícios.", variant: "destructive" });
      return;
    }
    onImport(template.workout_template_exercises);
    onClose();
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h2 className="text-xl font-bold text-foreground">Importar Treino</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/5 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          </div>

          {/* Body */}
          <div className="p-2 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum template encontrado.</p>
            ) : (
              <div className="space-y-2">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="glass border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                      <h3 className="font-semibold text-foreground text-base">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {template.workout_template_exercises?.length || 0} exercícios
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleImport(template)}
                      variant="outline" 
                      className="w-full sm:w-auto shrink-0 border-primary/50 hover:bg-primary/20 text-primary gap-2"
                    >
                      <Download className="w-4 h-4" /> Importar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
