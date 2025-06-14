
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { ProductOption } from '@/types';

interface ProductOptionsManagerProps {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
  mainProductPrice: number;
}

const ProductOptionsManager = ({ options, onChange, mainProductPrice }: ProductOptionsManagerProps) => {
  const addOption = () => {
    const newOption: ProductOption = {
      name: '',
      price: undefined // Will use main product price
    };
    onChange([...options, newOption]);
  };

  const updateOption = (index: number, field: keyof ProductOption, value: string | number | undefined) => {
    const updatedOptions = [...options];
    
    if (field === 'price') {
      // Handle price field specifically
      if (value === '' || value === null || value === undefined) {
        updatedOptions[index].price = undefined;
      } else {
        const numericValue = typeof value === 'string' ? parseInt(value) : value;
        updatedOptions[index].price = isNaN(numericValue) ? undefined : numericValue;
      }
    } else {
      updatedOptions[index][field] = value as string;
    }
    
    onChange(updatedOptions);
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    onChange(updatedOptions);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  const getDisplayPrice = (option: ProductOption) => {
    return option.price !== undefined ? option.price : mainProductPrice;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">خيارات المنتج (الألوان، الأحجام، إلخ)</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addOption}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة خيار
        </Button>
      </div>

      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد خيارات حالياً. اضغط "إضافة خيار" لإضافة خيار جديد.</p>
      ) : (
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex gap-3 items-end p-3 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <Label htmlFor={`option-name-${index}`} className="text-sm">
                  اسم الخيار *
                </Label>
                <Input
                  id={`option-name-${index}`}
                  value={option.name}
                  onChange={(e) => updateOption(index, 'name', e.target.value)}
                  placeholder="مثال: أحمر، كبير، إلخ"
                  required
                />
              </div>
              
              <div className="flex-1">
                <Label htmlFor={`option-price-${index}`} className="text-sm">
                  السعر (د.ع) - اختياري
                </Label>
                <Input
                  id={`option-price-${index}`}
                  type="number"
                  step="1"
                  value={option.price !== undefined ? option.price.toString() : ''}
                  onChange={(e) => updateOption(index, 'price', e.target.value)}
                  placeholder={`افتراضي: ${formatPrice(mainProductPrice)}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  السعر الحالي: {formatPrice(getDisplayPrice(option))}
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeOption(index)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {options.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p>💡 نصيحة: إذا تركت حقل السعر فارغاً، سيستخدم سعر المنتج الأساسي ({formatPrice(mainProductPrice)}).</p>
        </div>
      )}
    </div>
  );
};

export default ProductOptionsManager;
