import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('reverse', () => {
    test('', () => {
        const a = [1, 2, 3, 3, 6, 8, 8, 9, 4]
        expect(stream(a).reverse().toArray()).toEqual([...a].reverse())
    })
})
