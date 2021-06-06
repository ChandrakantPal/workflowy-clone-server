const tasksResolvers = require('./tasks')
const usersResolvers = require('./users')
const subTasksResolvers = require('./subTasks')

module.exports = {
  Query: {
    ...usersResolvers.Query,
    ...tasksResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...tasksResolvers.Mutation,
    ...subTasksResolvers.Mutation,
  },
  Subscription: {
    ...tasksResolvers.Subscription,
  },
}
