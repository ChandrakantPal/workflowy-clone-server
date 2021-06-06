const { gql } = require('apollo-server')

module.exports = gql`
  type Task {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
    isDone: Boolean!
    isRoot: Boolean!
    subTasks: [SubTask]
  }
  type SubTask {
    subTaskId: ID!
    subTaskTitle: String!
  }
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    createdAt: String!
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  type Query {
    getTasks: [Task]
    getTask(taskId: ID!): Task
    login(username: String!, password: String!): User!
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    createTask(body: String!): Task!
    deleteTask(taskId: ID!): String!
    createSubTask(taskId: ID!, body: String!): Task!
    deleteSubTask(taskId: ID!, subTaskId: ID!): Task!
    markDone(taskId: ID!): Task!
  }
  type Subscription {
    newTask: Task!
  }
`
