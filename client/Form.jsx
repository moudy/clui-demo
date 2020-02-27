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

// Generates a form base on graphql introspection data for a given field
const CliForm = props => {
  const { field, args } = props;

  const initialState = Object.keys(args || {}).reduce((acc, key) => {
    const fieldArg = field.args.find(fa => fa.name === key);

    if (fieldArg && args) {
      const value = args[key];
      const isBoolType = getScalarType(fieldArg.type) === 'Boolean';
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

  const autoFocusField = field.args.find(
    fa => getScalarType(fa.type) !== 'Boolean' && !state[fa.name]
  );

  return (
    <div className="wrap">
      <form onSubmit={onSubmit}>
        {field.description ? <Title>{field.description}</Title> : null}
        {field.args.map(fieldArg => {
          const common = {
            key: fieldArg.name,
            name: fieldArg.name,
            theme: props.theme,
            required: isNonNull(fieldArg.type),
            description: fieldArg.description || undefined
          };

          const value = state[fieldArg.name];

          return getScalarType(fieldArg.type) === 'Boolean' ? (
            <CheckboxInput
              {...common}
              checked={!!state[fieldArg.name]}
              onChange={e => {
                update({ [fieldArg.name]: e.currentTarget.checked });
              }}
            />
          ) : (
            <TextInput
              {...common}
              autoFocus={
                autoFocusField && autoFocusField.name === fieldArg.name
              }
              value={typeof value === 'string' ? value : ''}
              onChange={e => update({ [fieldArg.name]: e.currentTarget.value })}
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
