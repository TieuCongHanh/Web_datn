var db = require('./db');
const ordersSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.String},
        id_user: { type: db.mongoose.Schema.Types.String, ref: 'userModel' },
        id_staff: { type: db.mongoose.Schema.Types.String, ref: 'staffModel' },
        total_price: { type: db.mongoose.Schema.Types.String, ref: 'paymentModel' },
        delivery_status: { type: String, require: true },
        id_address: {type: db.mongoose.Schema.Types.String, ref: 'addressModel'},
        date: { type: String, require : true },
    },
    {
        collection: 'orders'
    }
)


// Middleware "pre" để tự động tăng giá trị _id lên 1 
ordersSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        ordersModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxStaff) => {
                // Tăng giá trị ID lên 1
                const regex = /^OD(\d+)$/;
                const maxIdMatch = regex.exec(maxStaff?._id || '');
                const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
                const formattedId = "OD" + String(nextId).padStart(3, '0');
                doc._id = formattedId;
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