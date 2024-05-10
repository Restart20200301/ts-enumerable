import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('take', () => {
    test('0', () => {
        expect(stream([1, 2, 3]).take(0).toArray()).toEqual([])
    })

    test('-1', () => {
        expect(stream([1, 2, 3]).take(-1).toArray()).toEqual([])
    })

    test('1', () => {
        expect(stream([1, 2, 3]).take(1).toArray()).toEqual([1])
    })

    test('2', () => {
        expect(stream([1, 2, 3]).take(2).toArray()).toEqual([1, 2])
    })

    test('3', () => {
        expect(stream([1, 2, 3]).take(3).toArray()).toEqual([1, 2, 3])
    })

    test('4', () => {
        expect(stream([1, 2, 3]).take(4).toArray()).toEqual([1, 2, 3])
    })
})
