var db = require('./db');
const sanphamSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.Number},
        name: {type: String, require: true},
        price: {type: String, require: true},
        describe: {type: String, require: true},
        quantity: {type:String, require:true},
        image: {type: String, require: false},
    },
     {collection: 'sanpham'}
);

// Middleware "pre" để tự động tăng giá trị _id lên 1 khi có người dùng mới
sanphamSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        sanphamModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
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

let sanphamModel = db.mongoose.model('sanphamModel', sanphamSchema);
module.exports = { sanphamModel };