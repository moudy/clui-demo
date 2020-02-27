import React from 'react';
import PromptIcon from './PromptIcon';
import Row from './Row';

const ErrorOutput = props => {
  const { networkError } = props.error;

  const msgs =
    networkError && networkError.result && networkError.result.errors
      ? networkError.result.errors.map(e => e.message)
      : [props.error.toString()];

  return (
    <Row>
      <PromptIcon error />
      <div>
        {msgs.map(msg => (
          <div key={msg}>{msg}</div>
        ))}
      </div>
    </Row>
  );
};

export default ErrorOutput;

