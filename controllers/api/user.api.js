const md = require('../../models/user.models');
const bcrypt = require('bcrypt');
var fs = require('fs');

exports.Login = async (req, res, next) => {
   
    if (req.method == 'POST') {
        try {
            const { username, password } = req.body;
            const user1 = await md.userModel.findOne({ username });
            if (!user1) {
                return res.status(400).json({msg: "Sai thông tin đăng nhập"});
            } else {
                // So sánh mật khẩu đã băm
                const passwordMatch = await bcrypt.compare(password, user1.password);
                if (!passwordMatch) {
                    return res.status(401).json({msg : "Sai mật khẩu"});
                }
                if (!user1.isActive) {
                    return res.status(403).json({msg: "Tài khoản của bạn đã bị khóa"});
                } 
                else {
                   return res.status(200).json({user : user1 , msg: "Đăng nhập thành công."});
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

                await objU.save();
            return res.status(200).json("Đăng ký thành công");

            } catch (error) {
                
                return res.status(500).json("Lỗi");
            }
        }
};

exports.changePassword = async (req, res, next) => {
    const { password, newPassword, userName } = req.body;

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
            if(newPassword === password){
                return res.json("Vui lòng tạo mật khẩu khác mật khẩu cũ.");
            }

            const salt = await bcrypt.genSalt(10);
            objUser.password = await bcrypt.hash(newPassword, salt);

            const updateUser = await objUser.save();

            res.json(updateUser);
        } catch (error) {
            res.json(error);
        }
    } else {
        res.json("Phương thức không hợp lệ");
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
            let objUS = new md.userModel();
            objUS.userEmail = req.body.userEmail;

            if (req.file != undefined) {
                fs.renameSync(req.file.path, "./public/uploads/" + req.file.originalname);
                let url_file = '/uploads/' + req.file.originalname;
                objUS.image = url_file;
            } else {
                objUS.image = objUser.image;
            }
            objUS.name = req.body.name;
            objUS.phone = req.body.phone;

            objUS._id = iduser;

            let user = await md.userModel.findByIdAndUpdate(iduser, objUS);
            res.json(user);
        } catch (error) {
            res.json( 'Lỗi Ghi CSDL: ' + error.message);
        }
    } else {
        res.json("Phương thức không hợp lệ");
    }
};