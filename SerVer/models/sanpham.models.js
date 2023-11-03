var db = require('./db');
const sanphamSchema = new db.mongoose.Schema(
    {
        name: {type: String, require: true},
        price: {type: String, require: true},
        describe: {type: String, require: true},
        image: {type: String, require: false},
    },
     {collection: 'sanpham'}
);
let sanphamModel = db.mongoose.model('sanphamModel', sanphamSchema);
module.exports = { sanphamModel };