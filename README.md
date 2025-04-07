# Nodal Agent

## Overview
This project is a framework for building automations. It's meant to be used in applications to execute workflows defined in a nodal structure.

```typescript
import { NodalRunner } from 'nodal-agent';
import { Telegram, Notion, Whatsapp } from './my-entities';

const workflow = [
  {
    name: "Check Telegram for messages",
    entity: "Telegram",
    method: "get_messages",
    parameters: {...}
  },
  // More nodes...
];

const runner = new NodalRunner({
  entities: [Telegram, Notion, Whatsapp],
});

runner
  .addWorkflow(workflow)
  .run({
    onError: (error, node) => console.error(`Error executing node ${node.name}:`, error),
    onCompleted: () => console.log('Workflow completed')
  });
```

## Installation

```bash
npm install nodal-agent
```

## Usage

### Creating Entities

Entities are objects that contain methods to be executed by the nodal runner:

```typescript
// my-entities/Telegram/index.ts
import { Entity } from 'nodal-agent';

const Telegram: Entity = {
  name: 'Telegram',
  methods: {
    get_messages: async (parameters, state) => {
      // Implementation logic
      return { messages: [] };
    },
    send_message: async (parameters, state) => {
      // Implementation logic
      return { success: true };
    }
  }
};

export { Telegram };
```

### Creating Workflows

Workflows are arrays of nodes that are executed sequentially:

```typescript
const workflow = [
  {
    name: "Check Telegram for messages",
    entity: "Telegram",
    method: "get_messages",
    parameters: {
      chatId: "12345"
    }
  },
  {
    name: "Loop over each message",
    entity: "Loop",
    method: "foreach",
    parameters: {
      iterator: "node[0].messages",
      of: "message",
      do: [
        // Nested nodes
      ]
    }
  }
];
```

Workflows can be defined as JSON or YAML and then parsed into the appropriate structure.

## API Reference

### NodalRunner

The main class for executing workflows.

#### Constructor

```typescript
new NodalRunner(options: RunnerOptions)
```

- `options.entities`: Array of entities to be used in the workflow

#### Methods

- `addWorkflow(workflow: Workflow)`: Add a workflow to be executed
- `run(options?: RunOptions)`: Execute all workflows
- `getCurrentState()`: Get the current state of all workflows
- `reset()`: Reset the runner to its initial state

### Types

```typescript
type Node = {
  name: string
  entity: string
  method: string
  parameters: Record<string, unknown>
}

type Workflow = Node[]

type Entity = {
  name: string
  methods: Record<string, (...args: any[]) => any>
}

type RunnerOptions = {
  entities: Entity[]
}

type RunOptions = {
  onError?: (error: Error, node: Node) => void
  onCompleted?: () => void
}
```