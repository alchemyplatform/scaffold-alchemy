import { GraphQLClient } from "graphql-request";
import { subgraphEndpoint } from "~~/config";

export const graphQlClient = new GraphQLClient(subgraphEndpoint);
