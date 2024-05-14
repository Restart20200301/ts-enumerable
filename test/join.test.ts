import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('join', () => {
    interface Student {
        firstName: string
        lastName: string
        scores: number[]
        departmentId: number
    }

    interface Teacher {
        first: string
        last: string
        id: number
        city: number
    }

    interface Department {
        name: string
        id: number
        tearcherId: number
    }

    const students: Student[] = [
        {
            firstName: 'Jay',
            lastName: 'Chen',
            scores: [51, 87, 96],
            departmentId: 1,
        },
        {
            firstName: 'Yellow',
            lastName: 'Jing',
            scores: [78, 65, 51, 96],
            departmentId: 2,
        },
        {
            firstName: 'Chun',
            lastName: 'Qiu',
            scores: [51, 87, 96],
            departmentId: 1,
        },
    ]
    const teachers: Teacher[] = [
        {
            first: 'Rui',
            last: 'Wen',
            id: 11,
            city: 12,
        },
    ]

    const departments: Department[] = [
        {
            name: 'Rui',
            id: 11,
            tearcherId: 12,
        },
    ]

    test('single key join', () => {
        const s = stream(students).join(
            departments,
            (s) => s.departmentId,
            (d) => d.id,
            (s, d) => ({
                name: `${s.firstName} ${s.lastName}`,
                departmentName: `${d.name}`,
            })
        )

        expect(s.toArray()).toEqual([])
    })
})
