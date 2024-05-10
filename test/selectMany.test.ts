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

    test('with index', () => {
        expect(
            stream([[1], [2], [3], []])
                .selectMany((v, i) => (i % 2 === 0 ? [] : v))
                .toArray()
        ).toEqual([2])
    })

    test('with result selector', () => {
        const stus = [
            { name: 'Amy', age: 16, score: [92, 93] },
            { name: 'Hugo', age: 11, score: [29] },
        ]
        expect(
            stream(stus)
                .selectMany(
                    (v) => v.score,
                    (c, v) => `${c.name}: ${v}`
                )
                .toArray()
        ).toEqual(['Amy: 92', 'Amy: 93', 'Hugo: 29'])
    })
})
