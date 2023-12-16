var db = require('./db');
const ratingSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.String},
        id_user: {type: db.mongoose.Schema.Types.String, ref: 'userModel'},
        user_username: {type: String, require: true},
        user_name: {type: String, require: true},
        id_product: {type: db.mongoose.Schema.Types.String, ref: 'sanphamModel'},
        product_name: {type: String, require: true},
        rating: {type: String, require: false}
    },
    {
        collection: 'rating'
    }
)

// Middleware "pre" để tự động tăng giá trị _id lên 1 
ratingSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
        // Tìm người dùng có giá trị ID lớn nhất
        ratingModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxStaff) => {
                // Tăng giá trị ID lên 1
                const regex = /^DG(\d+)$/;
                const maxIdMatch = regex.exec(maxStaff?._id || '');
                const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
                const formattedId = "DG" + String(nextId).padStart(3, '0');
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

let ratingModel = db.mongoose.model('ratingModel', ratingSchema);


module.exports = { ratingModel };