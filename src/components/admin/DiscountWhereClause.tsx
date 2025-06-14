
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Filter } from 'lucide-react';

interface WhereCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface DiscountWhereClauseProps {
  onWhereChange: (conditions: WhereCondition[]) => void;
  availableFields: Array<{ value: string; label: string; type: string }>;
}

const DiscountWhereClause = ({ onWhereChange, availableFields }: DiscountWhereClauseProps) => {
  const [conditions, setConditions] = useState<WhereCondition[]>([]);

  const operators = {
    string: [
      { value: '=', label: 'يساوي' },
      { value: '!=', label: 'لا يساوي' },
      { value: 'LIKE', label: 'يحتوي على' },
      { value: 'NOT LIKE', label: 'لا يحتوي على' },
      { value: 'IN', label: 'ضمن القائمة' },
      { value: 'NOT IN', label: 'ليس ضمن القائمة' },
      { value: 'IS NULL', label: 'فارغ' },
      { value: 'IS NOT NULL', label: 'غير فارغ' }
    ],
    number: [
      { value: '=', label: 'يساوي' },
      { value: '!=', label: 'لا يساوي' },
      { value: '>', label: 'أكبر من' },
      { value: '>=', label: 'أكبر من أو يساوي' },
      { value: '<', label: 'أصغر من' },
      { value: '<=', label: 'أصغر من أو يساوي' },
      { value: 'BETWEEN', label: 'بين' },
      { value: 'IN', label: 'ضمن القائمة' },
      { value: 'NOT IN', label: 'ليس ضمن القائمة' }
    ],
    boolean: [
      { value: '=', label: 'يساوي' },
      { value: '!=', label: 'لا يساوي' }
    ],
    array: [
      { value: 'ANY', label: 'يحتوي على أي من' },
      { value: 'ALL', label: 'يحتوي على جميع' },
      { value: '@>', label: 'يحتوي على' },
      { value: '<@', label: 'محتوى في' },
      { value: '&&', label: 'تقاطع مع' },
      { value: '= ARRAY[]', label: 'مصفوفة فارغة' },
      { value: '!= ARRAY[]', label: 'مصفوفة غير فارغة' }
    ]
  };

  const addCondition = () => {
    const newCondition: WhereCondition = {
      id: `condition_${Date.now()}`,
      field: availableFields[0]?.value || '',
      operator: '=',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    };
    
    const updatedConditions = [...conditions, newCondition];
    setConditions(updatedConditions);
    onWhereChange(updatedConditions);
  };

  const removeCondition = (id: string) => {
    const updatedConditions = conditions.filter(c => c.id !== id);
    // Reset first condition's logical operator
    if (updatedConditions.length > 0) {
      updatedConditions[0].logicalOperator = undefined;
    }
    setConditions(updatedConditions);
    onWhereChange(updatedConditions);
  };

  const updateCondition = (id: string, updates: Partial<WhereCondition>) => {
    const updatedConditions = conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    setConditions(updatedConditions);
    onWhereChange(updatedConditions);
  };

  const getFieldType = (fieldValue: string) => {
    return availableFields.find(f => f.value === fieldValue)?.type || 'string';
  };

  const getOperatorsForField = (fieldValue: string) => {
    const fieldType = getFieldType(fieldValue);
    return operators[fieldType as keyof typeof operators] || operators.string;
  };

  const generateWherePreview = () => {
    if (conditions.length === 0) return 'لا توجد شروط';
    
    return conditions.map((condition, index) => {
      const field = availableFields.find(f => f.value === condition.field);
      const operator = getOperatorsForField(condition.field).find(op => op.value === condition.operator);
      
      let conditionText = `${field?.label || condition.field} ${operator?.label || condition.operator}`;
      
      if (!['IS NULL', 'IS NOT NULL', '= ARRAY[]', '!= ARRAY[]'].includes(condition.operator)) {
        conditionText += ` "${condition.value}"`;
      }
      
      if (condition.logicalOperator && index > 0) {
        conditionText = `${condition.logicalOperator} ${conditionText}`;
      }
      
      return conditionText;
    }).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          شروط التصفية المتقدمة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.map((condition, index) => (
          <div key={condition.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">شرط {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(condition.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {index > 0 && (
                <div>
                  <Label>المشغل المنطقي</Label>
                  <Select
                    value={condition.logicalOperator || 'AND'}
                    onValueChange={(value: 'AND' | 'OR') => 
                      updateCondition(condition.id, { logicalOperator: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">و (AND)</SelectItem>
                      <SelectItem value="OR">أو (OR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label>الحقل</Label>
                <Select
                  value={condition.field}
                  onValueChange={(value) => {
                    updateCondition(condition.id, { 
                      field: value,
                      operator: getOperatorsForField(value)[0]?.value || '='
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>المشغل</Label>
                <Select
                  value={condition.operator}
                  onValueChange={(value) => 
                    updateCondition(condition.id, { operator: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperatorsForField(condition.field).map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {!['IS NULL', 'IS NOT NULL', '= ARRAY[]', '!= ARRAY[]'].includes(condition.operator) && (
                <div>
                  <Label>القيمة</Label>
                  <Input
                    value={condition.value}
                    onChange={(e) => 
                      updateCondition(condition.id, { value: e.target.value })
                    }
                    placeholder="أدخل القيمة"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={addCondition}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            إضافة شرط جديد
          </Button>
          
          {conditions.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <Label className="text-sm font-medium">معاينة الشروط:</Label>
              <div className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border">
                {generateWherePreview()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscountWhereClause;
