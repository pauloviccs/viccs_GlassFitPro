import { useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Check, Play, ChevronRight, X } from 'lucide-react';
import { WorkoutExercise } from '@/types';
import { cn, getYoutubeThumbnail } from '@/lib/utils';

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  try {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
    }
    if (url.includes('youtube.com/embed/')) {
      return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }
    return url;
  } catch {
    return url;
  }
};

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise;
  onToggleComplete: (id: string) => void;
}

export function ExerciseCard({ workoutExercise, onToggleComplete }: ExerciseCardProps) {
  const { exercise, sets, reps, completed, id } = workoutExercise;
  const [showVideo, setShowVideo] = useState(false);

  // Swipe to Complete Logic
  const x = useMotionValue(0);
  const controls = useAnimation();
  const swipeThreshold = 100;
  const containerRef = useRef<HTMLDivElement>(null);

  // Visual effects based on drag position
  const opacity = useTransform(x, [0, swipeThreshold], [0.3, 1]);
  const scale = useTransform(x, [0, swipeThreshold], [0.8, 1]);
  const background = useTransform(
    x,
    [0, swipeThreshold],
    ["rgba(255, 255, 255, 0)", "rgba(34, 197, 94, 0.2)"]
  );

  const handleDragEnd = async (e: any, { offset, velocity }: any) => {
    if (offset.x > swipeThreshold || velocity.x > 500) {
      if (!completed) {
        onToggleComplete(id);
      }
      await controls.start({ x: 0, transition: { type: "spring", bounce: 0, duration: 0.4 } });
    } else {
      await controls.start({ x: 0, transition: { type: "spring", bounce: 0.5, duration: 0.5 } });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'glass rounded-2xl overflow-hidden transition-all duration-300 relative',
        completed && 'ring-1 ring-success/30 scale-[0.98]'
      )}
    >
      {/* Background Action Area for Swipe */}
      {!completed && (
        <motion.div
          className="absolute inset-0 flex items-center justify-start pl-8 z-0"
          style={{ background }}
        >
          <motion.div style={{ opacity, scale }} className="text-success flex flex-col items-center">
            <Check className="w-8 h-8" />
            <span className="text-xs font-bold mt-1 uppercase tracking-wider">Concluído</span>
          </motion.div>
        </motion.div>
      )}

      {/* Swipeable foreground container */}
      <motion.div
        ref={containerRef}
        drag={!completed ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="relative z-10 bg-background/95 backdrop-blur-xl h-full flex flex-col"
      >
        {/* Image / Video Area */}
        <div className="relative h-44 overflow-hidden shrink-0">
          <AnimatePresence mode="wait">
            {showVideo && exercise.videoUrl ? (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 bg-black"
                onPointerDownCapture={(e) => e.stopPropagation()} // Impede o drag sobre o vídeo
              >
                <iframe
                  src={getEmbedUrl(exercise.videoUrl)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            ) : (
              <motion.img
                key="image"
                src={getYoutubeThumbnail(exercise.videoUrl, exercise.imageUrl)}
                alt={exercise.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          {exercise.videoUrl && (
            <motion.button
              onPointerDownCapture={(e) => e.stopPropagation()}
              onClick={() => setShowVideo(!showVideo)}
              className="absolute top-3 right-3 z-30 glass rounded-full p-2 hover:scale-105 transition-transform bg-black/40 hover:bg-black/60 shadow-xl border border-white/10"
            >
              {showVideo ? <X className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
            </motion.button>
          )}

          {completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-success/10 flex items-center justify-center backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="bg-success rounded-full p-3 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
              >
                <Check className="w-6 h-6 text-success-foreground" />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{exercise.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{exercise.muscleGroup}</p>
          </div>

          <div className="flex gap-3">
            <div className="glass-subtle rounded-xl px-3 py-1.5 text-center flex-1">
              <p className="text-xs text-muted-foreground">Séries</p>
              <p className="text-sm font-bold text-foreground">{sets}</p>
            </div>
            <div className="glass-subtle rounded-xl px-3 py-1.5 text-center flex-1">
              <p className="text-xs text-muted-foreground">Reps</p>
              <p className="text-sm font-bold text-foreground">{reps}</p>
            </div>
          </div>

          {/* Swipe Hint or Completed Action */}
          <div className="pt-2">
            {completed ? (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onToggleComplete(id)}
                className="w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-300 bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-1 focus:ring-ring"
              >
                Desfazer conclusão
              </motion.button>
            ) : (
              <div className="w-full relative h-10 rounded-xl glass-subtle flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute left-4"
                >
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </motion.div>
                Deslize para a direita para concluir
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
