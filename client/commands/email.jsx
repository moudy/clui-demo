import React from 'react';
import Controls from '../Controls';
import PromptIcon from '../PromptIcon';
import Row from '../Row';

const Email = props => {
  const ta = React.useRef(null);
  const [value, setValue] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (ta.current) {
      ta.current.focus();
    }
  }, []);

  const onSubmit = e => {
    e.preventDefault();

    setSubmitted(true);

    if (props.item) {
      props.item.next();
    }
  };

  if (submitted) {
    return (
      <Row>
        <PromptIcon success />
        <div>{`email sent to ${props.contact.email}`}</div>
      </Row>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        to:
        {props.contact.email}
      </div>
      <div className="textarea">
        <textarea
          ref={ta}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={`Write something to ${props.contact.name}`}
        />
      </div>
      <Controls
        onCancel={() => {
          if (props.item) {
            props.item.remove().next();
          }
        }}
      />
      <style jsx>
        {`
          form {
            margin: 20px 0;
          }
          .textarea {
            display: flex;
          }
          textarea {
            flex: 1 1 auto;
            min-height: 200px;
            margin: 10px 0;
            padding: 10px;
          }
        `}
      </style>
    </form>
  );
};

export default search => {
  return {
    description: 'Email contact',
    commands: async query => {
      const res = await search(query);

      if (res.data.search) {
        return res.data.search.reduce((acc, contact) => {
          acc[contact.email] = {
            description: contact.name,
            run: () => <Email contact={contact} />
          };

          return acc;
        }, {});
      }

      return {};
    }
  };
};
