import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('select', () => {
    test('with array', () => {
        expect(
            stream([1, 2, 3])
                .select((v) => v % 2 === 1)
                .toArray()
        ).toEqual([true, false, true])
    })

    test('with array index', () => {
        expect(
            stream([1, 2, 3, 3, 6, 8, 8, 9, 4])
                .select((v, i) => v % 2 === 1 && i % 2 === 0)
                .toArray()
        ).toEqual([true, false, true, false, false, false, false, false, false])
    })
})
