import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('concat', () => {
    test('left length < right length', () => {
        expect(stream([1, 2, 3]).zip([5, 3, 1, 2]).toArray()).toEqual([
            [1, 5],
            [2, 3],
            [3, 1],
        ])
    })

    test('left length > right length', () => {
        expect(stream([1, 2, 3, 4]).zip([5, 3, 1]).toArray()).toEqual([
            [1, 5],
            [2, 3],
            [3, 1],
        ])
    })

    test('left length = right length', () => {
        expect(stream([1, 2, 3]).zip([5, 3, 1]).toArray()).toEqual([
            [1, 5],
            [2, 3],
            [3, 1],
        ])
    })

    test('custom transform', () => {
        expect(
            stream([1, 2, 3])
                .zip([5, 3, 1], (a, b) => a + b)
                .toArray()
        ).toEqual([6, 5, 4])
    })
})
