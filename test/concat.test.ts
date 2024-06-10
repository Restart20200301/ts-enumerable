import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('concat', () => {
    test('', () => {
        expect(stream([1, 2, 3]).concat([5, 3, 1]).toArray()).toEqual([
            1, 2, 3, 5, 3, 1,
        ])
    })
})
