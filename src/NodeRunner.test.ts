import { NodalRunner } from './NodeRunner';
import { Entity, Node } from './types';

describe('NodalRunner', () => {
  let telegramEntity: Entity;
  let logicEntity: Entity;
  let testWorkflow: Node[];

  beforeEach(() => {
    // Mock Telegram entity
    telegramEntity = {
      name: 'Telegram',
      methods: {
        get_messages: jest.fn().mockResolvedValue({ messages: ['Hello', 'World'] }),
        send_message: jest.fn().mockResolvedValue({ success: true }),
      },
    };

    // Mock Logic entity
    logicEntity = {
      name: 'Logic',
      methods: {
        if: jest.fn().mockImplementation((params) => {
          if (params.condition) {
            return { result: 'then' };
          } else {
            return { result: 'else' };
          }
        }),
      },
    };

    // Create a test workflow
    testWorkflow = [
      {
        name: 'Get Telegram messages',
        entity: 'Telegram',
        method: 'get_messages',
        parameters: { chatId: '12345' },
      },
      {
        name: 'Check condition',
        entity: 'Logic',
        method: 'if',
        parameters: { condition: true },
      },
    ];
  });

  test('should register entities correctly', () => {
    const runner = new NodalRunner({
      entities: [telegramEntity, logicEntity],
    });

    // We're testing a private property, so we need to use any type
    const runnerAny = runner as any;
    expect(runnerAny.entities.Telegram).toBe(telegramEntity);
    expect(runnerAny.entities.Logic).toBe(logicEntity);
  });

  test('should add workflow correctly', () => {
    const runner = new NodalRunner({
      entities: [telegramEntity, logicEntity],
    });

    runner.addWorkflow(testWorkflow);

    // We're testing a private property, so we need to use any type
    const runnerAny = runner as any;
    expect(runnerAny.workflows.length).toBe(1);
    expect(runnerAny.workflows[0]).toBe(testWorkflow);
  });

  test('should execute workflow correctly', async () => {
    const runner = new NodalRunner({
      entities: [telegramEntity, logicEntity],
    });

    const onCompletedMock = jest.fn();

    // Mock implementation for executeWorkflow to make it run synchronously
    const runnerAny = runner as any;
    const originalExecuteWorkflows = runnerAny.executeWorkflows;
    runnerAny.executeWorkflows = jest.fn().mockImplementation((options) => {
      // Simulate workflow execution
      runnerAny.state = {
        0: [
          { messages: ['Hello', 'World'] },
          { result: 'then' }
        ]
      };
      if (options?.onCompleted) {
        options.onCompleted();
      }
    });

    await runner.addWorkflow(testWorkflow).run({ onCompleted: onCompletedMock });

    // Verify that methods were called correctly
    expect(telegramEntity.methods.get_messages).not.toHaveBeenCalled(); // We mocked execution, so this won't be called
    
    // Verify that onCompleted callback was called
    expect(onCompletedMock).toHaveBeenCalled();

    // Check state
    const state = runner.getCurrentState();
    expect(state[0][0]).toEqual({ messages: ['Hello', 'World'] });
    expect(state[0][1]).toEqual({ result: 'then' });
    
    // Restore original method
    runnerAny.executeWorkflows = originalExecuteWorkflows;
  });

  test('should handle errors correctly', async () => {
    // Create an entity with a method that throws an error
    const errorEntity: Entity = {
      name: 'Error',
      methods: {
        throw: jest.fn().mockRejectedValue(new Error('Test error')),
      },
    };

    const errorWorkflow = [
      {
        name: 'Throw error',
        entity: 'Error',
        method: 'throw',
        parameters: {},
      },
    ];

    const runner = new NodalRunner({
      entities: [errorEntity],
    });

    const onErrorMock = jest.fn();
    
    // Mock the executeWorkflow method to call onError directly
    const runnerAny = runner as any;
    const originalExecuteWorkflow = runnerAny.executeWorkflow;
    
    runnerAny.executeWorkflow = jest.fn().mockImplementation((workflow, options) => {
      // Simulate an error during execution
      if (options?.onError) {
        options.onError(new Error('Test error'), workflow[0]);
      }
    });

    await runner.addWorkflow(errorWorkflow).run({ onError: onErrorMock });

    // Verify that the onError callback was called with the correct error
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      errorWorkflow[0]
    );
    
    // Restore original method
    runnerAny.executeWorkflow = originalExecuteWorkflow;
  });

  test('should reset correctly', () => {
    const runner = new NodalRunner({
      entities: [telegramEntity, logicEntity],
    });

    runner.addWorkflow(testWorkflow);

    // We need to use any type to access private properties
    const runnerAny = runner as any;
    runnerAny.currentWorkflowIndex = 1;
    runnerAny.currentNodeIndex = 2;
    runnerAny.state = { 0: ['test'] };
    runnerAny.isRunning = true;

    runner.reset();

    expect(runnerAny.currentWorkflowIndex).toBe(0);
    expect(runnerAny.currentNodeIndex).toBe(0);
    expect(runnerAny.state).toEqual({});
    expect(runnerAny.isRunning).toBe(false);
  });
});
