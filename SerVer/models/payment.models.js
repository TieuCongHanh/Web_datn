var db = require('./db');
const paymentSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.Number},
        method: { type: String, require: true },
        amount: {type: String, require: false},
        describle: {type: String, require: false},
    },
    {
        collection: 'payment'
    }
)


paymentSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
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