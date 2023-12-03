var myMD = require('../../models/address.models');
var msg = '';

exports.list = async (req, res, next) => {
    try {
        // const { id_user } = req.body; // Thay đổi ở đây
        // if(!id_user){
        //     return res.status(404).json({ address: [], msg: "Nhập id_user" });
        // }

        let list = await myMD.addressModel.find({ id_user : req.body.id_user });
        if(!list){
            return res.status(404).json({ address: [], msg: "Không tìm thấy địa chỉ" });
        }

        return res.status(200).json({ address: list, msg: "Danh sách địa chỉ" });
    } catch (error) {
        return res.status(500).json({ product: [], msg: "error" });
    }
}

exports.add = async (req, res, next) => {
    try {
        const { id_user, address, phone } = req.body;

        if (!id_user || !address || !phone) {
            return res.status(400).json( "Thiếu các trường bắt buộc" );
        }

        const newAddress = await myMD.addressModel.create({
            id_user,
            address,
            phone
        });

        return res.status(200).json( newAddress);

    } catch (error) {
        return res.status(500).json("Lỗi khi tạo địa chỉ" );
    }
}

exports.update = async (req, res, next) => {
    const { AddressId } = req.params; 
    const { address, phone } = req.body;
    try {
    
        const foundaddress = await myMD.addressModel.findById(AddressId );
        if (!foundaddress) {
            return res.status(400).json( "Not found" );
        }
        if (!address || !phone) {
            return res.status(400).json("Thiếu các trường bắt buộc" );
        }

        foundaddress.address = address
        foundaddress.phone = phone
        await foundaddress.save();
        res.status(200).json(foundaddress);

    } catch (error) {
        return res.status(500).json("Lỗi khi cập nhật địa chỉ" );
    }
};

exports.delete = async (req, res, next) => {
   const { addressId } = req.params;
   
   try {
    const foundaddress = await Comment.findByIdAndRemove(addressId);

    if (!foundaddress) {
      return res.status(404).json({ msg: 'Không tìm thấy bình luận' });
    }
    res.status(200).json(foundaddress);
       
    } catch (error) {
        return res.status(500).json( "Lỗi khi xóa địa chỉ" );
    }
};