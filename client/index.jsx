import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import client from './apollo';
import 'draft-js/dist/Draft.css';

import Terminal from './Terminal';

const App = () => (
  <ApolloProvider client={client}>
    <Terminal />
    <style jsx global>
      {`
        body * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: 'Inconsolata', monospace;
        }
        table {
          display: block;
          width: 100%;
          overflow: auto;
          border-spacing: 0;
          border-collapse: collapse;
        }

        tr {
          // background-color: #fff;
          border-top: 1px solid #c6cbd1;
        }

        th,
        td {
          padding: 6px 13px;
          border: 1px solid #dddddd;
        }

        button {
          color: inherit;
          background-color: black;
          padding: 8px 16px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.9);
        }

        button:hover {
          background-color: cornflowerblue;
          color: white;
        }

        textarea,
        input,
        button {
          color: inherit;
          border: 0 none;
        }

        textarea,
        input {
          background-color: #000;
          padding: 10px;
        }
      `}
    </style>
  </ApolloProvider>
);

render(<App />, document.getElementById('root'));
