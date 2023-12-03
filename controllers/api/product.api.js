var myMD = require('../../models/sanpham.models');
var msg = '';

exports.list = async (req, res, next) => {

    try {
        let list = await myMD.sanphamModel.find().populate('id_category').select('-importHistory');
        return res.status(200).json({product : list, msg :"Danh sách sản phẩm"});
    } catch (error) {
        return res.status(500).json({product : [], msg :"error"});
    }
}

exports.filterCategory = async (req, res, next) => {
    const id_category = req.params.id_category;
    try {
        if(!id_category){
            return res.status(404).json({msg :"Không tìm thấy mã thể loại"});
        }
        let list = await myMD.sanphamModel.find({id_category : id_category}).populate('id_category').select('-importHistory');
        return res.status(200).json({product : list, msg :"Danh sách sản phẩm"});
    } catch (error) {
        return res.status(500).json({product : [], msg :"error"});
    }
}