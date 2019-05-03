import React from 'react'
import { render, cleanup } from 'react-testing-library'
import { Formik } from 'formik'
import BasicErrorBoundary from 'react-basic-error-boundary'
import FormikStore from '../'

import 'babel-polyfill'

afterEach(cleanup)

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

  injected.setFieldValue('foo', 'pong')

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
