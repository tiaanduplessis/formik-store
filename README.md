
# formik-store
[![package version](https://img.shields.io/npm/v/formik-store.svg?style=flat-square)](https://npmjs.org/package/formik-store)
[![package downloads](https://img.shields.io/npm/dm/formik-store.svg?style=flat-square)](https://npmjs.org/package/formik-store)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![package license](https://img.shields.io/npm/l/formik-store.svg?style=flat-square)](https://npmjs.org/package/formik-store)
[![make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Persist and populate Formik form using storage of your choice

## Table of Contents

- [About](#about)
- [Usage](#usage)
- [Install](#install)
- [Contribute](#contribute)
- [License](#License)

## About

This package is mostly based on [formik-persist](https://github.com/jaredpalmer/formik-persist), but adds some additional features I required such as:

- Setting a custom storage method as long as it is localstorage/sessionstorage API complaint.
- Ignoring certain values from storage.
- Support for Async storage method e.g. `storage.getItem('foo').then(...)`

If you don't need any of these things, use [formik-persist](https://github.com/jaredpalmer/formik-persist) instead.

## Usage

```js
import React from 'react'
import { Formik, Field, Form } from 'formik'
import FormikStore from 'formik-store'

export const Signup = () =>
  <div>
    <h1>My Uncool Persisted Form</h1>
    <Formik
      onSubmit={values => console.log(values)}
      initialValues={{ firstName: '', lastName: '', email: '' }}
      render={props =>
        <Form className="whatever">
          <Field name="firstName" placeholder="First Name" />
          <Field name="lastName" placeholder="Last Name" />
          <Field name="email" type="email" placeholder="Email Address" />
          <button type="submit">Submit</button>
          <FormikStore name="signup" storage={window.sessionStorage} ignore={['email']} />
        </Form>}
    />
  </div>;
```


## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com). 

```sh
$ npm install formik-store
$ # OR
$ yarn add formik-store
```

## Contribute

1. Fork it and create your feature branch: `git checkout -b my-new-feature`
2. Commit your changes: `git commit -am "Add some feature"`
3. Push to the branch: `git push origin my-new-feature`
4. Submit a pull request

## License

MIT © Tiaan du Plessis
    