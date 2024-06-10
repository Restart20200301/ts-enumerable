import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('union', () => {
    test('', () => {
        expect(
            stream([5, 3, 9, 7, 5, 9, 3, 7])
                .union([8, 3, 6, 4, 4, 9, 1, 0])
                .toArray()
        ).toEqual([5, 3, 9, 7, 8, 6, 4, 1, 0])
    })
})
