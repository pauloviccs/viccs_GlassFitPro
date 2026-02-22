import { create } from 'zustand';

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  videoUrl?: string;
  imageUrl?: string;
  completed: boolean;
};

export type WorkoutDay = {
  id: string;
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
  // Current Student State
  currentStudent: Student | null;
  setCurrentStudent: (student: Student) => void;
  markExerciseComplete: (dayId: string, exerciseId: string) => void;

  // Admin State
  students: Student[];
  exerciseLibrary: Omit<Exercise, 'completed' | 'id'>[];
  
  // Actions
  addStudent: (student: Student) => void;
  addExerciseToLibrary: (exercise: Omit<Exercise, 'completed' | 'id'>) => void;
  assignWorkoutToStudent: (studentId: string, workout: WorkoutDay) => void;
}

// Mock Data
const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Paulo Vinicios',
    email: 'paulo@viccs.com',
    weeklyProgress: 0,
    workouts: [
      {
        id: 'd1',
        dayOfWeek: 'Segunda-feira',
        exercises: [
          { id: 'e1', name: 'Supino Reto', sets: 4, reps: 10, completed: false },
          { id: 'e2', name: 'Crucifixo Inclinado', sets: 3, reps: 12, completed: false },
        ]
      },
      {
        id: 'd2',
        dayOfWeek: 'Terça-feira',
        exercises: [
          { id: 'e3', name: 'Agachamento Livre', sets: 4, reps: 8, completed: false },
          { id: 'e4', name: 'Leg Press 45', sets: 3, reps: 15, completed: false },
        ]
      }
    ]
  }
];

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  currentStudent: MOCK_STUDENTS[0],
  students: MOCK_STUDENTS,
  exerciseLibrary: [
    { name: 'Supino Reto', sets: 4, reps: 10 },
    { name: 'Agachamento Livre', sets: 4, reps: 8 },
    { name: 'Desenvolvimento c/ Halteres', sets: 3, reps: 12 },
  ],

  setCurrentStudent: (student) => set({ currentStudent: student }),

  markExerciseComplete: (dayId, exerciseId) => 
    set((state) => {
      if (!state.currentStudent) return state;

      const updatedWorkouts = state.currentStudent.workouts.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: day.exercises.map(ex => 
              ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
            )
          };
        }
        return day;
      });

      // Recalculate progress
      const totalExercises = updatedWorkouts.reduce((acc, day) => acc + day.exercises.length, 0);
      const completedExercises = updatedWorkouts.reduce((acc, day) => 
        acc + day.exercises.filter(ex => ex.completed).length, 0
      );
      
      const progress = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

      return {
        currentStudent: {
          ...state.currentStudent,
          workouts: updatedWorkouts,
          weeklyProgress: progress
        }
      };
    }),

  addStudent: (student) => set((state) => ({ students: [...state.students, student] })),
  
  addExerciseToLibrary: (exercise) => set((state) => ({ 
    exerciseLibrary: [...state.exerciseLibrary, exercise] 
  })),

  assignWorkoutToStudent: (studentId, workout) => set((state) => ({
    students: state.students.map(s => 
      s.id === studentId 
        ? { ...s, workouts: [...s.workouts, workout] }
        : s
    )
  }))
}));
