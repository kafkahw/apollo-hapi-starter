const Hapi = require('hapi');
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');
const { makeExecutableSchema } = require('graphql-tools');

const HOST = 'localhost';
const PORT = 3000;

const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
  { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
];

const posts = [
  { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
  { id: 2, authorId: 2, title: 'Welcome to Apollo', votes: 3 },
  { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
  { id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7 },
];

const typeDefs = `
  type Author {
    id: Int!
    firstName: String
    lastName: String
    posts: [Post] # the list of Posts by this author
  }

  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }

  # the schema allows the following query:
  type Query {
    posts: [Post]
    author(id: Int!): Author
  }
`;


const resolvers = {
  Query: {
    posts: () => posts,
    author: (_, { id }) => authors.find(author => author.id === id),
  },
  Author: {
    posts: (author) => posts.filter(post => post.authorId === author.id),
  },
  Post: {
    author: (post) => authors.find(author => author.id === post.authorId),
  },
};


// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});


async function StartServer() {
  const server = new Hapi.server({
    host: HOST,
    port: PORT,
  });

  await server.register([
    {
      plugin: graphqlHapi,
      options: {
        path: '/graphql',
        graphqlOptions: {
          schema,
        },
        route: {
          cors: true,
        },
      },
    },
    {
      plugin: graphiqlHapi,
      options: {
        path: '/graphiql',
        graphiqlOptions: {
          endpointURL: '/graphql',
        },
      },
    }
  ]);

  try {
    await server.start();
  } catch (err) {
    console.log(`Error while starting server: ${err.message}`);
  }

  console.log(`Server running at: ${server.info.uri}`);
}

StartServer();
