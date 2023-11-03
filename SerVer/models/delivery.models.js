var db = require('./db');
const deliverySchema = new db.mongoose.Schema(
    {
        name: { type: String, require: true },
        phone: { type: Number, require: true },
        location: { type: String, require: true },
        email: {type: String, require: true},
    },
    {
        collection: 'delivery'
    }
)
let deliveryModel = db.mongoose.model('deliveryModel', deliverySchema);

module.exports = { deliveryModel };