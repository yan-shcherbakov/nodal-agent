# Nodal Agent - Nodal Task Runner

## Overview
I'm building a task runner that can be included into any application. This library will provide the toolset to create and run a JSON or YAML based workflow to run various classes and integrations. The idea of "nodal" means that each item in the data structure that this task runner receives is a "node" and connected to other nodes. The output data from one node is maintained to the node. Any node in the structure can access another previous node's data.

This provides a framework for putting together applications that need to run a workflow, usually for the purpose of connecting an LLM to run a particular agentic workflow. Basically, it's a framework that provides the tools to compose and run tasks in a nodal structure.

## Tech Stack
- Typescript to begin with

## Architecture

### Workflow

A workflow is an array of nodes. A workflow iterates each node and executes the method. The workflow is responsible for tracking the state of the workflow, whether it has finished, running, which node it's currently executing and should control the data structure where the node can save its output. Each node saves it's own output, given that the workflow saves its state then this way each node has access to any node in the workflow.

### Node
- A node is a step in a workflow
- It has a descriptive name
- It runs a function that belongs to a particular entity
- Saves the output of the node into the state of the workflow

A node has the following structure:

```typescript
type Node = {
  name: string // Descriptive name. Example "Check Telegram for messages"
  entity: string // The entity that this node will be working with. Example "Telegram"
  method: string // The method of the entity that should be executed. Example "get_messages"
  parameters: Record<string, unknown> // The object that contains the expected parameters for the method that is being executed.
}
```

A node is called as part of a workflow. When a workflow reaches a particular step or node, its method of the entity of the node is executed with the provided parameters. Each method has its own set of parameters so the object's shape is determined by the method's parameters.

The node is responsible for its own execution, maintaining its own state and its own output.

### Entity

The entity that is defined in a node is mapped to an entity in the code that contains a collection of functions. Each function is isolated and decoupled even though it's a part of an entity, a method should be standalone without sharing any data between the functions. It's basically receive input, execute and output. Then the node saves the output of this method. Each method is expected to be completely standalone. The entity simply defines where to look for this particular method.

### Method

A method has a consistent structure where there's validation of the parameters, an output that is standardized. The idea is that a method and entity can be "plug and play" where anyone can put together an entity and its methods and provide it to this framework.

The method has an interface that defines the parameters that it receives, the method should validate those parameters, it runs its operation as a black box and then return the output to the node.

## Project Structure
```
src/
  
  index.ts
```

## Usage

Let's say consumer project structure is like this:

```
index.ts - Main application
my-entities/
  Telegram/
    get_messages.ts
    send_message.ts
    read_message.ts
    index.ts - Barrel file that exports these methods
```

In the main application, the NodalRunner is instantiated this way

```typescript
import { Telegram, Notion, Whatsapp } from './my-entities'

const workflow = {...}

const runnerInstance = new NodalRunner({
    // Consumer defines the entities that should be used by the runner
    // these are consumer defined, the runner should simply execute them
    // and maintain their state.
    entities: [Telegram, Notion, Whatsapp],
})

runnerInstance.addWorkflow(worklow)
runnerInstance.run({
    onError: () => {}, // Callback is run when an error occurs
    onCompleted: () => {}, // Callback is run when the workflow completes
})
```

So the NodalRunner receives the defined entities that should be used. Then it receives a workflow object and then executes that workflow. The entities are consumer defined, so when a node is run it should be able to execute `Entity.method` for example `Telegram.get_messages`. The NodalRunner should be able to safely recover from errors and maintain its state.

We're always operating under the assumption that `Entity` will be an object that has methods and the entity and the method is accessible. There should be a check however if it's not accessible.