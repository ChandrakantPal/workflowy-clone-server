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
        const ids = []
        if (task.subTasks.length > 0) {
          task.subTasks.map((task) => {
            ids.push(task.subTaskId)
          })
        }
        const subTasks = await Task.find({ _id: { $in: ids } })
        if (task) {
          return { task, subTasks }
        } else {
          throw new Error('Task not found')
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    async getSubTasks(_, { subTaskIds }) {
      try {
        const ids = []
        subTaskIds.map((task) => {
          ids.push(task.subTaskId)
        })
        const subTasks = await Task.find({ _id: { $in: ids } })
        if (subTasks) {
          return subTasks
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
        isDone: false,
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
    async markDone(_, { taskId }, context) {
      checkAuth(context)
      const task = await Task.findById(taskId)
      if (task) {
        if (task.isDone) {
          // task already done, undo it
          task.isDone = false
        } else {
          // not done, mark done
          task.isDone = true
        }
        await task.save()
        return task
      } else {
        throw new UserInputError('Post not founnd')
      }
    },
    async editTask(_, { taskId, body }, context){
      checkAuth(context)
      if (body.trim() === '') {
        throw new Error('Task body must not be empty')
      }
      const task = await Task.findById(taskId)
      if (task) {
        if (task.isDone) {
        task.body = body
        await task.save()
        return task
      } else {
        throw new UserInputError('Post not founnd')
      }
    }
  },
  Subscription: {
    newTask: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_TASK'),
    },
  },
}
