import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('select many', () => {
    test('with array', () => {
        expect(
            stream([[1], [2], [3], []])
                .selectMany((v) => stream(v))
                .toArray()
        ).toEqual([1, 2, 3])
    })

    test('with array index', () => {
        expect(
            stream([[1], [2], [3], []])
                .selectMany((v, i) => (i % 2 === 0 ? stream([]) : stream(v)))
                .toArray()
        ).toEqual([2])
    })
})
