import { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';

interface ImageCropperProps {
    image: string;
    aspectRatio: number;
    onCropComplete: (croppedAreaPixels: Area) => void;
    cropShape?: 'rect' | 'round';
}

export function ImageCropper({ image, aspectRatio, onCropComplete, cropShape = 'rect' }: ImageCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        onCropComplete(croppedAreaPixels);
    }, [onCropComplete]);

    return (
        <div className="relative w-full h-[400px] sm:h-[500px] bg-black/90">
            <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                cropShape={cropShape}
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
                classes={{
                    containerClassName: "rounded-xl overflow-hidden"
                }}
            />
            {/* Zoom hint or controls if needed could be added here, but Vaul/Mobile allows standard pinch */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
                <div className="glass-subtle px-4 py-2 rounded-full text-xs text-white/70 font-medium">
                    Mova e faça pinça para ajustar
                </div>
            </div>
        </div>
    );
}

// Utilitário auxiliar para extrair o Crop de forma funcional no DOM:
export const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob | null> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (error) => reject(error));
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', 0.9);
    });
};
