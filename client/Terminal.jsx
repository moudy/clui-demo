import React from 'react';
import camelize from 'camelize';
import gql from 'graphql-tag';
import get from 'lodash.get';
import merge from 'lodash.merge';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { parse } from 'graphql';
import { Session } from '@replit/clui-session';
import { visit } from '@replit/clui-gql';
import QueryPrompt from './QueryPrompt';
import MutationPrompt from './MutationPrompt';
import clear from './commands/clear';
import email from './commands/email';

import Prompt from './Prompt';

const applyRunFn = command => {
  // eslint-disable-next-line
  command.run = ({ operation, field, path }) => {
    if (field.type.name !== 'CluiOutput') {
      // The type has no output so the command should have no `run` function
      // This type could still have sub-commands with output
      return null;
    }

    const Component = command.query === 'query' ? QueryPrompt : MutationPrompt;

    // eslint-disable-next-line react/prop-types
    return ({ args }) => (
      <Component
        args={camelize(args)}
        field={field}
        doc={parse(operation)}
        toOutput={data => {
          return get(data, path);
        }}
      />
    );
  };
};

const Terminal = () => {
  const client = useApolloClient();

  const search = async query =>
    client.query({
      query: gql`
        query Q($query: String) {
          search(query: $query) {
            name
            email
          }
        }
      `,
      variables: { query },
      fetchPolicy: 'network-only'
    });

  const { error, data } = useQuery(
    gql`
      query {
        command
      }
    `
  );

  if (error) {
    return (
      <p>
        Error :(
        {error.toString()}
      </p>
    );
  }

  let command;

  if (data && data.command) {
    command = JSON.parse(data.command);
    visit(command, applyRunFn);
    command.email = email;
    command.clear = clear;
  }

  return (
    <div>
      {!command ? (
        'loading...'
      ) : (
        <Session>
          <Prompt command={command} />
        </Session>
      )}
      <style jsx>
        {`
          div {
            padding: 20px;
            min-height: 100vh;
            background-color: #222;
            color: white;
          }
        `}
      </style>
    </div>
  );
};

export default Terminal;
