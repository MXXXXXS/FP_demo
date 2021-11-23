# 什么是函数式编程

函数式编程是一种写代码的风格, 灵感来源于数学中的函数, 比如 y=f(x)

## 函数的特质

函数具有一些特质

- 必须接受一个参数, 并输出一个结果
- 函数只操作它接受的参数, 并不会对外部产生影响
- 输入相同的x, 输出相同的y

## 纯函数(Pure Functions)

在程序设计领域, 满足以上几点性质的函数被称为纯函数(Pure Functions)

## 为什么要这么写

纯函数的特质带来了很多好处

### 测试

不对外部产生影响(低耦合), 相同的输入有相同的输出(幂等)

这两点特质使得测试纯函数非常容易, 能稳定复现预期结果, 和已有业务逻辑完全解耦

### 并行

低耦合的特点使得纯函数可以并行执行, 这可以带来显著的性能提升

### 缓存

相同输入导致相同输出

这带来了优化的空间, 可以建立一个x-y的键值对表来缓存已有的计算结果, 尤其对于大计算量的操作来说提升非常明显

vue里computed值的设计也遵循了函数式编程思想(这也就是为什么在computed里修改外部数据会被eslint报错, 纯函数是不能有副作用的), 免去了重复的dom渲染

react的设计也非常函数式, hook api usememo(扮演vue里computed值的角色)监视依赖数组的变化来决定是否更新; 函数式组件即具有纯函数特征的组件, 相同的数据渲染确定的dom

### 组合

unix哲学: 一个工具干一件事, 复杂功能通过组合来完成

在命令行里经常使用|来组合命令, 把各个功能用管道接起来, 前者的输入是后者的输出

比如一个任务: 编辑所有当前目录下的配置文件(.zshrc, .npmrc, .vimrc...)

```bash
ls -a . | grep '.*rc' | xargs vim
```

先列出所有文件, 筛选出配置文件, 再用编辑器打开

函数式编程的设计完美符合了这个理念, 一个函数输入x, 输出y, y又可以作为另一个函数的输入

将复杂功能拆分成多个功能单一的纯函数, 通过组合来使用
比如lodash就非常函数式, 日常经常会写出类似的代码: 找到aqua写的书, 按价格升序排列

``` ts
interface Book {
  price: number
  name: string
  author: string
}

const books: Book[] = [
  { price: 12, name: 'a', author: 'aqua' },
  { price: 15, name: 'b', author: 'megumi' },
  { price: 9, name: 'c', author: 'aqua' },
]

import { filter, sortBy } from 'lodash'

const booksByAqua = filter(books, ({ author }) => author === 'aqua')
const booksSortByPrice = sortBy(booksByAqua, ({ price }) => price)

console.log(booksSortByPrice)
```

输出

```ts
[
  { price: 9, name: 'c', author: 'aqua' },
  { price: 12, name: 'a', author: 'aqua' }
]
```

## 纯函数的组合

纯函数的特质使其非常易于组合起来构成复杂功能, 以下介绍一些常见的组合方式

### 流

流的概念在上面已经有了一个简单的示例了, 就是一个函数的输出可以作为另一个函数的输入

像上面的例子使用了中间变量来存储中间值, 我们也可写成嵌套的风格

``` ts
sortBy(
  filter(books, ({ author }) => author === 'aqua'),
  ({ price }) => price
)
```

这种风格有其局限性

- 这在步骤更多的时候会导致更深层的嵌套
- 难以复用, 本质上各个函数构成了一条处理流程, 这种嵌套的写法调整起来不方便

这催生了一个想法: 

如果将每个函数看作一节管道, 依据需求拼接好管线再使用, 就会非常方便 

我们可以写一个简单的组合函数

```ts
type Step<T> = (_: T) => T

const compose =
  <T>(step1: Step<T>, step2: Step<T>) =>
  (c: T) =>
    step2(step1(c))

const numbers = [1, 2, 3, 4, 5, 6]

const square = (x: number) => x**2

const plusOne = (x: number) => x + 1

const plusOneAndSquare = compose<number>(plusOne, square)

console.log(numbers.map(plusOneAndSquare));
```

