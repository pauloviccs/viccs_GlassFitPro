import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Dumbbell, Clock, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { CreateTemplateModal, EditableTemplate } from '@/components/admin/CreateTemplateModal';

interface Template {
  id: string;
  name: string;
  description: string;
  created_at: string;
  workout_template_exercises: {
    id: string;
    exercise_id: string;
    default_sets: number;
    default_reps: number;
    exercises: {
      id: string;
      name: string;
      category: string;
    };
  }[];
}

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EditableTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          *,
          workout_template_exercises (
            id,
            exercise_id,
            default_sets,
            default_reps,
            exercises (
              id,
              name,
              muscle_group
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTemplates(data as unknown as Template[]);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao carregar templates.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este template? Ele não será removido dos alunos que já o possuem.")) return;

    try {
      const { error } = await supabase.from('workout_templates').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: "Sucesso", description: "Template excluído com sucesso." });
      fetchTemplates();
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Não foi possível excluir o template.", variant: "destructive" });
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template as unknown as EditableTemplate);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingTemplate(null);
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Biblioteca de Treinos</h1>
          <p className="text-muted-foreground mt-1">Crie e gerencie pacotes de exercícios reutilizáveis.</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto gap-2"
        >
          <Plus className="w-5 h-5" /> Novo Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar templates por nome ou descrição..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full glass rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 glass rounded-3xl" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl">
          <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-medium text-foreground">Nenhum template encontrado</p>
          <p className="text-muted-foreground mt-2">Crie seu primeiro pacote de treino para reutilizar rapidamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={template.id}
              className="glass rounded-3xl p-6 flex flex-col relative group"
            >
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(template)}
                  className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                  title="Editar Template"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(template.id)}
                  className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
                  title="Excluir Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4 pr-20">
                <h3 className="text-xl font-bold text-foreground">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  {template.workout_template_exercises?.length || 0} exercícios
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(template.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-3 flex-1 overflow-y-auto max-h-[150px] scrollbar-hidden">
                <div className="space-y-2">
                  {template.workout_template_exercises?.map((te) => (
                    <div key={te.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-foreground truncate pr-2">{te.exercises?.name}</span>
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {te.default_sets}x{te.default_reps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateTemplateModal 
        isOpen={isCreateModalOpen || !!editingTemplate} 
        onClose={handleCloseModal} 
        onSuccess={fetchTemplates}
        editingTemplate={editingTemplate}
      />
    </div>
  );
}
