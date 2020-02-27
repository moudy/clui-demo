import React from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import Output from './Output';
import { parseArgs } from './parseArgs';
import ErrorOutput from './ErrorOutput';
import PromptIcon from './PromptIcon';
import Row from './Row';
import CliForm from './Form';

const QueryPrompt = props => {
  const [submitted, setSubmitted] = React.useState(null);

  const parsed = React.useMemo(
    () =>
      parseArgs({
        argsProp: submitted || props.args || {},
        fieldArgs: props.field.args
      }),
    [props.args, props.field.args, submitted]
  );

  const [query, { data, loading, error, called }] = useLazyQuery(props.doc, {
    fetchPolicy: 'network-only'
  });

  React.useEffect(() => {
    if (
      called ||
      parsed.missing.required ||
      (parsed.missing.optional && !submitted)
    ) {
      return;
    }

    query({
      variables: parsed.variables
    });
  }, [parsed, query, called]);

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
        field={props.field}
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

export default QueryPrompt;

