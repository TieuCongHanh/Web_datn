var db = require('./db');
const deliverSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.Number},
        name: { type: String, require: true },
        phone: { type: Number, require: true },
        location: { type: String, require: true },
        email: {type: String, require: true},
    },
    {
        collection: 'deliver'
    }
)

// Middleware "pre" để tự động tăng giá trị _id lên 1 khi có người dùng mới
deliverSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        deliverModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxUser) => {
                // Tăng giá trị ID lên 1
                const nextId = maxUser ? maxUser._id + 1 : 1;
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

let deliverModel = db.mongoose.model('deliverModel', deliverSchema);

module.exports = { deliverModel };