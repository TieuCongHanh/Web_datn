var db = require('./db');
const categorySchema = new db.mongoose.Schema(
    {
        _id: {type: db.mongoose.Schema.Types.String},
        name: {type: String, require: true},
        describe: {type: String, require: false}
    },
    {
        collection: 'category'
    }
)

categorySchema.pre('save', function (next) {
    const doc = this;
    if (doc.isNew) {

        categoryModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
            .then((maxStaff) => {
                // Tăng giá trị ID lên 1
                const regex = /^TL(\d+)$/;
                const maxIdMatch = regex.exec(maxStaff?._id || '');
                const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
                const formattedId = "TL" + String(nextId).padStart(3, '0');
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

let categoryModel = db.mongoose.model('categoryModel', categorySchema);

module.exports = { categoryModel };
