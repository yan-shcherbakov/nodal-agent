export type Node = {
  name: string // Descriptive name. Example "Check Telegram for messages"
  entity: string // The entity that this node will be working with. Example "Telegram"
  method: string // The method of the entity that should be executed. Example "get_messages"
  parameters: Record<string, unknown> // The object that contains the expected parameters for the method that is being executed.
}

export type Workflow = Node[]

export type Entity = {
  name: string
  methods: Record<string, (...args: any[]) => any>
}

export type RunnerOptions = {
  entities: Entity[]
}

export type RunOptions = {
  onError?: (error: Error, node: Node) => void
  onCompleted?: () => void
}
