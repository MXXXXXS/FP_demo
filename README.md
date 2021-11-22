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

``` typescript
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

```typescript
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

``` typescript
sortBy(
  filter(books, ({ author }) => author === 'aqua'),
  ({ price }) => price
)
```

这种风格有其局限性

- 这在步骤更多的时候会导致更深层的嵌套
- 难以复用, 本质上各个函数构成了一条处理流程, 但这条流程在这种写法下难以复用

如果将每个函数看作一节管道, 事先拼接好管道再使用, 就更方便
我们可以写一个简单的组合函数

```typescript
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

```typescript
[ 4, 9, 16, 25, 36, 49 ]
```

现在可以复用plusOneAndSquar`这个操作流程了, 相比之前手动嵌套好了很多

但这种方式依然有局限性:

- 只针对单个的参数输入输出
- 无法应用到之前的书本的处理逻辑

## Currying与Partial application


## 更完善的流
