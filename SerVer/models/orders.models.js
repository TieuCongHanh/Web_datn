var db = require('./db');
const ordersSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.Number},
        id_user: { type: db.mongoose.Schema.Types.Number, ref: 'userModel' },
        id_staff: { type: db.mongoose.Schema.Types.Number, ref: 'staffModel' },
        total_price: { type: db.mongoose.Schema.Types.Number, ref: 'paymentModel' },
        delivery_status: { type: String, require: true },
        id_address: {type: db.mongoose.Schema.Types.Number, ref: 'addressModel'},
        date: { type: String, require : true },
    },
    {
        collection: 'orders'
    }
)


// Middleware "pre" để tự động tăng giá trị _id lên 1 khi có người dùng mới
ordersSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        ordersModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxOrders) => {
                // Tăng giá trị ID lên 1
                const nextId = maxOrders ? maxOrders._id + 1 : 1;
                doc._id = nextId;
                next();
            })
            .catch((error) => {
                next(error);
            });
    } else {
        next();
    }
});

let ordersModel = db.mongoose.model('ordersModel', ordersSchema);

module.exports = { ordersModel };