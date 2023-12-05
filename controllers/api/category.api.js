var myMD = require('../../models/category.models');
var msg = '';

exports.list = async (req, res, next) => {
    try {
        let list = await myMD.categoryModel.find();
        return res.status(200).json({category : list, msg :"Danh sách thể loại"});
    } catch (error) {
        return res.status(500).json({product : [], msg :"error"});
    }
}