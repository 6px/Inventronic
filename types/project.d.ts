declare interface Project {
    id: number
    name: string
    description?: string
    url?: string
    project_parts: Array<ProjectPart>
  }