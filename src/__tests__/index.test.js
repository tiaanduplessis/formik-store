import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { Formik } from 'formik'
import BasicErrorBoundary from 'react-basic-error-boundary'
import FormikStore from '../'

import 'babel-polyfill'

const containers = []

const render = element => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  containers.push(container)
  act(() => { ReactDOM.render(element, container) })
}

afterEach(() => {
  containers.forEach(container => {
    act(() => { ReactDOM.unmountComponentAtNode(container) })
    container.remove()
  })
  containers.length = 0
})

const wait = () => new Promise(resolve => setTimeout(resolve, 1000))

test('FormikStore should persist form state in storage', async () => {
  const internal = {}

  const storage = {
    getItem: jest.fn(() => {}),
    setItem: jest.fn((key, val) => {
      internal.key = key
      internal.val = JSON.parse(val)
    })
  }

  const initialValues = { foo: 'bar', bar: 'baz' }
  let injected = null

  render(
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {props => {
        injected = props
        return (
          <div>
            <FormikStore name='test' debounce={0} storage={storage} />
          </div>
        )
      }}
    </Formik>
  )

  act(() => { injected.setFieldValue('foo', 'pong') })

  await wait()

  expect(storage.getItem).toHaveBeenCalled()
  expect(storage.setItem).toHaveBeenCalled()
  expect(internal.key).toBe('test')
  expect(internal.val).toMatchObject({ values: { foo: 'pong', bar: 'baz' } })
})

test('FormikStore should throw if missing props', () => {
  const noNameError = jest.fn()
  render(
    <BasicErrorBoundary onError={noNameError} fallback={() => null}>
      <FormikStore />
    </BasicErrorBoundary>
  )
  expect(noNameError).toHaveBeenCalled()
})

test.each([{}, '{}'])('empty storage leaves initial values and validation alone (%p)', async state => {
  const validate = jest.fn(() => ({}))
  const storage = { getItem: jest.fn(() => state), setItem: jest.fn() }
  const initialValues = { text: '', count: 0, checked: false, items: [] }
  let injected

  render(
    <Formik initialValues={initialValues} validate={validate} onSubmit={() => {}}>
      {props => {
        injected = props
        return <FormikStore name='test' debounce={0} storage={storage} />
      }}
    </Formik>
  )

  await wait()

  expect(injected.values).toEqual(initialValues)
  expect(injected.touched).toEqual({})
  expect(injected.errors).toEqual({})
  expect(validate).not.toHaveBeenCalled()
  expect(storage.setItem).not.toHaveBeenCalled()
})

test('restores persisted values without changing subsequent validation', async () => {
  const state = { values: { text: 'saved', count: 0, checked: false, items: [] } }
  const validate = jest.fn(() => ({}))
  const storage = { getItem: () => JSON.stringify(state), setItem: jest.fn() }
  let injected

  render(
    <Formik initialValues={{ text: 'initial' }} validate={validate} onSubmit={() => {}}>
      {props => {
        injected = props
        return <FormikStore name='test' debounce={0} storage={storage} />
      }}
    </Formik>
  )

  await wait()
  expect(injected.values).toEqual(state.values)

  act(() => { injected.setFieldValue('text', 'edited') })
  await wait()

  expect(injected.values.text).toBe('edited')
  expect(validate).toHaveBeenCalled()
  expect(validate.mock.calls[0][0]).toEqual({ ...state.values, text: 'edited' })
})
