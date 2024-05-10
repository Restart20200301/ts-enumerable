import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('take', () => {
    test('0', () => {
        expect(
            stream([1, 2, 3])
                .takeWhile((v) => v < 0)
                .toArray()
        ).toEqual([])
    })

    test('-1', () => {
        expect(
            stream([1, 2, 3])
                .takeWhile((v) => v < -1)
                .toArray()
        ).toEqual([])
    })

    test('1', () => {
        expect(
            stream([1, 2, 3])
                .takeWhile((v) => v < 1)
                .toArray()
        ).toEqual([])
    })

    test('2', () => {
        expect(
            stream([1, 2, 3])
                .takeWhile((v) => v < 2)
                .toArray()
        ).toEqual([1])
    })

    test('3', () => {
        expect(
            stream([1, 2, 3])
                .takeWhile((v) => v < 3)
                .toArray()
        ).toEqual([1, 2])
    })

    test('4', () => {
        expect(
            stream([1, 2, 3])
                .takeWhile((v) => v < 4)
                .toArray()
        ).toEqual([1, 2, 3])
    })

    test('5', () => {
        expect(
            stream([1, 2, 3])
                .takeWhile((v) => v < 5)
                .toArray()
        ).toEqual([1, 2, 3])
    })
})
