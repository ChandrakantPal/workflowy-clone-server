const { UserInputError, AuthenticationError } = require('apollo-server')

const Task = require('../../models/Task')
const checkAuth = require('../../utils/checkAuth')

module.exports = {
  Mutation: {
    createSubTask: async (_, { taskId, body }, context) => {
      const { username, id } = checkAuth(context)
      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not be empty',
          },
        })
      }
      const newSubTask = new Task({
        body,
        user: id,
        username: username,
        createdAt: new Date().toISOString(),
        isRoot: false,
        subTasks: [],
      })
      const subTask = await newSubTask.save()
      const task = await Task.findById(taskId)

      if (task) {
        task.subTasks.unshift({
          subTaskId: subTask._id,
          subTaskTitle: subTask.body,
        })
        console.log({ task })
        await task.save()
        return task
      } else {
        throw new UserInputError('Post not founnd')
      }
    },
    deleteSubTask: async (_, { taskId, subTaskId }, context) => {
      const { username } = checkAuth(context)

      const task = await Task.findById(taskId)

      if (task) {
        const subTaskIndex = task.subTasks.findIndex(
          (subTask) => subTask.id === subTaskId
        )

        if (task.subTasks[subTaskIndex].username === username) {
          task.subTasks.splice(subTaskIndex, 1)
          await task.save()
          return task
        } else {
          throw new AuthenticationError('Action not allowed')
        }
      } else {
        throw new UserInputError('Post not founnd')
      }
    },
  },
}
