import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('where', () => {
    test('with array', () => {
        expect(
            stream([1, 2, 3])
                .where((v) => v % 2 === 1)
                .toArray()
        ).toEqual([1, 3])
    })

    test('with array index', () => {
        expect(
            stream([1, 2, 3, 3, 6, 8, 8, 9, 4])
                .where((v, i) => v % 2 === 1 && i % 2 === 0)
                .toArray()
        ).toEqual([1, 3])
    })
})
