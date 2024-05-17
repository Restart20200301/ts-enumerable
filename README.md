## show code

### where + select

```js
stream([1, 2, 3, 3, 6, 8, 8, 9, 4])
    .where((v) => v % 2 === 0)
    .select((v) => String(v))
    .toArray()
```

### order by

```js
stream(a)
    .orderBy((v) => v.age)
    .toArray()

stream(a)
    .orderByDescending((v) => v)
    .toArray()
```

### join

```js
const s = stream(students)
    .join(
        departments,
        (s) => s.departmentId,
        (d) => d.id,
        (s, d) => ({ s, d })
    )
    .join(
        teachers,
        (cd) => cd.d.tearcherId,
        (t) => t.id,
        (cd, t) => ({
            name: `${cd.s.firstName} ${cd.s.lastName}`,
            departmentName: `${cd.d.name}`,
            teacherName: `${t.first} ${t.last}`,
        })
    )
```
