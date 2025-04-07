import { Entity, Node } from '../../src/types';

export const Loop: Entity = {
  name: 'Loop',
  methods: {
    foreach: async (
      parameters: {
        iterator: string; // Path to the array in the state
        of: string; // Name of the variable to use in the loop
        do: Node[]; // Nodes to execute for each item
      },
      state: Record<number, any[]>
    ) => {
      // Parse the iterator path
      // The format can be like "node[0].messages"
      let array;
      
      if (parameters.iterator.startsWith('node[')) {
        // Extract the node index and property path
        const match = parameters.iterator.match(/^node\[(\d+)\](?:\.(.+))?$/);
        if (match) {
          const [_, nodeIndex, propPath] = match;
          const nodeData = state[0][parseInt(nodeIndex)];
          
          if (!nodeData) {
            throw new Error(`Node at index ${nodeIndex} not found in state`);
          }
          
          if (propPath) {
            // Navigate to nested property
            const propParts = propPath.split('.');
            let value = nodeData;
            for (const part of propParts) {
              value = value[part];
              if (value === undefined) {
                throw new Error(`Property '${part}' not found in path '${propPath}'`);
              }
            }
            array = value;
          } else {
            array = nodeData;
          }
        } else {
          throw new Error(`Invalid iterator format: ${parameters.iterator}`);
        }
      } else {
        throw new Error(`Unsupported iterator format: ${parameters.iterator}`);
      }

      if (!Array.isArray(array)) {
        throw new Error(`Iterator '${parameters.iterator}' does not evaluate to an array`);
      }

      const results = [];

      // In a real implementation, you'd execute the nodes in the 'do' array for each item
      // Here we're just returning a placeholder
      for (const item of array) {
        results.push({
          [parameters.of]: item,
          executed: true
        });
      }

      return {
        count: array.length,
        results,
      };
    },
  },
};
