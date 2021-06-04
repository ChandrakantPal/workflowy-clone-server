const { model, Schema } = require('mongoose')

const taskSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  subTasks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'tasks',
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
})

module.exports = model('Task', taskSchema)
