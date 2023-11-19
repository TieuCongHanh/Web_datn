var db = require('./db');
const sanPhamModel = require("../models/sanpham.models");


const orderDetailSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.String},
        id_order: {type: db.mongoose.Schema.Types.String, ref: 'ordersModel'},
        id_product: {type: db.mongoose.Schema.Types.String, ref: 'sanphamModel'},
        quantity: {type: Number , require: true},
        total_price: {type: Number, require: true},
    },
    {
        collection: 'orderDetail'
    }
)

// Middleware "pre" để tự động tăng giá trị _id lên 1 
orderDetailSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        orderDetailModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxStaff) => {
                // Tăng giá trị ID lên 1
                const regex = /^CT(\d+)$/;
                const maxIdMatch = regex.exec(maxStaff?._id || '');
                const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
                const formattedId = "CT" + String(nextId).padStart(3, '0');
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

orderDetailSchema.pre('save', async function (next) {
    const doc = this;

    // Kiểm tra xem có cần tính lại giá trị total_price hay không
    if (doc.isModified('quantity') || doc.isModified('id_product')) {
        try {
        
            const product = await sanPhamModel.sanphamModel.findById(doc.id_product).exec();

            // Tính toán giá trị total_price
            const total_price = doc.quantity * product.price;

            // Gán giá trị total_price vào trường tương ứng
            doc.total_price = total_price;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

let orderDetailModel = db.mongoose.model('orderDetailModel', orderDetailSchema);

module.exports = { orderDetailModel };