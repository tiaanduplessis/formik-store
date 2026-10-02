import FormikStore from '../'

import 'babel-polyfill'

const Store = FormikStore.WrappedComponent
const defaults = { name: 'test', debounce: 0, ignore: [] }

// Observe the existing hydration promise without changing lifecycle behavior.
const mount = component => {
  const then = jest.spyOn(Promise.prototype, 'then')
  try {
    component.componentDidMount()
    return then.mock.results[0].value
  } finally {
    then.mockRestore()
  }
}

const createStore = storageState => {
  const formik = { setFormikState: jest.fn() }
  const storage = {
    getItem: jest.fn(() => storageState),
    setItem: jest.fn()
  }
  const component = new Store({ ...defaults, formik, storage })
  return { component, formik, storage }
}

describe.each([
  ['synchronous', value => value],
  ['asynchronous', value => Promise.resolve(value)]
])('%s storage hydration', (description, store) => {
  test.each([
    ['null', null],
    ['undefined', undefined],
    ['empty object', {}],
    ['serialized empty object', '{}'],
    ['empty array', []],
    ['serialized empty array', '[]'],
    ['serialized null', 'null']
  ])('does not hydrate %s', async (description, state) => {
    const { component, formik, storage } = createStore(store(state))

    await mount(component)

    expect(storage.getItem).toHaveBeenCalledWith('test')
    expect(formik.setFormikState).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  test.each([
    ['form state', { values: { text: '', count: 0, checked: false, other: null } }],
    ['empty form values', { values: {} }],
    ['array field', { values: { items: [] } }],
    ['top-level array previously accepted', [{ values: { text: 'saved' } }]],
    ['partial form state', { touched: {}, errors: {} }]
  ])('preserves %s in object and JSON storage', async (description, state) => {
    for (const value of [state, JSON.stringify(state)]) {
      const { component, formik } = createStore(store(value))

      await mount(component)

      expect(formik.setFormikState).toHaveBeenCalledTimes(1)
      expect(formik.setFormikState).toHaveBeenCalledWith(state)
    }
  })
})

test('uses session storage by default', async () => {
  const state = { values: { text: 'saved' } }
  window.sessionStorage.setItem('test', JSON.stringify(state))
  const formik = { setFormikState: jest.fn() }
  const component = new Store({ ...defaults, formik })

  try {
    await mount(component)
    expect(formik.setFormikState).toHaveBeenCalledWith(state)
  } finally {
    window.sessionStorage.removeItem('test')
  }
})

test('retains the default debounce and ignored fields', () => {
  expect(Store.defaultProps).toEqual({ debounce: 300, ignore: [] })
})

test('does not hydrate when storage throws synchronously', () => {
  const { component, formik, storage } = createStore(null)
  const error = new Error('storage unavailable')
  storage.getItem.mockImplementation(() => { throw error })

  expect(() => component.componentDidMount()).toThrow(error)
  expect(formik.setFormikState).not.toHaveBeenCalled()
})

test('does not hydrate when asynchronous storage rejects', async () => {
  const error = new Error('storage unavailable')
  const { component, formik } = createStore(Promise.reject(error))

  await expect(mount(component)).rejects.toBe(error)
  expect(formik.setFormikState).not.toHaveBeenCalled()
})

test('does not hydrate malformed JSON', async () => {
  const { component, formik } = createStore('{')

  await expect(mount(component)).rejects.toBeInstanceOf(SyntaxError)
  expect(formik.setFormikState).not.toHaveBeenCalled()
})

test('requires a Formik instance before reading storage', () => {
  const storage = { getItem: jest.fn() }
  const component = new Store({ ...defaults, storage })

  expect(() => component.componentDidMount()).toThrow('FormikStore must be wrapped in Formik')
  expect(storage.getItem).not.toHaveBeenCalled()
})
