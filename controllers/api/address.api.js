var myMD = require('../../models/address.models');
var msg = '';

exports.list = async (req, res, next) => {
    try {
        // const { id_user } = req.body; // Lấy giá trị id_user từ body
        // if(!id_user){
        //     return res.status(404).json({ address: [], msg: "Nhập id_user" });
        // }

        let list = await myMD.addressModel.find({ id_user : req.query.id_user });
        if(!list){
            return res.status(404).json({ address: [], msg: "Không tìm thấy địa chỉ" });
        }

        return res.status(200).json({ address: list, msg: "Danh sách địa chỉ" });
    } catch (error) {
        return res.status(500).json({ msg: "error" });
    }
}

exports.add = async (req, res, next) => {
    try {
        const id_user  = req.body.id_user;
        const { address, phone } = req.body;

        if (!id_user || !address || !phone) {
            return res.status(400).json( "Thiếu các trường bắt buộc" );
        }

        const newAddress = await myMD.addressModel.create({
            id_user,
            address,
            phone
        });

        return res.status(200).json(newAddress);

    } catch (error) {
        return res.status(500).json("Lỗi khi tạo địa chỉ" );
    }
}

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        const address = req.body.address;
        const phone = req.body.phone;

        const addressObj = await myMD.addressModel.findById(id);
        if (!addressObj) {
            return res.status(404).json("Không tìm thấy địa chỉ" );
        }
        if (!address || !phone) {
            return res.status(400).json("Thiếu các trường bắt buộc" );
        }

        addressObj.address = address;
        addressObj.phone = phone;

        const updatedAddress = await addressObj.save();

        if (!updatedAddress) {
            return res.status(404).json("Không tìm thấy địa chỉ");
        }

        return res.status(200).json(updatedAddress);
    } catch (error) {
        return res.status(500).json("Lỗi khi cập nhật địa chỉ" );
    }
};
exports.delete = async (req, res, next) => {
   
    try {
        const id = req.params.id;
        const deletedAddress = await myMD.addressModel.findByIdAndDelete(id);

        if (!deletedAddress) {
            return res.status(404).json("Không tìm thấy địa chỉ" );
        }

        return res.status(200).json(deletedAddress);
    } catch (error) {
        return res.status(500).json("Lỗi khi xóa địa chỉ" );
    }
};