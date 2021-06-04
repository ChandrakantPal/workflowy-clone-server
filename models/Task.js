const { model, Schema } = require('mongoose')

const taskSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  subTask: [
    {
      body: String,
      username: String,
      createdAt: String,
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
})

module.exports = model('Task', taskSchema)
