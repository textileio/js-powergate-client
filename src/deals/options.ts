import { dealsTypes } from "../types"

export type ListDealRecordsOption = (req: dealsTypes.ListDealRecordsConfig) => void

/**
 * Limits the results deals initiated from the provided wallet addresses
 * @param addresses The list of addresses
 * @returns The resulting option
 */
export const withFromAddresses = (...addresses: string[]): ListDealRecordsOption => {
  return (req: dealsTypes.ListDealRecordsConfig) => {
    req.setFromAddrsList(addresses)
  }
}

/**
 * Limits the results to deals for the provided data cids
 * @param cids The list of cids
 * @returns The resulting option
 */
export const withDataCids = (...cids: string[]): ListDealRecordsOption => {
  return (req: dealsTypes.ListDealRecordsConfig) => {
    req.setDataCidsList(cids)
  }
}

/**
 * Specifies whether or not to include pending deals in the results
 * Default is false
 * Ignored for listRetrievalDealRecords
 * @param includePending Whether or not to include pending deal records
 * @returns The resulting option
 */
export const withIncludePending = (includePending: boolean): ListDealRecordsOption => {
  return (req: dealsTypes.ListDealRecordsConfig) => {
    req.setIncludePending(includePending)
  }
}

/**
 * Specifies whether or not to include final deals in the results
 * Default is false
 * Ignored for listRetrievalDealRecords
 * @param includeFinal Whether or not to include final deal records
 * @returns The resulting option
 */
export const withIncludeFinal = (includeFinal: boolean): ListDealRecordsOption => {
  return (req: dealsTypes.ListDealRecordsConfig) => {
    req.setIncludeFinal(includeFinal)
  }
}

/**
 * Specifies to sort the results in ascending order
 * Default is descending order
 * Records are sorted by timestamp
 * @param ascending Whether or not to sort the results in ascending order
 * @returns The resulting option
 */
export const withAscending = (ascending: boolean): ListDealRecordsOption => {
  return (req: dealsTypes.ListDealRecordsConfig) => {
    req.setAscending(ascending)
  }
}
