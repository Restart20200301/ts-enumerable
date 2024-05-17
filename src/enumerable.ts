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
type Comparer<T> = (l: T, r: T) => number
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
        inner: Iterable<U>,
        outerKeySelector: Mapper<T, K>,
        innerKeySelector: Mapper<U, K>,
        resultSelector: SelectorMut<T, U, R>
    ): IEnumerable<R>

    groupJoin<U, K, R>(
        inner: Iterable<U>,
        outerKeySelector: Mapper<T, K>,
        innerKeySelector: Mapper<U, K>,
        resultSelector: SelectorMut<T, IEnumerable<U>, R>
    ): IEnumerable<R>

    orderBy<K>(keySelector: Mapper<T, K>): IOrderedEnumberable<T>
    orderBy<K>(
        keySelector: Mapper<T, K>,
        comparer: Comparer<K>
    ): IOrderedEnumberable<T>

    orderByDescending<K>(keySelector: Mapper<T, K>): IOrderedEnumberable<T>
    orderByDescending<K>(
        keySelector: Mapper<T, K>,
        comparer: Comparer<K>
    ): IOrderedEnumberable<T>

    toArray(): T[]

    get count(): number
}

const conparerDefault = <T>(l: T, r: T) => {
    return l === r ? 0 : l < r ? -1 : 1
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
        inner: Iterable<U>,
        outerKeySelector: Mapper<T, K>,
        innerKeySelector: Mapper<U, K>,
        resultSelector: SelectorMut<T, U, R>
    ): IEnumerable<R> {
        return new JoinEnumerable(
            this,
            stream(inner),
            outerKeySelector,
            innerKeySelector,
            resultSelector
        )
    }

    groupJoin<U, K, R>(
        inner: Iterable<U>,
        outerKeySelector: Mapper<T, K>,
        innerKeySelector: Mapper<U, K>,
        resultSelector: SelectorMut<T, IEnumerable<U>, R>
    ): IEnumerable<R> {
        return new GroupJoinEnumerable(
            this,
            stream(inner),
            outerKeySelector,
            innerKeySelector,
            resultSelector
        )
    }

    orderBy<K>(keySelector: Mapper<T, K>): IOrderedEnumberable<T>
    orderBy<K>(
        keySelector: Mapper<T, K>,
        comparer: Comparer<K>
    ): IOrderedEnumberable<T>
    orderBy<K>(
        keySelector: Mapper<T, K>,
        comparer?: Comparer<K>
    ): IOrderedEnumberable<T> {
        return new OrderedEnumerableImpl<T, K>(
            this,
            keySelector,
            comparer ?? conparerDefault<K>,
            false
        )
    }

    orderByDescending<K>(keySelector: Mapper<T, K>): IOrderedEnumberable<T>
    orderByDescending<K>(
        keySelector: Mapper<T, K>,
        comparer: Comparer<K>
    ): IOrderedEnumberable<T>
    orderByDescending<K>(
        keySelector: Mapper<T, K>,
        comparer?: Comparer<K>
    ): IOrderedEnumberable<T> {
        return new OrderedEnumerableImpl<T, K>(
            this,
            keySelector,
            comparer ?? conparerDefault<K>,
            true
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
    private readonly keyToGroupingsIndex = new Map<K, number>()

    has(key: K): boolean {
        return this.keyToGroupingsIndex.has(key)
    }

    getElementsEnumerable(key: K): IEnumerable<K> {
        throw new Error('Method not implemented.')
    }

    getGrouping(key: K): Grouping<K, E> {
        const index = this.keyToGroupingsIndex.get(key)!
        return this.groupings[index]
    }

    createGrouping(key: K) {
        const grouping = new Grouping<K, E>(key)
        this.groupings.push(grouping)
        this.keyToGroupingsIndex.set(key, this.groupings.length - 1)
    }

    override [Symbol.iterator](): Iterator<IGrouping<K, E>, any, undefined> {
        return this.groupings[Symbol.iterator]()
    }

    static createForJoin<K, E>(
        source: IEnumerable<E>,
        keySelector: Mapper<E, K>
    ): Lookup<K, E> {
        const lookup = new Lookup<K, E>()
        for (const v of source) {
            const key = keySelector(v)
            if (!lookup.has(key)) {
                lookup.createGrouping(key)
            }
            lookup.getGrouping(key).add(v)
        }
        return lookup
    }
}

class JoinEnumerable<T, U, K, R> extends Enumerable<R> {
    constructor(
        private readonly outer: IEnumerable<T>,
        private readonly inner: IEnumerable<U>,
        private readonly outerKeySelector: Mapper<T, K>,
        private readonly innerKeySelector: Mapper<U, K>,
        private readonly resultSelector: SelectorMut<T, U, R>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<R, any, undefined> {
        const lookup = Lookup.createForJoin(this.inner, this.innerKeySelector)
        for (const item of this.outer) {
            const key = this.outerKeySelector(item)
            if (!lookup.has(key)) continue
            const g = lookup.getGrouping(key)
            for (const v of g) {
                yield this.resultSelector(item, v)
            }
        }
    }
}

class GroupJoinEnumerable<T, U, K, R> extends Enumerable<R> {
    constructor(
        private readonly outer: IEnumerable<T>,
        private readonly inner: IEnumerable<U>,
        private readonly outerKeySelector: Mapper<T, K>,
        private readonly innerKeySelector: Mapper<U, K>,
        private readonly resultSelector: SelectorMut<T, IEnumerable<U>, R>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<R, any, undefined> {
        const lookup = Lookup.createForJoin(this.inner, this.innerKeySelector)
        for (const item of this.outer) {
            const key = this.outerKeySelector(item)
            if (!lookup.has(key)) continue
            const g = lookup.getGrouping(key)
            yield this.resultSelector(item, g)
        }
    }
}

interface IOrderedEnumberable<T> extends IEnumerable<T> {
    createOrderedEnumerable<K>(
        keySelector: Mapper<T, K>,
        comparer: Comparer<K>,
        descending: boolean
    ): IOrderedEnumberable<T>
}

abstract class OrderedEnumerable<T>
    extends Enumerable<T>
    implements IOrderedEnumberable<T>
{
    constructor(private readonly source: IEnumerable<T>) {
        super()
    }

    createOrderedEnumerable<K>(
        keySelector: Mapper<T, K>,
        comparer: Comparer<K>,
        descending: boolean
    ): IOrderedEnumberable<T> {
        const ordered = new OrderedEnumerableImpl(
            this.source,
            keySelector,
            comparer,
            descending
        )
        ordered.setParent(this)
        return ordered
    }

    abstract getEnumerableSorter(
        next?: EnumerableSorter<T>
    ): EnumerableSorter<T>

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        const elements = [...this.source]
        if (elements.length == 0) return
        const sorter = this.getEnumerableSorter()
        const map = sorter.sort(elements)
        for (const v of map) yield elements[v]
    }
}

class OrderedEnumerableImpl<T, K> extends OrderedEnumerable<T> {
    private parent?: OrderedEnumerable<T>

    constructor(
        source: IEnumerable<T>,
        private readonly keySelector: Mapper<T, K>,
        private readonly comparer: Comparer<K>,
        private readonly descending: boolean
    ) {
        super(source)
    }

    getEnumerableSorter(next?: EnumerableSorter<T>): EnumerableSorter<T> {
        let sorter: EnumerableSorter<T> = new EnumerableSorterImpl(
            this.keySelector,
            this.comparer,
            this.descending,
            next
        )
        if (this.parent) sorter = this.parent.getEnumerableSorter(sorter)
        return sorter
    }

    setParent(p: OrderedEnumerable<T>) {
        this.parent = p
    }
}

abstract class EnumerableSorter<T> {
    abstract computeKeys(elements: T[]): void
    abstract compareKeys(index1: number, index2: number): number

    sort(elements: T[]): number[] {
        this.computeKeys(elements)
        const map: number[] = new Array(elements.length)
        for (let i = 0; i < map.length; i++) map[i] = i
        this.quickSort(map, 0, map.length - 1)
        return map
    }

    private quickSort(map: number[], left: number, right: number) {
        do {
            let i = left
            let j = right
            let x = map[i + ((j - i) >> 1)]
            do {
                while (i < map.length && this.compareKeys(x, map[i]) > 0) i++
                while (j >= 0 && this.compareKeys(x, map[j]) < 0) j--
                if (i > j) break
                if (i < j) {
                    const temp = map[i]
                    map[i] = map[j]
                    map[j] = temp
                }
                i++
                j--
            } while (i <= j)
            if (j - left > right - i) {
                if (i < right) this.quickSort(map, i, right)
                right = j
            } else {
                if (left < j) this.quickSort(map, left, j)
                left = i
            }
        } while (left < right)
    }
}

class EnumerableSorterImpl<T, K> extends EnumerableSorter<T> {
    private keys: K[] = []

    constructor(
        private readonly keySelector: Mapper<T, K>,
        private readonly comparer: Comparer<K>,
        private readonly descending: boolean,
        private readonly next?: EnumerableSorter<T>
    ) {
        super()
    }

    override computeKeys(elements: T[]): void {
        this.keys = new Array(elements.length)
        for (let i = 0; i < elements.length; i++)
            this.keys[i] = this.keySelector(elements[i])

        if (this.next) this.next.computeKeys(elements)
    }

    override compareKeys(index1: number, index2: number): number {
        let c = this.comparer(this.keys[index1], this.keys[index2])
        if (c === 0) {
            if (this.next) return this.next.compareKeys(index1, index2)
            return index1 - index2
        }
        return this.descending ? -c : c
    }
}
