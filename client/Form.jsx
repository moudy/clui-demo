import React from 'react';
import { getScalarType, isNonNull } from './parseArgs';
import Controls from './Controls';

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE':
      return {
        ...state,
        ...action.updates
      };
    default:
      return state;
  }
};

const Title = ({ children }) => <div>{children}</div>;

const TextInput = ({ description, ...props }) => (
  <div>
    <input {...props} placeholder={props.name} />
    {description ? (
      <Description>
        {description}
        {props.required ? '' : ' (optional)'}
      </Description>
    ) : null}
    {!description && !props.required ? (
      <Description>optional</Description>
    ) : null}
    <style jsx>
      {`
        input {
          appearance: none;
          font-size: inherit;
          display: block;
          width: 100%;
          outline: 0 none;
          margin: 0;
          color: inherit;
        }
        input:focus {
          outline: 0 none;
        }
        label {
          color: gray;
        }
      `}
    </style>
  </div>
);

const CheckboxInput = ({ description, ...props }) => (
  <div>
    <div className="flex">
      <input type="checkbox" {...props} />
      <label htmlFor={props.name}>{props.name}</label>
    </div>
    {description ? (
      <Description>
        {description}
        {props.required ? '' : ' (optional)'}
      </Description>
    ) : null}
    {!description && !props.required ? (
      <Description>optional</Description>
    ) : null}
    <style jsx>
      {`
        .flex {
          margin-top: 10px;
          display: flex;
          align-items: center;
        }
        label {
          margin-left: 10px;
          display: block;
        }
      `}
    </style>
  </div>
);

const Description = ({ children }) => (
  <div>
    {children}
    <style jsx>
      {`
        div {
          font-size: 13px;
          color: gray;
        }
      `}
    </style>
  </div>
);

// Generates a form base on graphql introspection data for a given command
const CliForm = props => {
  const { command, args } = props;

  const initialState = Object.keys(args || {}).reduce((acc, key) => {
    const arg = command.args.find(fa => fa.name === key);

    if (arg && args) {
      const value = args[key];
      const isBoolType = getScalarType(arg.type) === 'Boolean';
      const isUndefined = typeof value === 'undefined';
      const isBoolValue = typeof value === 'boolean';

      if (isBoolType && !isUndefined) {
        acc[key] = true;
      } else if (!isUndefined && !isBoolValue) {
        acc[key] = value;
      }
    }

    return acc;
  }, {});

  const [state, dispatch] = React.useReducer(reducer, initialState);

  const onSubmit = e => {
    e.preventDefault();
    props.onSubmit(state);
  };

  const update = React.useCallback(
    updates => dispatch({ type: 'UPDATE', updates }),
    [dispatch]
  );

  const autoFocuscommand = Object.values(command.args).find(
    fa => fa.type !== 'boolean' && !state[fa.name]
  );

  return (
    <div className="wrap">
      <form onSubmit={onSubmit}>
        {command.description ? <Title>{command.description}</Title> : null}
        {Object.values(command.args).map(arg => {
          const common = {
            key: arg.name,
            name: arg.name,
            theme: props.theme,
            required: isNonNull(arg.type),
            description: arg.description || undefined
          };

          const value = state[arg.name];

          return arg.type === 'boolean' ? (
            <CheckboxInput
              {...common}
              checked={!!state[arg.name]}
              onChange={e => {
                update({ [arg.name]: e.currentTarget.checked });
              }}
            />
          ) : (
            <TextInput
              {...common}
              autoFocus={autoFocuscommand && autoFocuscommand.name === arg.name}
              value={typeof value === 'string' ? value : ''}
              onChange={e => update({ [arg.name]: e.currentTarget.value })}
            />
          );
        })}
        <Controls onCancel={props.onCancel} />
      </form>
      <style jsx>
        {`
          .wrap {
            margin-top: 10px;
            margin-bottom: 10px;
            max-width: 600px;
          }
          form {
            margin: 20px 0;
            display: grid;
            grid-row-gap: 10px;
          }
        `}
      </style>
    </div>
  );
};

export default CliForm;
