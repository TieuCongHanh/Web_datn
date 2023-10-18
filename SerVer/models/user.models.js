var db = require('./db');
const userSchema = new db.mongoose.Schema(
    {
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
let userModel = db.mongoose.model('userModel', userSchema);

module.exports = { userModel };