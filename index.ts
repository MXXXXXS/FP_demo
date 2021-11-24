const arrayOfWords = ['a', 'b', 'c', 'd']

for (let index = 0; index < arrayOfWords.length; index++) {
  const word = arrayOfWords[index]
  console.log(word)
}

arrayOfWords.forEach((word) => console.log(word))

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

import _, { filter, flow, partial, sortBy } from 'lodash'

const booksByAqua = filter(books, ({ author }) => author === 'aqua')
const booksSortByPrice = sortBy(booksByAqua, ({ price }) => price)

// console.log(booksSortByPrice)

// ---

sortBy(
  filter(books, ({ author }) => author === 'aqua'),
  ({ price }) => price
)

// ---

type Step<T> = (_: T) => T
const compose =
  <T>(step1: Step<T>, step2: Step<T>) =>
  (c: T) =>
    step2(step1(c))

const numbers = [1, 2, 3, 4, 5, 6]

const square = (x: number) => x ** 2

const plusOne = (x: number) => x + 1

const plusOneAndSquare = compose<number>(plusOne, square)

// console.log(numbers.map(plusOneAndSquare));

// ---

const multiply = (x: number, y: number) => x * y

type FunctionWithTwoArgs<T> = (arg1: T, arg2: T) => T

const simpleCurry =
  <T>(fn: FunctionWithTwoArgs<T>, arg1: T) =>
  (arg2: T) =>
    fn(arg1, arg2)

const multiplyY = simpleCurry(multiply, 2)

// console.log(multiplyY(3))

const add = (x: number, y: number) => x + y

const addY = simpleCurry(add, 3)

const addAndMultiplyY = compose(addY, multiplyY)

// console.log(addAndMultiplyY(1))

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

// console.log(addAndMultiplyX(1))

// ---

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

// console.log(bookPipeline(booksA))
// console.log(bookPipeline(booksB))
