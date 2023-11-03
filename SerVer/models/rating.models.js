var db = require('./db');
const ratingSchema = new db.mongoose.Schema(
    {
        id_user: {type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel'},
        rating: {type: String, require: false}
    },
    {
        collection: 'rating'
    }
)
let ratingModel = db.mongoose.model('ratingModel', ratingSchema);

module.exports = { ratingModel };