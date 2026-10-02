import { Component } from 'react'
import { connect } from 'formik'
import isEqual from 'react-fast-compare'
import debounce from 'debounce-promise'
import omit from 'object.omit'

class FormikStore extends Component {
    static defaultProps = {
      debounce: 300,
      ignore: []
    }

    componentDidMount () {
      const { storage = window.sessionStorage, formik, name } = this.props

      if (!name) {
        throw new Error('No name provided as prop for FormikStore')
      }

      if (!formik) {
        throw new Error('FormikStore must be wrapped in Formik')
      }

      Promise.resolve(storage.getItem(name)).then(storageState => {
        const state = typeof storageState === 'string' ? JSON.parse(storageState) : storageState
        if (state && typeof state === 'object' && Object.keys(state).length > 0) {
          formik.setFormikState(state)
        }
      })
    }

    saveState = debounce((data) => {
      const { ignore, storage = window.sessionStorage, name } = this.props
      data.values = omit(data.values, ignore)
      return storage.setItem(name, JSON.stringify(data))
    }, this.props.debounce)

    componentDidUpdate (prevProps) {
      const { formik } = this.props
      if (!isEqual(prevProps.formik, formik)) {
        this.saveState(formik)
      }

      return false
    }

    render () {
      return null
    }
}

export default connect(FormikStore)
