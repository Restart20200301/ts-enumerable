export default function stream<T>(iter: Iterable<T>): IEnumerable<T> {
    return Array.isArray(iter)
        ? new ArrayEnumerable(iter)
        : new IterEnumerable(iter)
}

// type def begin
type Predicate<T> = (v: T, i: number) => boolean
type Selector<T, U> = (v: T, i: number) => U
type SelectorMut<T, U, R> = (v: T, c: U) => R
type Mapper<T, U> = (v: T) => U
type Comparer<T> = (l: T, r: T) => boolean
// type def end

interface IEnumerable<T> {
    [Symbol.iterator](): Iterator<T>

    where(predicate: Predicate<T>): IEnumerable<T>

    select<U>(selecttor: Selector<T, U>): IEnumerable<U>

    selectMany<U>(selecttor: Selector<T, Iterable<U>>): IEnumerable<U>
    selectMany<U, R>(
        collectionSelector: Selector<T, Iterable<U>>,
        resultSelector: SelectorMut<T, U, R>
    ): IEnumerable<R>

    take(n: number): IEnumerable<T>

    takeWhile(predicate: Predicate<T>): IEnumerable<T>

    skip(n: number): IEnumerable<T>

    skipWhile(predicate: Predicate<T>): IEnumerable<T>

    join<U, K, R>(
        other: Iterable<U>,
        otherKeySelector: Mapper<U, K>,
        thisKeySelector: Mapper<T, K>,
        resultSelector: SelectorMut<T, U, R>
    ): IEnumerable<R>
    join<U, K, R>(
        other: Iterable<U>,
        otherKeySelector: Mapper<U, K>,
        thisKeySelector: Mapper<T, K>,
        resultSelector: SelectorMut<T, U, R>,
        comparer: Comparer<K>
    ): IEnumerable<R>

    toArray(): T[]

    get count(): number
}

abstract class Enumerable<T> implements IEnumerable<T> {
    abstract [Symbol.iterator](): Iterator<T, any, undefined>

    where(predicate: Predicate<T>): IEnumerable<T> {
        return new WhereEnumerable(this, predicate)
    }

    select<U>(selecttor: Selector<T, U>): IEnumerable<U> {
        return new SelectEnumerable(this, selecttor)
    }

    selectMany<U>(selecttor: Selector<T, Iterable<U>>): IEnumerable<U>
    selectMany<U, R>(
        collectionSelector: Selector<T, Iterable<U>>,
        resultSelector: SelectorMut<T, U, R>
    ): IEnumerable<R>
    selectMany<U, R>(
        selecttor: Selector<T, Iterable<U>>,
        resultSelector?: SelectorMut<T, U, R>
    ): IEnumerable<R> {
        return new SelectManyEnumerable(this, selecttor, resultSelector)
    }

    take(n: number): IEnumerable<T> {
        return new TakeEnumerable(this, n)
    }

    takeWhile(predicate: Predicate<T>): IEnumerable<T> {
        return new TakeWhileEnumerable(this, predicate)
    }

    skip(n: number): IEnumerable<T> {
        return new SkipEnumerable(this, n)
    }

    skipWhile(predicate: Predicate<T>): IEnumerable<T> {
        return new SkipWhileEnumerable(this, predicate)
    }

