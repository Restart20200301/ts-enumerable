import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('order by', () => {
    test('with number[]', () => {
        const a = [0, 2, 1, 0, 0, 1, 15, -98, 1, 2, 3, 98, 77]
        expect(
            stream(a)
                .orderBy((v) => v)
                .toArray()
        ).toEqual(a.sort((a, b) => a - b))
    })

    test('with string[]', () => {
        const a = [0, 2, 1, 0, 0, 1, 15, -98, 1, 2, 3, 98, 77].map((v) =>
            String(v)
        )
        expect(
            stream(a)
                .orderBy((v) => v)
                .toArray()
        ).toEqual(a.sort())
    })

    test('with custom object[]', () => {
        const a = [
            { name: 'hugo', age: 18, score: 98 },
            { name: 'fay', age: 11, score: 88 },
            { name: 'jay', age: 45, score: 98 },
            { name: 'CK', age: 11, score: 48 },
            { name: 'T.K.', age: 25, score: 88 },
        ]
        expect(
            stream(a)
                .orderBy((v) => v.age)
                .toArray()
        ).toEqual([
            { name: 'fay', age: 11, score: 88 },
            { name: 'CK', age: 11, score: 48 },
            { name: 'hugo', age: 18, score: 98 },
            { name: 'T.K.', age: 25, score: 88 },
            { name: 'jay', age: 45, score: 98 },
        ])
    })
})

describe('order by descending', () => {
    test('with number[]', () => {
        const a = [0, 2, 1, 0, 0, 1, 15, -98, 1, 2, 3, 98, 77]
        expect(
            stream(a)
                .orderByDescending((v) => v)
                .toArray()
        ).toEqual(a.sort((a, b) => a - b).reverse())
    })

    test('with string[]', () => {
        const a = [0, 2, 1, 0, 0, 1, 15, -98, 1, 2, 3, 98, 77].map((v) =>
            String(v)
        )
        expect(
            stream(a)
                .orderByDescending((v) => v)
                .toArray()
        ).toEqual(a.sort().reverse())
    })

    test('with custom object[]', () => {
        const a = [
            { name: 'hugo', age: 18, score: 98 },
            { name: 'fay', age: 11, score: 88 },
            { name: 'jay', age: 45, score: 98 },
            { name: 'CK', age: 11, score: 48 },
            { name: 'T.K.', age: 25, score: 88 },
        ]
        expect(
            stream(a)
                .orderByDescending((v) => v.age)
                .toArray()
        ).toEqual([
            { name: 'jay', age: 45, score: 98 },
            { name: 'T.K.', age: 25, score: 88 },
            { name: 'hugo', age: 18, score: 98 },
            { name: 'fay', age: 11, score: 88 },
            { name: 'CK', age: 11, score: 48 },
        ])
    })
})
