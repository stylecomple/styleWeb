
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WhereCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

type TableName = 'products' | 'categories' | 'subcategories' | 'active_discounts' | 'orders' | 'order_items' | 'profiles' | 'user_roles' | 'feedback' | 'changes_log' | 'admin_settings';

interface AdvancedQueryOptions {
  table: TableName;
  select?: string;
  whereConditions: WhereCondition[];
  orderBy?: { column: string; ascending: boolean };
  limit?: number;
}

export const useAdvancedDiscountQuery = (options: AdvancedQueryOptions) => {
  return useQuery({
    queryKey: ['advanced-discount-query', options],
    queryFn: async (): Promise<any[]> => {
      try {
        let query = supabase.from(options.table as any).select(options.select || '*');
        
        // Build complex WHERE clause
        if (options.whereConditions.length > 0) {
          options.whereConditions.forEach((condition) => {
            // Handle different operators
            switch (condition.operator) {
              case '=':
                query = query.eq(condition.field, condition.value);
                break;
              case '!=':
                query = query.neq(condition.field, condition.value);
                break;
              case '>':
                query = query.gt(condition.field, condition.value);
                break;
              case '>=':
                query = query.gte(condition.field, condition.value);
                break;
              case '<':
                query = query.lt(condition.field, condition.value);
                break;
              case '<=':
                query = query.lte(condition.field, condition.value);
                break;
              case 'LIKE':
                query = query.ilike(condition.field, `%${condition.value}%`);
                break;
              case 'NOT LIKE':
                query = query.not(condition.field, 'ilike', `%${condition.value}%`);
                break;
              case 'IN':
                const inValues = condition.value.split(',').map(v => v.trim());
                query = query.in(condition.field, inValues);
                break;
              case 'NOT IN':
                const notInValues = condition.value.split(',').map(v => v.trim());
                query = query.not(condition.field, 'in', notInValues);
                break;
              case 'IS NULL':
                query = query.is(condition.field, null);
                break;
              case 'IS NOT NULL':
                query = query.not(condition.field, 'is', null);
                break;
              case 'ANY':
              case '@>':
                query = query.contains(condition.field, [condition.value]);
                break;
              case '<@':
                query = query.containedBy(condition.field, condition.value.split(','));
                break;
              case '&&':
                query = query.overlaps(condition.field, condition.value.split(','));
                break;
              case 'BETWEEN':
                const [min, max] = condition.value.split(',').map(v => v.trim());
                if (min && max) {
                  query = query.gte(condition.field, min).lte(condition.field, max);
                }
                break;
              case '= ARRAY[]':
                query = query.eq(condition.field, []);
                break;
              case '!= ARRAY[]':
                query = query.not(condition.field, 'eq', []);
                break;
              default:
                query = query.eq(condition.field, condition.value);
            }
          });
        }
        
        // Apply ordering
        if (options.orderBy) {
          query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
        }
        
        // Apply limit
        if (options.limit) {
          query = query.limit(options.limit);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Advanced query error:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Query execution failed:', error);
        throw error;
      }
    },
    enabled: options.whereConditions.length > 0
  });
};
