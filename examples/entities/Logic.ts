import { Entity } from '../../src/types';

export const Logic: Entity = {
  name: 'Logic',
  methods: {
    if: async (
      parameters: {
        left_operand: any;
        right_operand: any;
        operator: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
        then: any[];
        else: any[];
      },
      state: Record<number, any[]>
    ) => {
      let leftValue = parameters.left_operand;
      let rightValue = parameters.right_operand;
      
      // If left_operand is a string that might reference a variable
      // For example 'message.type' from a loop iteration
      if (typeof leftValue === 'string' && leftValue.includes('.')) {
        try {
          // This is a simplified version - in a real implementation, 
          // you would need a more robust variable resolution system
          const parts = leftValue.split('.');
          // For this example, we assume the first part is a variable from a loop
          // and is accessible as a property in the "context" or somewhere similar
          // This logic would need to be adapted to the actual execution context
          
          // For now, return a mock value for the example
          if (leftValue === 'message.type') {
            leftValue = 'text'; // Mocking a value for example purposes
          }
        } catch (error) {
          console.error(`Error evaluating left_operand '${leftValue}':`, error);
        }
      }
      
      // Do the same for right_operand if needed
      if (typeof rightValue === 'string' && rightValue.includes('.')) {
        // Similar logic as above
      }

      let result = false;

      switch (parameters.operator) {
        case 'EQUAL':
          result = leftValue === rightValue;
          break;
        case 'NOT_EQUAL':
          result = leftValue !== rightValue;
          break;
        case 'GREATER_THAN':
          result = leftValue > rightValue;
          break;
        case 'LESS_THAN':
          result = leftValue < rightValue;
          break;
        case 'CONTAINS':
          if (typeof leftValue === 'string' && typeof rightValue === 'string') {
            result = leftValue.includes(rightValue);
          } else if (Array.isArray(leftValue)) {
            result = leftValue.includes(rightValue);
          }
          break;
      }

      return {
        result,
        executed: result ? 'then' : 'else',
        branch: result ? parameters.then : parameters.else,
      };
    },
  },
};
