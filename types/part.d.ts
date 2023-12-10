declare interface Part {
    id: number
    part: string
    description?: string
    footprint?: string
    min_quantity?: number
    value?: string
    owner_id: string
    created_at: string
    ordering_url?: string
    price?: number
    parent_id?: string
    quantity_of?: number
    parent: Part
    location_parts: Array<LocationPart>
    project_parts: Array<ProjectPart>
  }