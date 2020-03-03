import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { parseArgs } from '@replit/clui-gql';
import Output from './Output';
import ErrorOutput from './ErrorOutput';
import PromptIcon from './PromptIcon';
import Row from './Row';
import CliForm from './Form';

const MutationPrompt = props => {
  const [submitted, setSubmitted] = React.useState(null);

  const parsed = React.useMemo(
    () =>
      parseArgs({
        args: submitted || props.args || {},
        command: props.command
      }),
    [props.args, props.command, submitted]
  );

  const [mutate, { data, loading, error, called }] = useMutation(props.doc, {
    fetchPolicy: 'no-cache'
  });

  React.useEffect(() => {
    if (
      called ||
      parsed.missing.required ||
      (parsed.missing.optional && !submitted)
    ) {
      return;
    }

    mutate({
      variables: parsed.variables
    });
  }, [parsed, mutate, called]);

  React.useEffect(() => {
    if ((data || error) && props.item) {
      props.item.next();
    }
  }, [data, error]);

  if (error) {
    return <ErrorOutput error={error} />;
  }

  if (loading) {
    return (
      <Row>
        <PromptIcon />
        <div>loading...</div>
      </Row>
    );
  }

  if (data) {
    return <Output output={props.toOutput(data)} />;
  }

  if (parsed.missing.optional || parsed.missing.required) {
    return (
      <CliForm
        command={props.command}
        args={props.args}
        onSubmit={setSubmitted}
        onCancel={() => {
          if (props.item) {
            props.item.remove().next();
          }
        }}
      />
    );
  }

  return <div />;
};

export default MutationPrompt;
