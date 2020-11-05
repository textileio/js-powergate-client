/**
 * Controls the behavior of listing deal records.
 */
export type DealRecordsOptions = {
  /**
   * Limits the results deals initiated from the provided wallet addresses.
   */
  fromAddresses?: string[]

  /**
   * Limits the results to deals for the provided data cids
   */
  dataCids?: string[]

  /**
   * Specifies whether or not to include pending deals in the results
   * Default is false
   * Ignored for listRetrievalDealRecords
   */
  includePending?: boolean

  /**
   * Specifies whether or not to include final deals in the results
   * Default is false
   * Ignored for listRetrievalDealRecords
   */
  includeFinal?: boolean

  /**
   * Specifies to sort the results in ascending order
   * Default is descending order
   * Records are sorted by timestamp */
  ascending?: boolean
}
