import {expect} from 'chai'

import client from '.'
import { host } from './util'

describe('client', () => {
  it('should create a client', () => {
    const c = client({ host })
    expect(c.ffs).not.undefined
    expect(c.health).not.undefined
    expect(c.net).not.undefined
    expect(c.miners).not.undefined
  })
})
