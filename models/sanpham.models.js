var db = require('./db');
const sanphamSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.String},
        id_category: {type: db.mongoose.Schema.Types.String, ref: "categoryModel" },
        name: {type: String, require: true},
        price: {type: String, require: true},
        describe: {type: String, require: true},
        image: {type: String, require: true},
        quantity: {type : Number, require : true},
        importHistory: [
            {
                date: { type: Date, default: Date.now },
                quantity: { type: Number }
            }
        ]
    },
     {collection: 'sanpham'}
);

sanphamSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        sanphamModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxStaff) => {
                const regex = /^SP(\d+)$/;
                const maxIdMatch = regex.exec(maxStaff?._id || '');
                const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
                const formattedId = "SP" + String(nextId).padStart(3, '0');
                doc._id = formattedId;

                const previousQuantity = doc.quantity; // Lưu giá trị quantity trước khi import
                doc.quantity = previousQuantity + doc.quantity; // Cộng số lượng quantity của sanpham

                doc.importHistory.push({
                    date: new Date(),
                    quantity: doc.quantity - previousQuantity // Lưu giá trị số lượng đã import
                });
                
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