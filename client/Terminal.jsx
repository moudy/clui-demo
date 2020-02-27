import React from 'react';
import camelize from 'camelize';
import gql from 'graphql-tag';
import get from 'lodash.get';
import merge from 'lodash.merge';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { parse } from 'graphql';
import { Session } from '@replit/clui-session';
import { toCommand } from '@replit/clui-gql';
import QueryPrompt from './QueryPrompt';
import MutationPrompt from './MutationPrompt';
import TYPE_QUERY from './typeQuery';
import clear from './commands/clear';
import email from './commands/email';

import Prompt from './Prompt';

const makeCommand = (typeData, operationType) => {
  const runFn = ({ operation, field, path }) => {
    if (field.type.name !== 'CluiOutput') {
      // The type has no output so the command should have no `run` function
      // This type could still have sub-commands with output
      return null;
    }

    console.log({ path });
    const Component = operationType === 'query' ? QueryPrompt : MutationPrompt;

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

  return toCommand({
    operation: operationType,
    type: typeData,
    mountPath: [],
    runFn,
    outputFn: () => ({
      fields: '...CluiOutput',
      fragments: `
fragment CluiOutput on CluiOutput {
  ...on CluiSuccessOutput {
    message
  }
  ...on CluiMarkdownOutput {
    markdown
  }
  ...on CluiErrorOutput {
    error
  }
}`
    })
  });
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

  const { error, data } = useQuery(TYPE_QUERY, {
    variables: { name: 'Query' }
  });

  if (error) {
    return (
      <p>
        Error :(
        {error.toString()}
      </p>
    );
  }

  const command =
    data && data.query
      ? {
          commands: merge(
            { clear, email: email(search) },
            makeCommand(data.query, 'query').commands
          )
        }
      : null;

  if (command && command.commands.search) {
    delete command.commands.search;
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
