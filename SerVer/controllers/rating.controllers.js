const ratingModel = require('../models/rating.models');

exports.listRating = async(req, res) => {
    let list = await ratingModel.find().populate('id_user');
    res.send(list);
}

