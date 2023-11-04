var db = require('./db');
const addressSchema = new db.mongoose.Schema(
    {
        id_user: {type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel'},
        address: {type: String, require: false}
    },
    {
        collection: 'address'
    }
)
let addressModel = db.mongoose.model('addressModel', addressSchema);

module.exports = { addressModel };