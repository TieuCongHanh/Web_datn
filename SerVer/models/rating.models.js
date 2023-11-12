var db = require('./db');
const ratingSchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.Number},
        id_user: {type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel'},
        rating: {type: String, require: false}
    },
    {
        collection: 'rating'
    }
)
let ratingModel = db.mongoose.model('ratingModel', ratingSchema);


// Middleware "pre" để tự động tăng giá trị _id lên 1 
ratingSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {
    
        ratingModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxOrders) => {
                // Tăng giá trị ID lên 1
                const nextId = maxOrders ? maxOrders._id + 1 : 1;
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

module.exports = { ratingModel };