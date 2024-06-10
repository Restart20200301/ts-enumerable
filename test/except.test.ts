import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('except', () => {
    test('', () => {
        expect(
            stream([2.0, 2.0, 2.1, 2.2, 2.3, 2.3, 2.4, 2.5])
                .except([2.2])
                .toArray()
        ).toEqual([2, 2.1, 2.3, 2.4, 2.5])
    })
})
