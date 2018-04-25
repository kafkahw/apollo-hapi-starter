const Hapi = require('hapi');
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');
const { makeExecutableSchema } = require('graphql-tools');

const HOST = 'localhost';
const PORT = 3000;


// Some fake data
const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// The GraphQL schema in string form
const typeDefs = `
  type Query { books: [Book] }
  type Book { title: String, author: String }
`;

// The resolvers
const resolvers = {
  Query: { books: () => books },
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
