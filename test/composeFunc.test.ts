import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('compose', () => {
    test('where select', () => {
        expect(
            stream([1, 2, 3, 3, 6, 8, 8, 9, 4])
                .where((v) => v % 2 === 0)
                .select((v) => String(v))
                .toArray()
        ).toEqual(['2', '6', '8', '8', '4'])
    })
})
