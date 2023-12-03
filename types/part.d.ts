declare interface Part {
    id: number
    part: string
    description?: string
    footprint?: string
    quantity: number
    min_quantity?: number
    value?: string
    owner_id?: string
    created_at?: string
    ordering_url?: string
    price?: number
    locations: Location
    location_id: number
  }