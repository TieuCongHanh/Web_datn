const myMD = require('../../models/rating.models');

exports.list = async(req, res, next) => {
    try {
        let list = await myMD.ratingModel.find().populate('id_user').populate('id_product');
        res.send(list);
    } catch (err) {
        console.log(err);
    }
}

exports.add = async(req, res, next) => {
    if(req.method == 'POST'){
        let objRating = new myMD.ratingModel;
        try{
            objRating.rating = req.body.rating;
            objRating.id_user = req.body.id_user;
            objRating.user_username = req.body.user_username;
            objRating.user_name = req.body.user_name;
            objRating.id_product = req.body.id_product;
            objRating.product_name = req.body.product_name;
            // objRating.product_test = req.body.product_test;
            await objRating.save();
        } catch (err){
            console.log(err);
        }
        res.send(objRating);
    }
}

exports.delete = async(req, res, next) => {
    let id = req.query._id;
    let objRating = await myMD.ratingModel.findById(id);
    try {
        await myMD.ratingModel.findByIdAndRemove(id, objRating)
        res.send("Xóa thành công");
    } catch (err) {
        console.log(err);
    }
}