export default () => {
  return `id, part, value, description, footprint, price, ordering_url, min_quantity, parent_id, quantity_of, parent:parent_id(id, part, value, footprint, location_parts(id, locations(id, name), quantity)), location_parts(id, locations(id, name), quantity), project_parts(id, projects(id, name))`
}
