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
})
