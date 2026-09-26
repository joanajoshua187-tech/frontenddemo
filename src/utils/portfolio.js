import { findListing } from '../data/listings'

export function portfolioValue(inv) {
  return inv.holdings.reduce((sum, h) => {
    const change = inv.simulated ? (findListing(h.listingId)?.sixMonthChange ?? 0) / 100 : 0
    return sum + h.cost * (1 + change)
  }, 0)
}
