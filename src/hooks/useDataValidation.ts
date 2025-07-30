import { useState, useCallback } from 'react';
import { advancedDataService } from '../services/advancedDataService';
import { Employee, LeaveRequest } from '../types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface ValidationState {
  loading: boolean;
  lastValidation: ValidationResult | null;
}

export function useDataValidation() {
  const [state, setState] = useState<ValidationState>({
    loading: false,
    lastValidation: null
  });

  const validateEmployee = useCallback(async (employee: Employee): Promise<ValidationResult> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = advancedDataService.validateEmployeeData(employee);
      setState({ loading: false, lastValidation: result });
      return result;
    } catch (error) {
      const errorResult = { 
        valid: false, 
        errors: [error instanceof Error ? error.message : 'Validation failed'] 
      };
      setState({ loading: false, lastValidation: errorResult });
      return errorResult;
    }
  }, []);

  const validateLeaveRequest = useCallback(async (request: LeaveRequest): Promise<ValidationResult> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = advancedDataService.validateLeaveRequest(request);
      setState({ loading: false, lastValidation: result });
      return result;
    } catch (error) {
      const errorResult = { 
        valid: false, 
        errors: [error instanceof Error ? error.message : 'Validation failed'] 
      };
      setState({ loading: false, lastValidation: errorResult });
      return errorResult;
    }
  }, []);

  const validateBatch = useCallback(async <T>(
    items: T[],
    validator: (item: T) => Promise<ValidationResult>
  ): Promise<{ validItems: T[]; invalidItems: Array<{ item: T; errors: string[] }> }> => {
    setState(prev => ({ ...prev, loading: true }));
    
    const validItems: T[] = [];
    const invalidItems: Array<{ item: T; errors: string[] }> = [];

    try {
      for (const item of items) {
        const result = await validator(item);
        if (result.valid) {
          validItems.push(item);
        } else {
          invalidItems.push({ item, errors: result.errors });
        }
      }

      setState({ loading: false, lastValidation: null });
      return { validItems, invalidItems };
    } catch (error) {
      setState({ loading: false, lastValidation: null });
      throw error;
    }
  }, []);

  const performDataIntegrityCheck = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await advancedDataService.performDataIntegrityCheck();
      setState({ loading: false, lastValidation: null });
      return result;
    } catch (error) {
      setState({ loading: false, lastValidation: null });
      throw error;
    }
  }, []);

  return {
    ...state,
    validateEmployee,
    validateLeaveRequest,
    validateBatch,
    performDataIntegrityCheck
  };
}