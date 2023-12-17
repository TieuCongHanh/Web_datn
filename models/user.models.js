var db = require('./db');
const userSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.String},
        username: { type: String, require: true },
        name: { type: String, require: true },
        password: { type: String, require: true },
        role: { type: String, require: true },
        userEmail: { type: String, require: true },
        image: {type: String, require: false},
        phone: {type: String, require: true},
        isActive: { type: Boolean, default: true },
        deviceToken: { type: String, require: false }
    },
    {
        collection: 'user'
    }
)


// Middleware "pre" để tự động tăng giá trị _id lên 1 
userSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        userModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxStaff) => {
                // Tăng giá trị ID lên 1
                const regex = /^KH(\d+)$/;
                const maxIdMatch = regex.exec(maxStaff?._id || '');
                const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
                const formattedId = "KH" + String(nextId).padStart(3, '0');
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

let userModel = db.mongoose.model('userModel', userSchema);

module.exports = { userModel };