const { AuthenticationError, UserInputError } = require('apollo-server')

const Task = require('../../models/Task')
const checkAuth = require('../../utils/checkAuth')

module.exports = {
  Query: {
    async getTasks() {
      try {
        const tasks = await Task.find({ isRoot: true }).sort({ createdAt: -1 })
        return tasks
      } catch (error) {
        throw new Error(error)
      }
    },
    async getTask(_, { taskId }) {
      try {
        const task = await Task.findById(taskId)
        if (task) {
          return task
        } else {
          throw new Error('Task not found')
        }
      } catch (error) {
        throw new Error(error)
      }
    },
  },
  Mutation: {
    async createTask(_, { body }, context) {
      const user = checkAuth(context)
      // console.log(user);
      if (body.trim() === '') {
        throw new Error('Task body must not be empty')
      }
      const newTask = new Task({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        isRoot: true,
        subTasks: [],
      })

      const task = await newTask.save()

      context.pubsub.publish('NEW_TASK', {
        newTask: task,
      })

      return task
    },
    async deleteTask(_, { taskId }, context) {
      const user = checkAuth(context)
      try {
        const task = await Task.findById(taskId)
        const deleteSubTask = (subTasksToDelete) => {
          if (subTasksToDelete.subTasks.length > 0) {
            subTasksToDelete.subTasks.forEach(async (subTask) => {
              const sub = await Task.findById(subTask.subTaskId)
              if (sub.subTasks.length > 0) {
                deleteSubTask(sub)
              }
              await (await Task.findById(subTask.subTaskId)).delete()
            })
          }
        }
        if (user.username === task.username) {
          deleteSubTask(task)
          await task.delete()
          return 'Task deleted Sucessfully'
        } else {
          throw new AuthenticationError('Action not allowed')
        }
      } catch (error) {
        throw new Error(error)
      }
    },
  },
  Subscription: {
    newTask: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_TASK'),
    },
  },
}
