const md = require('../../models/user.models');
const bcrypt = require('bcrypt');
var fs = require('fs');
const cloudinary = require('cloudinary').v2;

exports.Login = async (req, res, next) => {
    if (req.method == 'POST') {
        try {
            const { username, password, deviceToken } = req.body; 
            const user1 = await md.userModel.findOne({ username });
            if (!user1) {
                return res.status(400).json({ msg: "Sai thông tin đăng nhập" });
            } else {
                // So sánh mật khẩu đã băm
                const passwordMatch = await bcrypt.compare(password, user1.password);
                if (!passwordMatch) {
                    return res.status(401).json({ msg: "Sai mật khẩu" });
                }
                if (!user1.isActive) {
                    return res.status(403).json({ msg: "Tài khoản của bạn đã bị khóa" });
                } else {
                    // Lưu trữ token thiết bị
                    if(deviceToken){
                        user1.deviceToken = deviceToken;
                    }
                    await user1.save();

                    return res.status(200).json({ user: user1, msg: "Đăng nhập thành công." });
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Server error' });
        }
    }
};

const vietnamesePhoneNumberRegex = /(0[1-9][0-9]{8})\b/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
exports.Reg = async (req, res, next) => {
    const existingUser = await md.userModel.findOne({ username: req.body.username });
    if (req.method === 'POST') {
        console.log(req.body);

        if (!req.body.username || !req.body.password || !req.body.passwd2 || !req.body.name || !req.body.phone) {
            return res.status(400).json("yêu cầu nhập đầy đủ thông tin");
        }
        if (existingUser) {
            return res.status(401).json("tài khoản đã tồn tại");
        }

        if (req.body.password !== req.body.passwd2) {
            return res.status(403).json("Xác nhận mật khẩu không trùng khớp");
        }
        if (!vietnamesePhoneNumberRegex.test(req.body.phone)) {
            return res.status(404).json("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại");
        }
        if (!emailRegex.test(req.body.userEmail)) {
            return res.status(404).json("Email không hợp lệ. Vui lòng kiểm tra lại");
        }
        try {
            let objU = new md.userModel();
            objU.username = req.body.username;
            objU.password = req.body.password;

            objU.role = 'User';
            objU.userEmail = req.body.userEmail;

            const salt = await bcrypt.genSalt(10);
            objU.password = await bcrypt.hash(req.body.password, salt);
            objU.name = req.body.name;

            objU.phone = req.body.phone;
            objU.isActive = true;
            if(req.body.deviceToken){
                objU.deviceToken = req.body.deviceToken;
            }

            await objU.save();
            return res.status(200).json("Đăng ký thành công");

        } catch (error) {
            return res.status(500).json("Lỗi");
        }
    }
};

exports.changePassword = async (req, res, next) => {
    const { password, newPassword, userName, deviceToken } = req.body; // Thêm deviceToken

    if (req.method === 'POST') {
        try {
            let objUser = await md.userModel.findOne({ username: userName });
            if (!objUser) {
                return res.json("Tài khoản không tồn tại.");
            }
            const passwordMatch = await bcrypt.compare(password, objUser.password);
            if (!passwordMatch) {
                return res.json("Mật khẩu cũ không chính xác.");
            }
            if (!newPassword) {
                return res.json("Vui lòng cung cấp mật khẩu mới.");
            }
            if (newPassword === password) {
                return res.json("Vui lòng tạo mật khẩu khác mật khẩu cũ.");
            }

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            // Cập nhật mật khẩu mới và token thiết bị
            objUser.password = hashedNewPassword;
            if(deviceToken){
                objUser.deviceToken = deviceToken;
            }
            await objUser.save();

            return res.status(200).json(objUser);

        } catch (error) {
            return res.status(500).json("Lỗi");
        }
    }
};

exports.edit = async (req, res, next) => {
    let iduser = req.params.id;
    let objUser = await md.userModel.findById(iduser);

    if (req.method === 'PUT') {
        if (!req.body.name || !req.body.phone) {
            return res.json("Vui lòng điền đầy đủ thông tin.");
        }
        try {
            objUser.userEmail = req.body.userEmail;
            objUser.name = req.body.name;
            objUser.phone = req.body.phone;

            if (req.file !== undefined) {
                const publicId = getPublicIdFromUrl(objUser.image);
                cloudinary.uploader.destroy(publicId, (error, result) => {
                    if (error) {
                        console.log("Xóa ảnh khỏi Cloudinary không thành công!");
                    } else {
                        console.log("Xóa ảnh khỏi Cloudinary thành công!");
                    }
                });

                objUser.image = req.file.path;
            }

            if(req.body.deviceToken){
                objUser.deviceToken = req.body.deviceToken;
            } 

            await objUser.save();
            res.json(objUser);

        } catch (error) {
            res.json('Lỗi Ghi CSDL: ' + error.message);
        }
    } else {
        res.json("Phương thức không hợp lệ");
    }
};

function getPublicIdFromUrl(url) {
    const startIndex = url.lastIndexOf('/') + 1;
    const endIndex = url.lastIndexOf('.');
    return url.substring(startIndex, endIndex);
}

exports.list = async(req, res, next) => {
    try{
        let list = await md.userModel.find();
        res.send(list);
    } catch (err){
        console.log('Lỗi');
    }
}
