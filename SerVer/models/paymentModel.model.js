var db = require('./db');
const paymentSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.Number},
        id_order: { type: db.mongoose.Schema.Types.Number, ref: 'orderModel' },
        method: { type: String, require: true },
        amount: {type: String, require: false},
        describle: {type: String, require: false},
    },
    {
        collection: 'payment'
    }
)


// Middleware "pre" để tự động tăng giá trị _id lên 1 khi có người dùng mới
paymentSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        paymentModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
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

let paymentModel = db.mongoose.model('paymentModel', paymentSchema);

module.exports = { paymentModel };