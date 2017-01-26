import React from 'react'
import {browserHistory} from 'react-router'
import key from 'keymaster'
import {connect} from 'react-redux'

import Text from './Text'
import css from '../styles/Modal.scss'

class Modal extends React.PureComponent {
  componentDidMount() {
    key('esc', () => browserHistory.replace('/'))
  }
  render() {
    const {modal} = this.props
    return (
      <div className={css.container + (modal.open ? ' ' + css.open : '')}>
        <div className={css.overlay} onClick={() => browserHistory.replace('/')}></div>
        <div className={css.content}>{modal.component}</div>
        <div className={css.closeText} onClick={() => browserHistory.replace('/')}><Text id="closeModal" /></div>
      </div>
    )
  }
}

const mapState = state => ({
  modal: state.value.modal,
})

export default connect(mapState)(Modal)
