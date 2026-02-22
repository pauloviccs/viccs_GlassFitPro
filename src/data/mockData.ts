import { Exercise, User, WeeklyWorkout, WeekDay } from '@/types';

export const mockExercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Supino Reto',
    description: 'Exercício para peitoral com barra no banco reto',
    muscleGroup: 'Peito',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
    defaultSets: 4,
    defaultReps: 12,
  },
  {
    id: 'ex2',
    name: 'Agachamento Livre',
    description: 'Exercício composto para pernas com barra',
    muscleGroup: 'Pernas',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/ultWZbUMPL8',
    defaultSets: 4,
    defaultReps: 10,
  },
  {
    id: 'ex3',
    name: 'Puxada Frontal',
    description: 'Exercício para costas na polia alta',
    muscleGroup: 'Costas',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: 12,
  },
  {
    id: 'ex4',
    name: 'Desenvolvimento Militar',
    description: 'Exercício para ombros com barra ou halteres',
    muscleGroup: 'Ombros',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: 10,
  },
  {
    id: 'ex5',
    name: 'Rosca Direta',
    description: 'Exercício isolado para bíceps com barra',
    muscleGroup: 'Bíceps',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: 12,
  },
  {
    id: 'ex6',
    name: 'Tríceps Testa',
    description: 'Exercício isolado para tríceps com barra EZ',
    muscleGroup: 'Tríceps',
    imageUrl: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=400&h=300&fit=crop',
    defaultSets: 3,
    defaultReps: 12,
  },
  {
    id: 'ex7',
    name: 'Leg Press 45°',
    description: 'Exercício para pernas na máquina leg press',
    muscleGroup: 'Pernas',
    imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop',
    defaultSets: 4,
    defaultReps: 12,
  },
  {
    id: 'ex8',
    name: 'Remada Curvada',
    description: 'Exercício para costas com barra',
    muscleGroup: 'Costas',
    imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&h=300&fit=crop',
    defaultSets: 4,
    defaultReps: 10,
  },
];

export const mockStudents: User[] = [
  { id: 'st1', name: 'Paulo Silva', email: 'paulo@email.com', role: 'student', createdAt: '2024-01-15' },
  { id: 'st2', name: 'Maria Santos', email: 'maria@email.com', role: 'student', createdAt: '2024-02-10' },
  { id: 'st3', name: 'João Oliveira', email: 'joao@email.com', role: 'student', createdAt: '2024-03-05' },
  { id: 'st4', name: 'Ana Costa', email: 'ana@email.com', role: 'student', createdAt: '2024-03-20' },
  { id: 'st5', name: 'Carlos Mendes', email: 'carlos@email.com', role: 'student', createdAt: '2024-04-01' },
];

export const mockAdmin: User = {
  id: 'admin1',
  name: 'Professor Rafael',
  email: 'rafael@lumia.com',
  role: 'admin',
  createdAt: '2023-06-01',
};

const days: WeekDay[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

export const mockWeeklyWorkout: WeeklyWorkout = {
  id: 'wk1',
  studentId: 'st1',
  studentName: 'Paulo Silva',
  weekStart: '2026-02-16',
  days: [
    {
      day: 'Seg',
      exercises: [
        { id: 'we1', exerciseId: 'ex1', exercise: mockExercises[0], sets: 4, reps: 12, completed: true },
        { id: 'we2', exerciseId: 'ex5', exercise: mockExercises[4], sets: 3, reps: 12, completed: true },
        { id: 'we3', exerciseId: 'ex6', exercise: mockExercises[5], sets: 3, reps: 12, completed: false },
      ],
    },
    {
      day: 'Ter',
      exercises: [
        { id: 'we4', exerciseId: 'ex2', exercise: mockExercises[1], sets: 4, reps: 10, completed: false },
        { id: 'we5', exerciseId: 'ex7', exercise: mockExercises[6], sets: 4, reps: 12, completed: false },
      ],
    },
    {
      day: 'Qua',
      exercises: [
        { id: 'we6', exerciseId: 'ex3', exercise: mockExercises[2], sets: 3, reps: 12, completed: false },
        { id: 'we7', exerciseId: 'ex8', exercise: mockExercises[7], sets: 4, reps: 10, completed: false },
      ],
    },
    {
      day: 'Qui',
      exercises: [
        { id: 'we8', exerciseId: 'ex4', exercise: mockExercises[3], sets: 3, reps: 10, completed: false },
        { id: 'we9', exerciseId: 'ex5', exercise: mockExercises[4], sets: 3, reps: 12, completed: false },
        { id: 'we10', exerciseId: 'ex6', exercise: mockExercises[5], sets: 3, reps: 12, completed: false },
      ],
    },
    {
      day: 'Sex',
      exercises: [
        { id: 'we11', exerciseId: 'ex2', exercise: mockExercises[1], sets: 4, reps: 10, completed: false },
        { id: 'we12', exerciseId: 'ex7', exercise: mockExercises[6], sets: 4, reps: 12, completed: false },
        { id: 'we13', exerciseId: 'ex3', exercise: mockExercises[2], sets: 3, reps: 12, completed: false },
      ],
    },
  ],
};

export const mockAllWorkouts: WeeklyWorkout[] = [
  mockWeeklyWorkout,
  {
    id: 'wk2',
    studentId: 'st2',
    studentName: 'Maria Santos',
    weekStart: '2026-02-16',
    days: days.map((day, i) => ({
      day,
      exercises: mockExercises.slice(i % 3, (i % 3) + 2).map((ex, j) => ({
        id: `wk2-${day}-${j}`,
        exerciseId: ex.id,
        exercise: ex,
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        completed: false,
      })),
    })),
  },
];
