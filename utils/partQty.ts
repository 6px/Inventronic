export default (part: Part) => {
  if (part.parent) {
    return Math.round(100 * part.parent.location_parts.reduce((acc, lp) => acc + lp.quantity, 0) / part.quantity_of) / 100
  }
  return Math.round(100 * part.location_parts.reduce((acc, lp) => acc + lp.quantity, 0)) / 100
}
