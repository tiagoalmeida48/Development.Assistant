import { GraphQLClient } from 'graphql-request'
import { API_CONFIG } from '@/config/api'

export const graphqlClient = new GraphQLClient(API_CONFIG.endpoint, {
  headers: API_CONFIG.headers,
})

export const graphqlQueries = {
  compareDatabases: `
    query CompareDatabases($connectionString1: String!, $connectionString2: String!, $dbType: DbType!) {
      compareDatabases(
        connectionString1: $connectionString1
        connectionString2: $connectionString2
        dbType: $dbType
      ) {
        database1
        database2
        differentTables {
          database
          table
          columns {
            name
            type
            isPrimaryKey
            isNullable
            isIdentity
          }
        }
        differentRegisters {
          table
          totalRegisters1
          totalRegisters2
        }
      }
    }
  `,
  getTables: `
    query Tables($connectionString: String!, $dbType: DbType!) {
      tables(connectionString: $connectionString, dbType: $dbType)
    }
  `,
  databaseTypes: `
    query GetDatabaseTypes {
      databaseTypes
    }
  `,
}

export const graphqlMutations = {
  createPocoClass: `
    mutation CreatePocoClass($input: PocoClassInput!) {
      createPocoClass(input: $input) {
        success
        message
      }
    }
  `,
  copyProject: `
    mutation CopyProject(
      $sourceProjectPath: String!
      $destinationProjectPath: String!
      $oldNamespace: String!
      $newNamespace: String!
    ) {
      copyProject(
        sourceProjectPath: $sourceProjectPath
        destinationProjectPath: $destinationProjectPath
        oldNamespace: $oldNamespace
        newNamespace: $newNamespace
      ) {
        success
        message
      }
    }
  `,
}
