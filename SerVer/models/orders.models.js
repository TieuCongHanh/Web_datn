var db = require('./db');
const ordersSchema = new db.mongoose.Schema(
    {
        id_user: { type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel' },
        total_price: { type: db.mongoose.Schema.Types.ObjectId, ref: 'paymentModel' },
        delivery_status: { type: String, require: true },
        id_deliver: {type: db.mongoose.Schema.Types.ObjectId, ref: 'deliverModel'},
        date: { type: String, default: true },
    },
    {
        collection: 'orders'
    }
)
let ordersModel = db.mongoose.model('ordersModel', ordersSchema);

module.exports = { ordersModel };