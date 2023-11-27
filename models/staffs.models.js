var db = require('./db');
const staffSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.String},
        role: { type: String, require: true },
        name: { type: String, require: true },
        image: {type: String, require: false},
        address: {type: String, require: false},
        phone: {type: String, require: true},
        date: {type: String, require: true},
        gender: {type: String, require: true},
        email: {type: String, require: false}
    },
    {
        collection: 'staff'
    }
)

// Middleware "pre" để tự động tăng giá trị _id lên 1 
staffSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        staffModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxStaff) => {
                // Tăng giá trị ID lên 1
                const regex = /^NV(\d+)$/;
                const maxIdMatch = regex.exec(maxStaff?._id || '');
                const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
                const formattedId = "NV" + String(nextId).padStart(3, '0');
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

let staffModel = db.mongoose.model('staffModel', staffSchema);

module.exports = { staffModel };