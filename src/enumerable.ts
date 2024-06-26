export default function stream<T>(iter: Iterable<T>): IEnumerable<T> {
    return Array.isArray(iter)
        ? new ArrayEnumerable(iter)
        : new IterEnumerable(iter)
}

export const range = (start: number, count: number) =>
    new RangeEnumerable(start, count)

export const repeat = <T>(element: T, count: number) =>
    new RepeatEnumerable(element, count)

export const sum = (iter: Iterable<number>) => {
    let result = 0
    for (const v of iter) {
        result += v
    }
    return result
}

export const min = (iter: Iterable<number>) => {
    let result = Number.MAX_SAFE_INTEGER
    for (const v of iter) {
        result = Math.min(v, result)
    }
    return result
}

export const max = (iter: Iterable<number>) => {
    let result = Number.MIN_SAFE_INTEGER
    for (const v of iter) {
        result = Math.max(v, result)
    }
    return result
}

export const average = (iter: Iterable<number>) => {
    let result = 0
    let count = 0
    for (const v of iter) {
        result += v
        count += 1
    }
    return count == 0 ? 0 : result / count
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

    groupBy<K>(keySelector: Mapper<T, K>): IEnumerable<IGrouping<K, T>>
    groupBy<K, E>(
        keySelector: Mapper<T, K>,
        elementSelector: Mapper<T, E>
    ): IEnumerable<IGrouping<K, E>>

    concat(other: Iterable<T>): IEnumerable<T>

    zip<U>(other: Iterable<U>): IEnumerable<[T, U]>
    zip<U, R>(
        other: Iterable<U>,
        resultSelector: SelectorMut<T, U, R>
    ): IEnumerable<R>

    distinct(): IEnumerable<T>

    union(other: Iterable<T>): IEnumerable<T>

    intersect(other: Iterable<T>): IEnumerable<T>

    except(other: Iterable<T>): IEnumerable<T>

    reverse(): IEnumerable<T>

    toArray(): T[]

    get count(): number

    // 为与类中成员first区别，改个名字
    firstOne(): T | undefined
    firstOne(predicate: (v: T) => boolean): T | undefined

    lastOne(): T | undefined
    lastOne(predicate: (v: T) => boolean): T | undefined

    any(predicate: (v: T) => boolean): boolean

    all(predicate: (v: T) => boolean): boolean

    contains(value: T): boolean

    aggregate<U>(init: U, func: SelectorMut<U, T, U>): U
}

