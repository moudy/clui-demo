const { ApolloServer, gql } = require('apollo-server-express');
const json2md = require('json2md');
const faker = require('faker');

let contacts = [];

let count = 0;

while (count < 100) {
  contacts.push({
    name: faker.name.findName(),
    email: faker.internet.email()
  });

  // eslint-disable-next-line
  count++;
}

const typeDefs = gql`
  type CluiSuccessOutput {
    message: String!
  }

  type CluiMarkdownOutput {
    markdown: String!
  }

  type CluiErrorOutput {
    error: String!
  }

  type Contact {
    name: String!
    email: String!
  }

  union CluiOutput = CluiSuccessOutput | CluiMarkdownOutput | CluiErrorOutput

  "Manage contacts"
  type Contacts {
    "List contacts"
    list: CluiOutput
    "Add a new contact"
    add(name: String!, email: String!): CluiOutput
    "Remove an existing contact"
    remove(email: String!): CluiOutput
  }

  type Query {
    "Manage contacts"
    contacts: Contacts
    search(query: String): [Contact!]!
  }
`;

const resolvers = {
  Query: {
    contacts: () => ({}),
    search: (ctx, args) => {
      const filtered = args.query
        ? contacts.filter(
            c =>
              c.name.toLowerCase().includes(args.query.toLowerCase()) ||
              c.email.toLowerCase().includes(args.query.toLowerCase())
          )
        : contacts;

      return filtered;
    }
  },
  Contacts: {
    list: () => {
      const markdown = json2md([
        {
          table: {
            headers: ['name', 'email'],
            rows: contacts.map(c => ({ name: c.name, email: c.email }))
          }
        }
      ]);

      return { markdown };
    },
    add: (ctx, args) => {
      const existing = contacts.find(c => c.email === args.email);

      if (existing) {
        return { error: `Contact with email: "${args.email}" already exists` };
      }

      contacts.push(args);

      const markdown = json2md([
        {
          p: 'Added contact'
        },
        {
          table: {
            headers: ['name', 'email'],
            rows: [args]
          }
        }
      ]);

      return { markdown };
    },
    remove: (ctx, args) => {
      const existing = contacts.find(c => c.email === args.email);

      if (!existing) {
        return { error: `Contact with email: "${args.email}" not found` };
      }

      contacts = contacts.filter(c => c.email !== existing.email);

      return { message: `Removed contact: "${existing.email}"` };
    }
  },
  CluiOutput: {
    __resolveType(obj) {
      if (obj.error) {
        return 'CluiErrorOutput';
      }

      if (obj.markdown) {
        return 'CluiMarkdownOutput';
      }

      return 'CluiSuccessOutput';
    }
  }
};

module.exports = server => {
  const apollo = new ApolloServer({ typeDefs, resolvers });
  apollo.applyMiddleware({ app: server });
};
