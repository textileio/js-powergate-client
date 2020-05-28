import {expect} from 'chai'

import { createPow } from '.'
import { host } from './util'

describe('client', () => {
  it('should create a client', () => {
    const pow = createPow({ host })
    expect(pow.ffs).not.undefined
    expect(pow.health).not.undefined
    expect(pow.net).not.undefined
    expect(pow.miners).not.undefined
  })
})