    join<U, K, R>(
        other: Iterable<U>,
        otherKeySelector: Mapper<U, K>,
        thisKeySelector: Mapper<T, K>,
        resultSelector: SelectorMut<T, U, R>
    ): IEnumerable<R>
    join<U, K, R>(
        other: Iterable<U>,
        otherKeySelector: Mapper<U, K>,
        thisKeySelector: Mapper<T, K>,
        resultSelector: SelectorMut<T, U, R>,
        comparer: Comparer<K>
    ): IEnumerable<R>
    join<U, K, R>(
        other: Iterable<U>,
        otherKeySelector: Mapper<U, K>,
        thisKeySelector: Mapper<T, K>,
        resultSelector: SelectorMut<T, U, R>,
        comparer?: Comparer<K>
    ): IEnumerable<R> {
        return new JoinEnumerable(
            this,
            other,
            thisKeySelector,
            otherKeySelector,
            resultSelector
        )
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

class ArrayEnumerable<T> extends Enumerable<T> {
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

class IterEnumerable<T> extends Enumerable<T> {
    constructor(private readonly source: Iterable<T>) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        yield* this.source
    }
}

class WhereEnumerable<T> extends Enumerable<T> {
    constructor(
        private readonly source: IEnumerable<T>,
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

class SelectEnumerable<T, U> extends Enumerable<U> {
    constructor(
        private readonly source: IEnumerable<T>,
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

class SelectManyEnumerable<T, U, R> extends Enumerable<R> {
    constructor(
        private readonly source: IEnumerable<T>,
        private readonly collectionSelector: Selector<T, Iterable<U>>,
        private readonly resultSelector: SelectorMut<T, U, R> = (t, u) =>
            u as unknown as R
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<R, any, undefined> {
        let i = 0
        for (const iter of this.source) {
            for (const v of this.collectionSelector(iter, i)) {
                yield this.resultSelector(iter, v)
            }
            i++
        }
    }
}

class TakeEnumerable<T> extends Enumerable<T> {
    constructor(
        private readonly source: IEnumerable<T>,
        private n: number
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        if (this.n <= 0) return

        for (const v of this.source) {
            yield v
            if (--this.n == 0) break
        }
    }
}

class TakeWhileEnumerable<T> extends Enumerable<T> {
    constructor(
        private readonly source: IEnumerable<T>,
        private readonly predicate: Predicate<T>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        let i = 0
        for (const v of this.source) {
            if (!this.predicate(v, i++)) break
            yield v
        }
    }
}

class SkipEnumerable<T> extends Enumerable<T> {
    constructor(
        private readonly source: IEnumerable<T>,
        private n: number
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        for (const v of this.source) {
            if (this.n-- > 0) continue
            yield v
        }
    }
}

class SkipWhileEnumerable<T> extends Enumerable<T> {
    constructor(
        private readonly source: IEnumerable<T>,
        private readonly predicate: Predicate<T>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        let yielding = false
        let i = -1
        for (const v of this.source) {
            i++
            if (!yielding && !this.predicate(v, i)) yielding = true
            if (yielding) yield v
        }
    }
}

class JoinEnumerable<T, U, K, R> extends Enumerable<R> {
    constructor(
        private readonly inner: IEnumerable<T>,
        private readonly outer: Iterable<U>,
        private readonly innerKeySelector: Mapper<T, K>,
        private readonly outerKeySelector: Mapper<U, K>,
        private readonly resultSelector: SelectorMut<T, U, R>,
        private readonly comparer: Comparer<K> = (l, r) => l == r
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<R, any, undefined> {}
}

interface IGrouping<K, E> extends IEnumerable<E> {
    get key(): K
}

class Grouping<K, E> extends Enumerable<E> implements IGrouping<K, E> {
    private readonly elements: E[] = []

    constructor(private readonly k: K) {
        super()
    }

    override [Symbol.iterator](): Iterator<E, any, undefined> {
        return this.elements[Symbol.iterator]()
    }

    get key(): K {
        return this.k
    }

    get count(): number {
        return this.elements.length
    }

    add(element: E) {
        this.elements.push(element)
    }
}

interface ILookup<K, E> extends IEnumerable<IGrouping<K, E>> {
    get count(): number
    has(key: K): boolean
    getElementsEnumerable(key: K): IEnumerable<K>
}

class Lookup<K, E>
    extends Enumerable<IGrouping<K, E>>
    implements ILookup<K, E>
{
    private readonly groupings: Array<Grouping<K, E>> = []

    has(key: K): boolean {
        throw new Error('Method not implemented.')
    }

    getElementsEnumerable(key: K): IEnumerable<K> {
        throw new Error('Method not implemented.')
    }

    override [Symbol.iterator](): Iterator<IGrouping<K, E>, any, undefined> {
        throw new Error('Method not implemented.')
    }
}
