
import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Crop as CropIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadCropProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  aspectRatio?: number;
}

const ImageUploadCrop = ({ onImageUploaded, currentImage, aspectRatio = 1 }: ImageUploadCropProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsDialogOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Calculate optimal canvas size for high quality
      const pixelRatio = window.devicePixelRatio || 1;
      const canvasWidth = crop.width * pixelRatio;
      const canvasHeight = crop.height * pixelRatio;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Scale the context for high DPI displays
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      // Set canvas size for CSS
      canvas.style.width = `${crop.width}px`;
      canvas.style.height = `${crop.height}px`;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            }
          },
          'image/webp', // Use WebP for better compression and quality
          0.95 // High quality
        );
      });
    },
    []
  );

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current || !selectedFile) return;

    setIsUploading(true);

    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Create a new file from the cropped blob
      const fileExt = 'webp'; // Use WebP for better quality
      const croppedFile = new File([croppedImageBlob], `${selectedFile.name.split('.')[0]}.${fileExt}`, {
        type: 'image/webp',
      });

      // Upload to Supabase Storage
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      console.log('Uploading to bucket: product-images, path:', filePath);

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, croppedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);

      onImageUploaded(urlData.publicUrl);
      setIsDialogOpen(false);
      setSelectedFile(null);
      setImageSrc('');
      
      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بجودة عالية",
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message || "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          اختر صورة
        </Button>
        
        {currentImage && (
          <div className="flex items-center gap-2">
            <img
              src={currentImage}
              alt="Current"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-sm text-gray-600">الصورة الحالية</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="hidden"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>قص الصورة الرئيسية</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {imageSrc && (
              <div className="flex flex-col items-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  className="max-h-96"
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    className="max-h-96 w-auto"
                    style={{ maxHeight: '400px' }}
                  />
                </ReactCrop>
                <p className="text-sm text-gray-600 mt-2">
                  سيتم حفظ الصورة بجودة عالية باستخدام تقنية WebP
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                إلغاء
              </Button>
              <Button
                onClick={handleCropComplete}
                disabled={!completedCrop || isUploading}
              >
                <CropIcon className="w-4 h-4 mr-2" />
                {isUploading ? 'جاري الرفع...' : 'رفع الصورة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUploadCrop;
