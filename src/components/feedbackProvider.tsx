import * as React from 'react'

import {sendFeedback} from '../utils/api'
import { ComponentType } from 'react';

interface State {
  sending: boolean,
  sent: boolean,
  error: Error | null
}

export interface FeedbackProps {
  onSubmitFeedback?(message: string): Promise<void>,
  feedbackState?: State
}

export default (Component: ComponentType<FeedbackProps>) => class extends React.PureComponent<any, any> {
  state: State = {
    sending: false,
    sent: false,
    error: null
  }

  onSubmit = async (message: string) => {
    this.setState({sending: true})
    try {
      await sendFeedback(message)
      this.setState({sending: false, sent: true, error: null})
    } catch (error) {
      this.setState({sending: false, error})
    }
  }

  render() {
    return (
      <Component
        onSubmitFeedback={this.onSubmit}
        feedbackState={this.state}
        {...this.props} />
    )
  }
}