输出

```ts
[ 4, 9, 16, 25, 36, 49 ]
```

现在可以复用plusOneAndSquar`这个操作流程了, 相比之前手动嵌套好了很多

但这种方式依然有局限性:

- 只针对单个的参数输入输出, 对于多参函数没法组合

## 多参函数的组合

为了解决上面的简单的compose无法组合具有多参的函数问题，这里引入了 Currying 与 Partial application 两种技巧

### Currying

翻译过来叫“柯里化”

用一个例子来说明

```ts
const multiply = (x: number, y: number) => x * y

type FunctionWithTwoArgs<T> = (arg1: T, arg2: T) => T

const simpleCurry =
  <T>(fn: FunctionWithTwoArgs<T>, arg1: T) =>
  (arg2: T) =>
    fn(arg1, arg2)

const multiplyY = simpleCurry(multiply, 2)

console.log(multiplyY(3))
```

输出

```ts
6
```

现在就可以用之前的compose来组合有多参的函数了

```ts
const add = (x: number, y: number) => x + y

const addY = simpleCurry(add, 3)

const addAndMultiply = compose(addY, multiplyY)

console.log(addAndMultiply(1))
```

输出

```ts
8
```

经过currying的多参函数可以分多次接受参数，可以被compose进行组合构成一条管道

经过currying的函数先固定了参数x, 继而接受y，那么如果需要先固定y再接受x怎么办？

这就暴露了其局限性：

- 入参顺序是确定的, 无法处理多参函数任意顺序的参数填入

### Partial application

为了解决currying的固定入参局限性，这里引入另一种技巧 partial application

用一个例子来说明

```ts
const simplePartial = <T>(
  fn: (...args: T[]) => T,
  ...partialArgs: (T | undefined)[]
) => {
  const args = partialArgs
  return (...restArgs: T[]) => {
    let arg = 0
    for (let index = 0; index < args.length; index++) {
      const partialArg = args[index]
      if (partialArg === undefined) args[index] = restArgs[arg++]
    }
    return fn(...(args as T[]))
  }
}

const addX = simplePartial(add, undefined, 3)
const multiplyX = simplePartial(multiply, undefined, 4)

const addAndMultiplyX = compose(addX, multiplyX)

console.log(addAndMultiplyX(1))

```

输出

```ts
16
```

这里用了`undefined`作为占位符，函数在不同位置固定部分参数，之后再接受全部参数

解决了currying的顺序局限性

## 多参函数的流

上面的 compose，simpleCurry, simplePartial 在lodash中都有个更完善的实现flow，curry, partial

下面回到最开始的问题，拼接管道，复用管线，有了下面这个更贴近现实一点的例子

```ts
const filterBooksByAlex = partial<Book[], (_: Book) => boolean, Book[]>(
  filter,
  _,
  ({ author }) => author === 'Alex'
)

const sortBooks = partial<Book[], (_: Book) => number, Book[]>(
  sortBy,
  _,
  ({ price }) => price
)

const bookPipeline = flow(filterBooksByAlex, sortBooks)

const booksA: Book[] = [
  {
    price: 13,
    name: 'b',
    author: 'Alex',
  },
  {
    price: 20,
    name: 'b',
    author: 'Steve',
  },
  {
    price: 17,
    name: 'c',
    author: 'Alex',
  },
]

const booksB: Book[] = [
  {
    price: 33,
    name: 'd',
    author: 'Alex',
  },
  {
    price: 30,
    name: 'e',
    author: 'Steve',
  },
  {
    price: 7,
    name: 'f',
    author: 'Alex',
  },
]

console.log(bookPipeline(booksA))
console.log(bookPipeline(booksB))
```

输出

``` ts
[
  { price: 13, name: 'b', author: 'Alex' },
  { price: 17, name: 'c', author: 'Alex' }
]
[
  { price: 7, name: 'f', author: 'Alex' },
  { price: 33, name: 'd', author: 'Alex' }
]
```