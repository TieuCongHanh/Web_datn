var db = require('./db');


const notificationSchema = new db.mongoose.Schema({
  id_user: { type: db.mongoose.Schema.Types.String, ref: 'user' },
  message: String,
  createdAt: { type: Date, default: Date.now }
},{
  collection: 'notification'
});

let notificationModel = db.mongoose.model('notificationModel', notificationSchema);
module.exports = { notificationModel };