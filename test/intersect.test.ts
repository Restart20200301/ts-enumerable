import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('intersect', () => {
    test('', () => {
        expect(
            stream([44, 26, 92, 30, 71, 38])
                .intersect([39, 59, 83, 47, 26, 4, 30])
                .toArray()
        ).toEqual([26, 30])
    })
})
