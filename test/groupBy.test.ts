import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('group by', () => {
    interface Student {
        name: string
        age: number
    }

    const students: Student[] = [
        { name: 'Barley', age: 8.3 },
        { name: 'Boots', age: 4.9 },
        { name: 'Whiskers', age: 1.5 },
        { name: 'Daisy', age: 4.3 },
    ]

    test('', () => {
        const s = stream(students)
            .groupBy((stu) => Math.floor(stu.age))
            .select((v) => ({
                key: v.key,
                count: v.count,
            }))
            .toArray()

        expect(s).toEqual([
            { key: 8, count: 1 },
            { key: 4, count: 2 },
            { key: 1, count: 1 },
        ])
    })

    test('with element selector', () => {
        const s = stream(students)
            .groupBy((stu) => Math.floor(stu.age))
            .select((v) => [...v.select((v) => v.age)])
            .toArray()

        expect(s).toEqual([[8.3], [4.9, 4.3], [1.5]])
    })
})
