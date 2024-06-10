import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('distinct', () => {
    test('', () => {
        expect(stream([1, 2, 3, 3, 2, 4, 8, 4]).distinct().toArray()).toEqual([
            1, 2, 3, 4, 8,
        ])
    })
})
