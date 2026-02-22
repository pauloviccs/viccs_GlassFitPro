export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  imageUrl: string;
  videoUrl?: string;
  defaultSets: number;
  defaultReps: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  completed: boolean;
}

export type WeekDay = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';

export interface DayWorkout {
  day: WeekDay;
  exercises: WorkoutExercise[];
}

export interface WeeklyWorkout {
  id: string;
  studentId: string;
  studentName: string;
  weekStart: string;
  days: DayWorkout[];
}

export interface StudentProgress {
  totalExercises: number;
  completedExercises: number;
  percentage: number;
}
