import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Nomes compatíveis com o que usamos no projeto localmente
export type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  sets: number;
  reps: number;
  videoUrl?: string;
  imageUrl?: string;
  description?: string;
  completed: boolean;
};

export type WorkoutDay = {
  id: string; // Day ID from supabase
  dayOfWeek: string;
  exercises: Exercise[];
};

export type Student = {
  id: string;
  name: string;
  email: string;
  weeklyProgress: number; // 0 to 100
  workouts: WorkoutDay[];
};

interface WorkoutStore {
  currentStudent: Student | null;
  isLoading: boolean;

  // Ações para o Estudante
  fetchStudentData: (studentId: string) => Promise<void>;
  markExerciseComplete: (dayId: string, exerciseId: string) => Promise<void>;

  // Variáveis antigas deixadas como null/vazio pra não quebrar imports que não foram apagados
  students: any[];
  exerciseLibrary: any[];
  addStudent: (s: any) => void;
  addExerciseToLibrary: (e: any) => void;
  assignWorkoutToStudent: (id: string, w: any) => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  currentStudent: null,
  isLoading: true,
  students: [],
  exerciseLibrary: [],
  addStudent: () => { },
  addExerciseToLibrary: () => { },
  assignWorkoutToStudent: () => { },

  fetchStudentData: async (studentId: string) => {
    set({ isLoading: true });
    try {
      // 1. Pega os Dados do Estudante
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', studentId).single();

      // 2. Pega todos os Dias cadastrados
      const { data: days } = await supabase.from('workout_days').select('*').eq('student_id', studentId);

      // 3. Pega todos os Exercícios destes dias
      let processedWorkouts: WorkoutDay[] = [];

      if (days && days.length > 0) {
        const dayIds = days.map(d => d.id);
        const { data: exercisesData } = await supabase
          .from('workout_exercises')
          .select(`*, exercises(*)`)
          .in('workout_day_id', dayIds)
          .order('order_index');

        processedWorkouts = days.map(d => {
          const itemsForThisDay = (exercisesData || []).filter(ex => ex.workout_day_id === d.id);

          return {
            id: d.id,
            dayOfWeek: d.day_of_week,
            exercises: itemsForThisDay.map(it => ({
              id: it.id, // O ID do pivot é o importante pro Update
              name: it.exercises?.name || 'Desconhecido',
              muscle_group: it.exercises?.muscle_group || '',
              sets: it.sets,
              reps: it.reps,
              videoUrl: it.exercises?.video_url,
              imageUrl: it.exercises?.image_url,
              description: it.exercises?.description || '',
              completed: it.completed
            }))
          };
        });
      }

      // Calcula progresso base da semana inteira
      let total = 0; let comp = 0;
      processedWorkouts.forEach(d => {
        total += d.exercises.length;
        comp += d.exercises.filter(e => e.completed).length;
      });
      const progress = total > 0 ? Math.round((comp / total) * 100) : 0;

      if (profile) {
        set({
          currentStudent: {
            id: profile.id,
            name: profile.name,
            email: profile.email || '', // Na V2 real o email pode não estar no profile, só no user.
            weeklyProgress: progress,
            workouts: processedWorkouts
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  markExerciseComplete: async (dayId: string, exerciseId: string) => {
    const state = get();
    if (!state.currentStudent) return;

    let newToggleState = true;

    // 1. Optimistic Update Local no UI (Imediato)
    const updatedWorkouts = state.currentStudent.workouts.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.map(ex => {
            if (ex.id === exerciseId) {
              newToggleState = !ex.completed;
              return { ...ex, completed: newToggleState };
            }
            return ex;
          })
        };
      }
      return day;
    });

    // Recalcular métricas pós update UI
    let total = 0; let comp = 0;
    updatedWorkouts.forEach(d => {
      total += d.exercises.length;
      comp += d.exercises.filter(e => e.completed).length;
    });
    const progress = total > 0 ? Math.round((comp / total) * 100) : 0;

    set({
      currentStudent: {
        ...state.currentStudent,
        workouts: updatedWorkouts,
        weeklyProgress: progress
      }
    });

    // 2. Firing request ao backend paralalelo, sem travar (Sem await que segure tela)
    supabase.from('workout_exercises').update({ completed: newToggleState }).eq('id', exerciseId).then(({ error }) => {
      if (error) {
        console.error("Falha ao salvar completion no supabase", error);
        // Na vida real a gente daria Rollback do state se falhasse. 
        // Mas como MVP, confiamos na rede do usuário.
      }
    });
  },

}));
