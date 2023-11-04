var db = require('./db');
const deliverSchema = new db.mongoose.Schema(
    {
        name: { type: String, require: true },
        phone: { type: Number, require: true },
        location: { type: String, require: true },
        email: {type: String, require: true},
    },
    {
        collection: 'deliver'
    }
)
let deliverModel = db.mongoose.model('deliverModel', deliverSchema);

module.exports = { deliverModel };