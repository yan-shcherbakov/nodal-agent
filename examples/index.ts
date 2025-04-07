import { NodalRunner } from '../src/NodeRunner';
import { Node } from '../src/types';
import { Telegram } from './entities/Telegram';
import { Logic } from './entities/Logic';
import { Loop } from './entities/Loop';

// Define the workflow
const workflow: Node[] = [
  {
    name: 'Check Telegram for messages',
    entity: 'Telegram',
    method: 'get_messages',
    parameters: {
      chatId: '12345',
    },
  },
  {
    name: 'Loop over each message',
    entity: 'Loop',
    method: 'foreach',
    parameters: {
      iterator: 'node[0].messages',
      of: 'message',
      do: [
        {
          name: 'Determine if Telegram message is voice or text',
          entity: 'Logic',
          method: 'if',
          parameters: {
            left_operand: 'message.type',
            right_operand: 'text',
            operator: 'EQUAL',
            then: [
              {
                name: 'Send text response',
                entity: 'Telegram',
                method: 'send_message',
                parameters: {
                  chatId: '12345',
                  text: 'I got your text message!',
                },
              },
            ],
            else: [
              {
                name: 'Send voice response',
                entity: 'Telegram',
                method: 'send_message',
                parameters: {
                  chatId: '12345',
                  text: 'I got your voice message!',
                },
              },
            ],
          },
        },
      ],
    },
  },
];

// Initialize the runner
const runner = new NodalRunner({
  entities: [Telegram, Logic, Loop],
});

// Run the workflow
runner
  .addWorkflow(workflow)
  .run({
    onError: (error, node) => {
      console.error(`Error executing node '${node.name}':`, error);
    },
    onCompleted: () => {
      console.log('Workflow completed successfully!');
      console.log('Final state:', JSON.stringify(runner.getCurrentState(), null, 2));
    },
  });
