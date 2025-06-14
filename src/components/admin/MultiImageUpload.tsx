
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Plus, Crop } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const MultiImageUpload = ({ images, onImagesChange, maxImages = 10 }: MultiImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to crop size for better quality
    canvas.width = crop.width;
    canvas.height = crop.height;

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

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
        'image/jpeg',
        0.95 // High quality JPEG
      );
    });
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    console.log('Uploading to bucket: product-images, path:', filePath);

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
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
    return urlData.publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "عدد الصور كبير",
        description: `يمكنك رفع ${maxImages} صور كحد أقصى`,
        variant: "destructive",
      });
      return;
    }

    // Process files one by one for cropping
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImageSrc(reader.result as string);
        setCurrentFile(file);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
      break; // Process one file at a time
    }
  };

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current || !currentFile) return;

    setIsUploading(true);

    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Create a new file from the cropped blob
      const croppedFile = new File([croppedImageBlob], currentFile.name, {
        type: 'image/jpeg',
      });

      const uploadedUrl = await uploadImage(croppedFile);
      onImagesChange([...images, uploadedUrl]);

      setCropDialogOpen(false);
      setCurrentFile(null);
      setCurrentImageSrc('');
      
      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح",
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "عدد الصور كبير",
        description: `يمكنك رفع ${maxImages} صور كحد أقصى`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = files.map(uploadImage);
      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);

      toast({
        title: "تم رفع الصور",
        description: `تم رفع ${uploadedUrls.length} صورة بنجاح`,
      });

    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "خطأ في رفع الصور",
        description: error.message || "حدث خطأ أثناء رفع الصور",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // Extract file path from URL for deletion
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // Get products/filename.ext
      
      // Delete from storage
      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
      }
    } catch (error) {
      console.error('Error parsing image URL for deletion:', error);
    }

    // Remove from local state
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`صورة ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">إضافة صورة</span>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Crop className="w-4 h-4" />
          {isUploading ? 'جاري الرفع...' : 'رفع مع القص'}
        </Button>
        
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleDirectUpload}
          className="hidden"
          id="direct-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('direct-upload')?.click()}
          disabled={isUploading || images.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          رفع مباشر
        </Button>
        
        <span className="text-sm text-gray-500">
          {images.length} / {maxImages} صور
        </span>
      </div>

      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>قص الصورة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentImageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
                className="max-h-96"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={currentImageSrc}
                  className="max-h-96 w-auto"
                />
              </ReactCrop>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCropDialogOpen(false)}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                إلغاء
              </Button>
              <Button
                onClick={handleCropComplete}
                disabled={!completedCrop || isUploading}
              >
                <Crop className="w-4 h-4 mr-2" />
                {isUploading ? 'جاري الرفع...' : 'رفع الصورة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiImageUpload;
