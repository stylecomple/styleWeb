import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Edit2, Check, ChevronDown, ChevronRight } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Subcategory {
  id: string;
  name: string;
  icon: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: Subcategory[];
}

const CategoryManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', icon: '', parentId: '' });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editCategoryData, setEditCategoryData] = useState({ name: '', icon: '' });
  const [editSubcategoryData, setEditSubcategoryData] = useState({ name: '', icon: '' });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch categories with subcategories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async ({ name, icon }: { name: string; icon: string }) => {
      const categoryId = name.toLowerCase().replace(/\s+/g, '_');
      
      const { error } = await supabase
        .from('categories')
        .insert({ id: categoryId, name: name.trim(), icon });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategory({ name: '', icon: '' });
      toast({
        title: 'تم إضافة الفئة',
        description: 'تم إضافة الفئة الجديدة بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إضافة الفئة',
        variant: 'destructive',
      });
    }
  });

  // Add subcategory mutation
  const addSubcategoryMutation = useMutation({
    mutationFn: async ({ name, icon, parentId }: { name: string; icon: string; parentId: string }) => {
      const subcategoryId = `${parentId}_${name.toLowerCase().replace(/\s+/g, '_')}`;
      
      const { error } = await supabase
        .from('subcategories')
        .insert({ 
          id: subcategoryId, 
          name: name.trim(), 
          icon, 
          category_id: parentId 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewSubcategory({ name: '', icon: '', parentId: '' });
      toast({
        title: 'تم إضافة الفئة الفرعية',
        description: 'تم إضافة الفئة الفرعية الجديدة بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إضافة الفئة الفرعية',
        variant: 'destructive',
      });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name, icon }: { id: string; name: string; icon: string }) => {
      const { error } = await supabase
        .from('categories')
        .update({ name: name.trim(), icon })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
      setEditCategoryData({ name: '', icon: '' });
      toast({
        title: 'تم تحديث الفئة',
        description: 'تم تحديث الفئة بنجاح',
      });
    }
  });

  // Update subcategory mutation
  const updateSubcategoryMutation = useMutation({
    mutationFn: async ({ id, name, icon }: { id: string; name: string; icon: string }) => {
      const { error } = await supabase
        .from('subcategories')
        .update({ name: name.trim(), icon })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingSubcategory(null);
      setEditSubcategoryData({ name: '', icon: '' });
      toast({
        title: 'تم تحديث الفئة الفرعية',
        description: 'تم تحديث الفئة الفرعية بنجاح',
      });
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'تم حذف الفئة',
        description: 'تم حذف الفئة وجميع فئاتها الفرعية بنجاح',
      });
    }
  });

  // Delete subcategory mutation
  const deleteSubcategoryMutation = useMutation({
    mutationFn: async (subcategoryId: string) => {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'تم حذف الفئة الفرعية',
        description: 'تم حذف الفئة الفرعية بنجاح',
      });
    }
  });

  const addCategory = () => {
    if (!newCategory.name.trim() || !newCategory.icon) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الفئة واختيار إيموجي',
        variant: 'destructive',
      });
      return;
    }

    addCategoryMutation.mutate({
      name: newCategory.name,
      icon: newCategory.icon
    });
  };

  const addSubcategory = () => {
    if (!newSubcategory.name.trim() || !newSubcategory.icon || !newSubcategory.parentId) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الفئة الفرعية واختيار إيموجي والفئة الرئيسية',
        variant: 'destructive',
      });
      return;
    }

    addSubcategoryMutation.mutate({
      name: newSubcategory.name,
      icon: newSubcategory.icon,
      parentId: newSubcategory.parentId
    });
  };

  const startEditingCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditCategoryData({ name: category.name, icon: category.icon });
  };

  const saveEditCategory = () => {
    if (!editCategoryData.name.trim() || !editCategoryData.icon || !editingCategory) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الفئة واختيار إيموجي',
        variant: 'destructive',
      });
      return;
    }

    updateCategoryMutation.mutate({
      id: editingCategory,
      name: editCategoryData.name,
      icon: editCategoryData.icon
    });
  };

  const startEditingSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory.id);
    setEditSubcategoryData({ name: subcategory.name, icon: subcategory.icon });
  };

  const saveEditSubcategory = () => {
    if (!editSubcategoryData.name.trim() || !editSubcategoryData.icon || !editingSubcategory) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الفئة الفرعية واختيار إيموجي',
        variant: 'destructive',
      });
      return;
    }

    updateSubcategoryMutation.mutate({
      id: editingSubcategory,
      name: editSubcategoryData.name,
      icon: editSubcategoryData.icon
    });
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>إدارة الفئات والفئات الفرعية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Main Category */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">إضافة فئة رئيسية جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="categoryName">اسم الفئة</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم الفئة"
              />
            </div>
            <div className="space-y-2">
              <Label>الإيموجي</Label>
              <div className="flex gap-2">
                <EmojiPicker
                  selectedEmoji={newCategory.icon}
                  onEmojiSelect={(emoji) => setNewCategory(prev => ({ ...prev, icon: emoji }))}
                />
                <span className="text-sm text-muted-foreground self-center">
                  {newCategory.icon ? `المحدد: ${newCategory.icon}` : 'لم يتم اختيار إيموجي'}
                </span>
              </div>
            </div>
            <Button onClick={addCategory} className="bg-pink-600 hover:bg-pink-700" disabled={addCategoryMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة فئة
            </Button>
          </div>
        </div>

        {/* Add Subcategory */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">إضافة فئة فرعية جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>الفئة الرئيسية</Label>
              <Select 
                value={newSubcategory.parentId} 
                onValueChange={(value) => setNewSubcategory(prev => ({ ...prev, parentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة الرئيسية" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategoryName">اسم الفئة الفرعية</Label>
              <Input
                id="subcategoryName"
                value={newSubcategory.name}
                onChange={(e) => setNewSubcategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم الفئة الفرعية"
              />
            </div>
            <div className="space-y-2">
              <Label>الإيموجي</Label>
              <EmojiPicker
                selectedEmoji={newSubcategory.icon}
                onEmojiSelect={(emoji) => setNewSubcategory(prev => ({ ...prev, icon: emoji }))}
              />
            </div>
            <Button onClick={addSubcategory} className="bg-blue-600 hover:bg-blue-700" disabled={addSubcategoryMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة فئة فرعية
            </Button>
          </div>
        </div>

        {/* Existing Categories */}
        <div className="space-y-2">
          <h3 className="font-medium">الفئات الموجودة</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-3">
                {/* Main Category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryExpansion(category.id)}
                      className="p-1"
                    >
                      {expandedCategories.has(category.id) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </Button>
                    
                    {editingCategory === category.id ? (
                      <div className="flex items-center gap-2">
                        <EmojiPicker
                          selectedEmoji={editCategoryData.icon}
                          onEmojiSelect={(emoji) => setEditCategoryData(prev => ({ ...prev, icon: emoji }))}
                        />
                        <Input
                          value={editCategoryData.name}
                          onChange={(e) => setEditCategoryData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-40"
                        />
                        <Button size="sm" onClick={saveEditCategory} disabled={updateCategoryMutation.isPending}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">({category.id})</span>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {category.subcategories.length} فئة فرعية
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  
                  {editingCategory !== category.id && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => startEditingCategory(category)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Subcategories */}
                {expandedCategories.has(category.id) && category.subcategories && (
                  <div className="mt-3 ml-8 space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        {editingSubcategory === subcategory.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <EmojiPicker
                              selectedEmoji={editSubcategoryData.icon}
                              onEmojiSelect={(emoji) => setEditSubcategoryData(prev => ({ ...prev, icon: emoji }))}
                            />
                            <Input
                              value={editSubcategoryData.name}
                              onChange={(e) => setEditSubcategoryData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-40"
                            />
                            <Button size="sm" onClick={saveEditSubcategory} disabled={updateSubcategoryMutation.isPending}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingSubcategory(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{subcategory.icon}</span>
                              <span className="font-medium">{subcategory.name}</span>
                              <span className="text-sm text-muted-foreground">({subcategory.id})</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => startEditingSubcategory(subcategory)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => deleteSubcategoryMutation.mutate(subcategory.id)}
                                disabled={deleteSubcategoryMutation.isPending}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
