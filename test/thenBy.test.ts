import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('then by', () => {
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
                .thenBy((v) => v.score)
                .thenBy((v) => v.name)
                .toArray()
        ).toEqual([
            { name: 'CK', age: 11, score: 48 },
            { name: 'fay', age: 11, score: 88 },
            { name: 'hugo', age: 18, score: 98 },
            { name: 'T.K.', age: 25, score: 88 },
            { name: 'jay', age: 45, score: 98 },
        ])

        expect(
            stream(a)
                .orderBy((v) => v.score)
                .thenBy((v) => v.age)
                .thenBy((v) => v.name)
                .toArray()
        ).toEqual([
            { name: 'CK', age: 11, score: 48 },
            { name: 'fay', age: 11, score: 88 },
            { name: 'T.K.', age: 25, score: 88 },
            { name: 'hugo', age: 18, score: 98 },
            { name: 'jay', age: 45, score: 98 },
        ])
    })
})

describe('order by descending', () => {
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
                .orderByDescending((v) => v.score)
                .thenBy((v) => v.age)
                .thenBy((v) => v.name)
                .toArray()
        ).toEqual([
            { name: 'hugo', age: 18, score: 98 },
            { name: 'jay', age: 45, score: 98 },
            { name: 'fay', age: 11, score: 88 },
            { name: 'T.K.', age: 25, score: 88 },
            { name: 'CK', age: 11, score: 48 },
        ])

        expect(
            stream(a)
                .orderByDescending((v) => v.age)
                .thenByDescending((v) => v.score)
                .thenByDescending((v) => v.name)
                .toArray()
        ).toEqual([
            { name: 'jay', age: 45, score: 98 },
            { name: 'T.K.', age: 25, score: 88 },
            { name: 'hugo', age: 18, score: 98 },
            { name: 'fay', age: 11, score: 88 },
            { name: 'CK', age: 11, score: 48 },
        ])

        expect(
            stream(a)
                .orderBy((v) => v.age)
                .thenByDescending((v) => v.score)
                .thenByDescending((v) => v.name)
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
