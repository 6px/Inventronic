declare interface ProjectPart {
    id: number
    part_id: number
    parts: Part
    project_id: number
    projects: Project
    quantity: number
    references: string
  }