import { Entity, Node, RunOptions, RunnerOptions, Workflow } from './types'

export class NodalRunner {
  private entities: Record<string, Entity> = {}
  private workflows: Workflow[] = []
  private state: Record<number, any[]> = {}
  private isRunning = false
  private currentWorkflowIndex = 0
  private currentNodeIndex = 0

  constructor(options: RunnerOptions) {
    this.registerEntities(options.entities)
  }

  private registerEntities(entities: Entity[]) {
    entities.forEach(entity => {
      this.entities[entity.name] = entity
    })
  }

  public addWorkflow(workflow: Workflow): NodalRunner {
    this.workflows.push(workflow)
    return this
  }

  public run(options?: RunOptions): NodalRunner {
    if (this.isRunning) {
      throw new Error('Nodal runner is already running')
    }

    this.isRunning = true
    this.executeWorkflows(options)
    return this
  }

  private async executeWorkflows(options?: RunOptions) {
    try {
      while (this.currentWorkflowIndex < this.workflows.length) {
        const workflow = this.workflows[this.currentWorkflowIndex]
        this.state[this.currentWorkflowIndex] = []
        
        await this.executeWorkflow(workflow, options)
        this.currentWorkflowIndex++
        this.currentNodeIndex = 0
      }

      this.isRunning = false
      options?.onCompleted?.()
    } catch (error) {
      this.isRunning = false
      throw error
    }
  }

  private async executeWorkflow(workflow: Workflow, options?: RunOptions) {
    while (this.currentNodeIndex < workflow.length) {
      const node = workflow[this.currentNodeIndex]
      try {
        await this.executeNode(node)
      } catch (error) {
        if (options?.onError) {
          options.onError(error instanceof Error ? error : new Error(String(error)), node)
        } else {
          throw error
        }
      }
      this.currentNodeIndex++
    }
  }

  private async executeNode(node: Node) {
    const entity = this.entities[node.entity]
    if (!entity) {
      throw new Error(`Entity '${node.entity}' not found`)
    }

    const method = entity.methods[node.method]
    if (!method) {
      throw new Error(`Method '${node.method}' not found in entity '${node.entity}'`)
    }

    const result = await method(node.parameters, this.getState())
    this.saveNodeResult(result)
    return result
  }

  private saveNodeResult(result: any) {
    this.state[this.currentWorkflowIndex][this.currentNodeIndex] = result
  }

  private getState() {
    return this.state
  }

  public getCurrentState() {
    return this.getState()
  }

  public reset() {
    this.isRunning = false
    this.currentWorkflowIndex = 0
    this.currentNodeIndex = 0
    this.state = {}
    return this
  }
}
