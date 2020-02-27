import React from 'react';
import MarkdownIt from 'markdown-it';
import PromptIcon from './PromptIcon';
import Row from './Row';

const md = new MarkdownIt();

const Output = props => {
  const { output } = props;

  if (output.__typename === 'CluiErrorOutput') {
    return (
      <Row>
        <PromptIcon error />
        <div>{output.error}</div>
      </Row>
    );
  }

  if (output.__typename === 'CluiMarkdownOutput' && output.markdown) {
    return (
      <Row>
        <div dangerouslySetInnerHTML={{ __html: md.render(output.markdown) }} />
        <style jsx>
          {`
            div {
              padding: 20px;
              margin: 10px 0;
              background-color: black;
            }
            div > :global(*:first-child) {
              margin-top: 0;
            }
          `}
        </style>
      </Row>
    );
  }

  if (output.__typename === 'CluiSuccessOutput') {
    return (
      <Row>
        <PromptIcon success />
        <div>{output.message}</div>
      </Row>
    );
  }

  return (
    <Row>
      <PromptIcon />
      <div>no output</div>
    </Row>
  );
};

export default Output;
