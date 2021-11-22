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

import _, { filter, partial, sortBy } from 'lodash'

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

const simpleCurry = () => {}

const simplePartial = () => {}

const filterBooksByAqua = partial<Book[], (_: Book) => boolean, Book[]>(
  filter,
  _,
  ({ author }) => author === 'aqua'
)

// filterBooksByAqua(books)

const sortBooks = partial<Book[], (_: Book) => number, Book[]>(
  sortBy,
  _,
  ({ price }) => price
)

const flow = compose(filterBooksByAqua, sortBooks)
