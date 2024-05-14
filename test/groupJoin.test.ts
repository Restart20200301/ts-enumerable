import { describe, expect, test } from '@jest/globals'
import stream from '../src/enumerable'

describe('join', () => {
    interface Student {
        id: number
        name: string
        departmentId: number
    }

    interface Department {
        name: string
        id: number
    }

    const students: Student[] = [
        { id: 1, name: 'John', departmentId: 1 },
        { id: 2, name: 'Moin', departmentId: 1 },
        { id: 3, name: 'Bill', departmentId: 2 },
        { id: 4, name: 'Ram', departmentId: 2 },
        { id: 5, name: 'Ron', departmentId: 3 },
    ]

    const departments: Department[] = [
        { id: 1, name: 'Standard 1' },
        { id: 2, name: 'Standard 2' },
        { id: 3, name: 'Standard 3' },
        { id: 4, name: 'Standard 4' },
    ]

    test('single key join', () => {
        const s = stream(departments).groupJoin(
            students,
            (d) => d.id,
            (s) => s.departmentId,
            (d, s) => ({
                students: s,
                name: d.name,
            })
        )

        const arr = s.toArray().map((v) => ({
            [v.name]: v.students.select((v) => v.name).toArray(),
        }))
        expect(arr).toEqual([
            { ['Standard 1']: ['John', 'Moin'] },
            { ['Standard 2']: ['Bill', 'Ram'] },
            { ['Standard 3']: ['Ron'] },
        ])
    })
})
