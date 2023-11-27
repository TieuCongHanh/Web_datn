var db = require('./db');
const addressSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.String},
        id_user: {type: db.mongoose.Schema.Types.String, ref: 'userModel'},
        address: {type: String, require: true},
        phone: {type: String, require: true}
    },
    {
        collection: 'address'
    }
)


// Middleware "pre" để tự động tăng giá trị _id lên 1 
addressSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        addressModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxStaff) => {
                // Tăng giá trị ID lên 1
                const regex = /^DC(\d+)$/;
                const maxIdMatch = regex.exec(maxStaff?._id || '');
                const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
                const formattedId = "DC" + String(nextId).padStart(3, '0');
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

let addressModel = db.mongoose.model('addressModel', addressSchema);

module.exports = { addressModel };
