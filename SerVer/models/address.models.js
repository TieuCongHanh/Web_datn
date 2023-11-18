var db = require('./db');
const addressSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.Number},
        id_user: {type: db.mongoose.Schema.Types.Number, ref: 'userModel'},
        address: {type: String, require: false}
    },
    {
        collection: 'address'
    }
)


// Middleware "pre" để tự động tăng giá trị _id lên 1 
addressSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
    
        addressModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
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

let addressModel = db.mongoose.model('addressModel', addressSchema);

module.exports = { addressModel };
