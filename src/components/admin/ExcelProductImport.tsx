
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExcelProductData {
  name: string;
  stock_quantity: number;
  price: number;
}

const ExcelProductImport = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const validateExcelRow = (row: any, rowIndex: number): { isValid: boolean; errors: string[]; data?: ExcelProductData } => {
    const errors: string[] = [];
    
    // Column A - Product Name
    const name = row[0]?.toString()?.trim();
    if (!name) {
      errors.push(`الصف ${rowIndex + 1}: اسم المنتج مطلوب (العمود A)`);
    }
    
    // Column C - Stock Quantity
    const stockQuantity = parseInt(row[2]);
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      errors.push(`الصف ${rowIndex + 1}: كمية المخزون يجب أن تكون رقم صحيح غير سالب (العمود C)`);
    }
    
    // Column E - Price
    const price = parseFloat(row[4]);
    if (isNaN(price) || price <= 0) {
      errors.push(`الصف ${rowIndex + 1}: السعر يجب أن يكون رقم موجب (العمود E)`);
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    return {
      isValid: true,
      errors: [],
      data: {
        name,
        stock_quantity: stockQuantity,
        price
      }
    };
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setImportResults(null);

    try {
      // Read Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Remove header row if exists
      const dataRows = jsonData.slice(1).filter(row => row && Array.isArray(row) && row.some(cell => cell !== undefined && cell !== ''));

      if (dataRows.length === 0) {
        throw new Error('لا توجد بيانات في الملف');
      }

      console.log('Processing Excel data:', dataRows.length, 'rows');

      const validProducts: ExcelProductData[] = [];
      const allErrors: string[] = [];
      let processedCount = 0;

      // Validate all rows first
      for (let i = 0; i < dataRows.length; i++) {
        const validation = validateExcelRow(dataRows[i], i);
        
        if (validation.isValid && validation.data) {
          validProducts.push(validation.data);
        } else {
          allErrors.push(...validation.errors);
        }
        
        processedCount++;
        setProgress((processedCount / dataRows.length) * 50); // First 50% for validation
      }

      if (validProducts.length === 0) {
        throw new Error('لا توجد منتجات صالحة للاستيراد');
      }

      // Insert valid products into database
      let successfulImports = 0;
      const insertErrors: string[] = [];

      for (let i = 0; i < validProducts.length; i++) {
        try {
          const product = validProducts[i];
          
          const { error } = await supabase
            .from('products')
            .insert({
              name: product.name,
              price: product.price,
              stock_quantity: product.stock_quantity,
              description: `منتج مستورد من ملف Excel - ${new Date().toLocaleDateString('ar')}`,
              is_active: true,
              categories: [],
              subcategories: [],
              images: [],
              colors: [],
              options: []
            });

          if (error) {
            console.error('Error inserting product:', error);
            insertErrors.push(`فشل في إدراج المنتج "${product.name}": ${error.message}`);
          } else {
            successfulImports++;
          }
        } catch (error) {
          console.error('Unexpected error:', error);
          insertErrors.push(`خطأ غير متوقع في المنتج "${validProducts[i].name}"`);
        }
        
        // Update progress (second 50% for database insertion)
        setProgress(50 + ((i + 1) / validProducts.length) * 50);
      }

      // Set final results
      setImportResults({
        total: dataRows.length,
        successful: successfulImports,
        failed: dataRows.length - successfulImports,
        errors: [...allErrors, ...insertErrors]
      });

      if (successfulImports > 0) {
        toast({
          title: "تم استيراد المنتجات بنجاح",
          description: `تم إضافة ${successfulImports} منتج من أصل ${dataRows.length}`,
        });
      }

    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast({
        title: "خطأ في معالجة الملف",
        description: error.message || "حدث خطأ أثناء معالجة ملف Excel",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار ملف Excel (.xlsx أو .xls)",
        variant: "destructive",
      });
      return;
    }

    processExcelFile(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          استيراد المنتجات من ملف Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>تنسيق الملف المطلوب:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• العمود A: أسماء المنتجات</li>
              <li>• العمود B: فارغ (محجوز للاستخدام المستقبلي)</li>
              <li>• العمود C: كمية المخزون (رقم صحيح)</li>
              <li>• العمود D: فارغ (محجوز للاستخدام المستقبلي)</li>
              <li>• العمود E: أسعار المنتجات (رقم)</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              بعد الاستيراد، ستحتاج لفتح كل منتج وإضافة الصور والفئات يدوياً.
            </p>
          </AlertDescription>
        </Alert>

        {/* File Upload */}
        <div className="space-y-4">
          <Label htmlFor="excel-file">اختر ملف Excel</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="cursor-pointer"
          />
          
          {!isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="w-4 h-4" />
              <span>يدعم ملفات .xlsx و .xls</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>جاري معالجة الملف...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Results */}
        {importResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{importResults.total}</div>
                  <div className="text-sm text-muted-foreground">إجمالي الصفوف</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{importResults.successful}</div>
                  <div className="text-sm text-muted-foreground">تم بنجاح</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                  <div className="text-sm text-muted-foreground">فشل</div>
                </CardContent>
              </Card>
            </div>

            {importResults.successful > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  تم استيراد {importResults.successful} منتج بنجاح! يمكنك الآن فتح كل منتج وإضافة الصور والفئات.
                </AlertDescription>
              </Alert>
            )}

            {importResults.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <details>
                    <summary className="cursor-pointer font-medium">
                      عرض الأخطاء ({importResults.errors.length})
                    </summary>
                    <ul className="mt-2 space-y-1 text-sm">
                      {importResults.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importResults.errors.length > 10 && (
                        <li>... و {importResults.errors.length - 10} أخطاء أخرى</li>
                      )}
                    </ul>
                  </details>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelProductImport;
