import React from 'react';

const Controls = props => (
  <div>
    <button onClick={props.onCancel} type="button">
      cancel
    </button>
    <button type="submit">{props.text || 'submit'}</button>
    <style jsx>
      {`
        div {
          display: flex;
          justify-content: space-between;
        }
      `}
    </style>
  </div>
);

export default Controls;
