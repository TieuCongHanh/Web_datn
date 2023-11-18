var db = require('./db');
const userSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.Number},
        username: { type: String, require: true },
        name: { type: String, require: true },
        password: { type: String, require: true },
        role: { type: String, require: true },
        userEmail: { type: String, require: true },
        image: {type: String, require: false},
        phone: {type: String, require: true},
        isActive: { type: Boolean, default: true },
    },
    {
        collection: 'user'
    }
)

// Middleware "pre" để tự động tăng giá trị _id lên 1 khi có người dùng mới
userSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        userModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
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

let userModel = db.mongoose.model('userModel', userSchema);

module.exports = { userModel };