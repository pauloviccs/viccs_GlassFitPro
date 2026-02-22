import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image, Video } from 'lucide-react';
import { AnimatedButton } from './AnimatedButton';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type?: 'image' | 'video' | 'both';
}

export function UploadModal({ isOpen, onClose, title, type = 'both' }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md"
          >
            <div className="glass-strong rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={() => setDragActive(false)}
                className={`
                  border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                `}
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground mb-1">
                  Arraste e solte aqui
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  ou clique para selecionar
                </p>

                <div className="flex gap-2 justify-center">
                  {(type === 'image' || type === 'both') && (
                    <AnimatedButton variant="secondary" size="sm">
                      <Image className="w-4 h-4 mr-1.5" />
                      Imagem
                    </AnimatedButton>
                  )}
                  {(type === 'video' || type === 'both') && (
                    <AnimatedButton variant="secondary" size="sm">
                      <Video className="w-4 h-4 mr-1.5" />
                      Vídeo
                    </AnimatedButton>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