function comparerDefault<T>(l: T, r: T): number {
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
            comparer ?? comparerDefault,
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
            comparer ?? comparerDefault,
            true
        )
    }

    groupBy<K>(keySelector: Mapper<T, K>): IEnumerable<IGrouping<K, T>>
    groupBy<K, E>(
        keySelector: Mapper<T, K>,
        elementSelector: Mapper<T, E>
    ): IEnumerable<IGrouping<K, E>>
    groupBy<K, E>(
        keySelector: Mapper<T, K>,
        elementSelector?: Mapper<T, E>
    ): IEnumerable<IGrouping<K, T | E>> {
        return elementSelector
            ? new GroupedEnumerable(this, keySelector, elementSelector)
            : new GroupedEnumerable(this, keySelector, (v) => v)
    }

    concat(other: Iterable<T>): IEnumerable<T> {
        return new ConcatEnumerable(this, other)
    }

    zip<U>(other: Iterable<U>): IEnumerable<[T, U]>
    zip<U, R>(
        other: Iterable<U>,
        resultSelector: SelectorMut<T, U, R>
    ): IEnumerable<R>
    zip<U, R>(
        other: Iterable<U>,
        resultSelector?: SelectorMut<T, U, R>
    ): IEnumerable<R | [T, U]> {
        return resultSelector
            ? new ZipEnumerable(this, other, resultSelector)
            : new ZipEnumerable(this, other, (first: T, second: U): [T, U] => [
                  first,
                  second,
              ])
    }

    distinct(): IEnumerable<T> {
        return new DistinctEnumerable(this)
    }

    union(other: Iterable<T>): IEnumerable<T> {
        return new UnionEnumerable(this, other)
    }

    intersect(other: Iterable<T>): IEnumerable<T> {
        return new IntersectEnumerable(this, other)
    }

    except(other: Iterable<T>): IEnumerable<T> {
        return new ExceptEnumerable(this, other)
    }

    reverse(): IEnumerable<T> {
        return new ReverseEnumerable(this)
    }

    toArray(): T[] {
        return [...this]
    }

    get count(): number {
        let total = 0
        for (const v of this) total++
        return total
    }

    firstOne(): T | undefined
    firstOne(predicate: (v: T) => boolean): T | undefined
    firstOne(predicate?: (v: T) => boolean): T | undefined {
        predicate = predicate ?? ((v: T) => true)
        for (const v of this) {
            if (predicate(v)) return v
        }
    }

    lastOne(): T | undefined
    lastOne(predicate: (v: T) => boolean): T | undefined
    lastOne(predicate?: (v: T) => boolean): T | undefined {
        predicate = predicate ?? ((v: T) => true)
        let result: T | undefined
        for (const v of this) {
            if (predicate(v)) result = v
        }
        return result
    }

    any(predicate: (v: T) => boolean): boolean {
        for (const v of this) {
            if (predicate(v)) return true
        }

        return false
    }

    all(predicate: (v: T) => boolean): boolean {
        for (const v of this) {
            if (!predicate(v)) return false
        }

        return true
    }

    contains(value: T): boolean {
        for (const v of this) if (v === value) return true
        return false
    }

    aggregate<U>(init: U, func: SelectorMut<U, T, U>): U {
        let result = init
        for (const v of this) {
            result = func(result, v)
        }
        return result
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

    override lastOne(predicate?: (v: T) => boolean): T | undefined {
        predicate = predicate ?? ((v: T) => true)

        for (let i = this.source.length - 1; i >= 0; i--)
            if (predicate(this.source[i])) return this.source[i]
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
    get count(): number
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

    *appalyResultSelector<R>(
        resultSelector: SelectorMut<K, IEnumerable<E>, R>
    ) {
        for (const g of this.groupings) {
            yield resultSelector(g.key, g)
        }
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

    static create<T, K, E>(
        source: IEnumerable<T>,
        keySelector: Mapper<T, K>,
        elementSelector: Mapper<T, E>
    ): Lookup<K, E> {
        const lookup = new Lookup<K, E>()
        for (const v of source) {
            const k = keySelector(v)
            if (!lookup.has(k)) lookup.createGrouping(k)
            lookup.getGrouping(k).add(elementSelector(v))
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
    thenBy<K>(keySelector: Mapper<T, K>): IOrderedEnumberable<T>
    thenBy<K>(
        keySelector: Mapper<T, K>,
        comparer: Comparer<K>
    ): IOrderedEnumberable<T>

    thenByDescending<K>(keySelector: Mapper<T, K>): IOrderedEnumberable<T>
    thenByDescending<K>(
        keySelector: Mapper<T, K>,
        comparer: Comparer<K>
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

    thenBy<K>(keySelector: Mapper<T, K>): IOrderedEnumberable<T>
    thenBy<K>(
        keySelector: Mapper<T, K>,
        comparer: Comparer<K>
    ): IOrderedEnumberable<T>
    thenBy<K>(
        keySelector: Mapper<T, K>,
        comparer?: Comparer<K>
    ): IOrderedEnumberable<T> {
        return this.createOrderedEnumerable(
            keySelector,
            comparer ?? comparerDefault,
            false
        )
    }

    thenByDescending<K>(keySelector: Mapper<T, K>): IOrderedEnumberable<T>
    thenByDescending<K>(
        keySelector: Mapper<T, K>,
        comparer: Comparer<K>
    ): IOrderedEnumberable<T>
    thenByDescending<K>(
        keySelector: Mapper<T, K>,
        comparer?: Comparer<K>
    ): IOrderedEnumberable<T> {
        return this.createOrderedEnumerable(
            keySelector,
            comparer ?? comparerDefault,
            true
        )
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

class GroupedEnumerable<T, K, E> extends Enumerable<IGrouping<K, E>> {
    constructor(
        private readonly source: IEnumerable<T>,
        private readonly keySelector: Mapper<T, K>,
        private readonly elementSelector: Mapper<T, E>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<IGrouping<K, E>, any, undefined> {
        const lookup = Lookup.create(
            this.source,
            this.keySelector,
            this.elementSelector
        )
        yield* lookup
    }
}

class ConcatEnumerable<T> extends Enumerable<T> {
    constructor(
        private readonly first: Iterable<T>,
        private readonly second: Iterable<T>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        for (const v of this.first) yield v
        for (const v of this.second) yield v
    }
}

class ZipEnumerable<T, U, R> extends Enumerable<R> {
    constructor(
        private readonly first: Iterable<T>,
        private readonly second: Iterable<U>,
        private readonly resultSelector: SelectorMut<T, U, R>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<R, any, undefined> {
        let firstIt = this.first[Symbol.iterator]()
        let secondIt = this.second[Symbol.iterator]()
        do {
            const firstResult = firstIt.next()
            if (firstResult.done) break
            const secondResult = secondIt.next()
            if (secondResult.done) break
            yield this.resultSelector(firstResult.value, secondResult.value)
        } while (true)
    }
}

class DistinctEnumerable<T> extends Enumerable<T> {
    private readonly set = new Set<T>()

    constructor(private readonly source: IEnumerable<T>) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        for (const v of this.source) {
            if (this.set.has(v)) continue
            this.set.add(v)
            yield v
        }
    }
}

class UnionEnumerable<T> extends Enumerable<T> {
    private readonly set = new Set<T>()

    constructor(
        private readonly first: Iterable<T>,
        private readonly second: Iterable<T>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        for (const v of this.first) {
            if (this.set.has(v)) continue
            this.set.add(v)
            yield v
        }

        for (const v of this.second) {
            if (this.set.has(v)) continue
            this.set.add(v)
            yield v
        }
    }
}

class IntersectEnumerable<T> extends Enumerable<T> {
    private readonly set = new Set<T>()

    constructor(
        private readonly first: Iterable<T>,
        private readonly second: Iterable<T>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        for (const v of this.second) this.set.add(v)
        for (const v of this.first) {
            if (!this.set.has(v)) continue
            this.set.delete(v)
            yield v
        }
    }
}

class ExceptEnumerable<T> extends Enumerable<T> {
    private readonly set = new Set<T>()

    constructor(
        private readonly first: Iterable<T>,
        private readonly second: Iterable<T>
    ) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        for (const v of this.second) this.set.add(v)
        for (const v of this.first) {
            if (this.set.has(v)) continue
            this.set.add(v)
            yield v
        }
    }
}

class ReverseEnumerable<T> extends Enumerable<T> {
    constructor(private readonly source: IEnumerable<T>) {
        super()
    }

    override *[Symbol.iterator](): Iterator<T, any, undefined> {
        const arr = this.source.toArray()
        for (let i = arr.length - 1; i >= 0; i--) yield arr[i]
    }
}

class RangeEnumerable extends Enumerable<number> {
    constructor(
        private readonly start: number,
        private readonly count_: number
    ) {
        super()
    }

    *[Symbol.iterator](): Iterator<number, any, undefined> {
        for (let i = 0; i < this.count_; i++) yield this.start + i
    }
}

class RepeatEnumerable<T> extends Enumerable<T> {
    constructor(
        private readonly el: T,
        private readonly count_: number
    ) {
        super()
    }

    *[Symbol.iterator](): Iterator<T, any, undefined> {
        for (let i = 0; i < this.count_; i++) yield this.el
    }
}
