export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  displayName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
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

export interface FeedLike {
  post_id: string;
  student_id: string;
  created_at: string;
}

export interface FeedComment {
  id: string;
  post_id: string;
  student_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export interface FeedPost {
  id: string;
  student_id: string;
  content: string;
  image_url?: string;
  post_date: string;
  created_at: string;

  // Joins that will come from the query
  profiles?: {
    name: string;
    display_name?: string;
    avatar_url?: string;
  };

  // Custom counters and booleans that we will attach when mapping
  likesCount?: number;
  isLikedByMe?: boolean;
  comments?: FeedComment[];
}
