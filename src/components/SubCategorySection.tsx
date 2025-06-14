
import React from 'react';
import { Button } from '@/components/ui/button';

interface SubCategory {
  id: string;
  name: string;
  icon: string;
}

interface SubCategorySectionProps {
  subcategories: SubCategory[];
  selectedSubcategory: string | null;
  onSubcategorySelect: (subcategory: string | null) => void;
}

const SubCategorySection = ({ subcategories, selectedSubcategory, onSubcategorySelect }: SubCategorySectionProps) => {
  console.log('SubCategorySection received subcategories:', subcategories);
  
  if (!subcategories || subcategories.length === 0) {
    console.log('No subcategories to display');
    return null;
  }

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">الفئات الفرعية</h3>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant={selectedSubcategory === null ? "default" : "outline"}
          className={`transition-all duration-200 ${
            selectedSubcategory === null 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
              : 'hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:border-pink-300'
          }`}
          onClick={() => onSubcategorySelect(null)}
        >
          جميع الفئات الفرعية
        </Button>
        
        {subcategories.map((subcategory) => (
          <Button
            key={subcategory.id}
            variant={selectedSubcategory === subcategory.id ? "default" : "outline"}
            className={`transition-all duration-200 ${
              selectedSubcategory === subcategory.id 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                : 'hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:border-pink-300'
            }`}
            onClick={() => onSubcategorySelect(subcategory.id)}
          >
            <span className="mr-2">{subcategory.icon}</span>
            {subcategory.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SubCategorySection;
