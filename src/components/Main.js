import React from 'react'
import {bindActionCreators} from 'redux'
import {Provider} from 'react-redux'
import page from 'page'
import key from 'keymaster'
import http from '../utils/http'
import GA from 'react-ga'

import store from '../store'
import {setToken} from '../store/actions/preferences'
import {setView, setDayOffset, closeModal} from '../store/actions/values'
import parseAuth from '../utils/parseAuth'
import App from './App'

// import all views
import Menus from './Menus'
import PrivacyPolicy from './PrivacyPolicy'
import Contact from './Contact'
import Beta from './Beta'
import Settings from './Settings'
import NotFound from './NotFound'

window.isBeta = location.hostname === 'beta.kanttiinit.fi' || location.hostname === 'localhost'

// keyboard shortcuts
key('left,right', (event, handler) => {
  const offset = handler.shortcut === 'left' ? -1 : 1
  store.dispatch(setDayOffset(store.getState().value.dayOffset + offset))
})

key('esc', () => store.dispatch(closeModal()))

// analytics setup
GA.initialize('UA-55969084-5', {
  debug: process.env.NODE_ENV !== 'production'
})

// routing
const routes = {
  '/': Menus,
  '/privacy-policy': PrivacyPolicy,
  '/beta': Beta,
  '/contact': Contact,
  '/settings': Settings,
  '*': NotFound
}

Object.keys(routes).forEach(path => {
  page(path, () => {
    if (window.ga) {
      window.ga('send', 'pageview', path)
    }
    const route = {
      path,
      view: React.createElement(routes[path])
    }
    store.dispatch(setView(route))
    GA.set({page: path})
    GA.pageview(path)
  })
})
page()

// login if auth token is in URL
const auth = parseAuth(page)
if (auth) {
  http.get(`/me/login?${auth.provider}Token=${auth.token}`)
  .then(response => {
    store.dispatch(setToken(response.token))
  })
}

// export app wrapped in store provider
export default () => (
  <Provider store={store}>
     <App />
  </Provider>
)
