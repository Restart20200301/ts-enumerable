export default function stream<T>(iter: Iterable<T>): Enumerable<T> {
    return Array.isArray(iter)
        ? new ArrayEnumerable(iter)
        : new IterEnumerable(iter)
}

// type def begin
type Predicate<T> = (v: T, i: number) => boolean
type Selector<T, U> = (v: T, i: number) => U
// type def end

interface Enumerable<T> {
    [Symbol.iterator](): Iterator<T>

    where(predicate: Predicate<T>): Enumerable<T>
    select<U>(selecttor: Selector<T, U>): Enumerable<U>
    selectMany<U>(selecttor: Selector<T, Enumerable<U>>): Enumerable<U>

    toArray(): T[]
    get count(): number
}

abstract class EnumerableImpl<T> implements Enumerable<T> {
    abstract [Symbol.iterator](): Iterator<T, any, undefined>

    where(predicate: Predicate<T>): Enumerable<T> {
        return new WhereEnumerable(this, predicate)
    }

    select<U>(selecttor: Selector<T, U>): Enumerable<U> {
        return new SelectEnumerable(this, selecttor)
    }

    selectMany<U>(selecttor: Selector<T, Enumerable<U>>): Enumerable<U> {
        throw new Error('not impl this..')
    }

    toArray(): T[] {
        return [...this]
    }

    get count(): number {
        let total = 0
        for (const v of this) total++
        return total
    }
}

class ArrayEnumerable<T> extends EnumerableImpl<T> {
    constructor(private readonly source: T[]) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        yield* this.source
    }

    override toArray(): T[] {
        return this.source
    }

    override get count(): number {
        return this.source.length
    }
}

class IterEnumerable<T> extends EnumerableImpl<T> {
    constructor(private readonly source: Iterable<T>) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        yield* this.source
    }
}

class WhereEnumerable<T> extends EnumerableImpl<T> {
    constructor(
        private readonly source: Enumerable<T>,
        private readonly predicate: Predicate<T>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        let i = 0
        for (const v of this.source) {
            if (this.predicate(v, i++)) {
                yield v
            }
        }
    }
}

class SelectEnumerable<T, U> extends EnumerableImpl<U> {
    constructor(
        private readonly source: Enumerable<T>,
        private readonly selector: Selector<T, U>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<U, any, undefined> {
        let i = 0
        for (const v of this.source) {
            yield this.selector(v, i++)
        }
    }
}
