const md = require('../../models/user.models');
const bcrypt = require('bcrypt');


exports.Login = async (req, res, next) => {
   
    if (req.method == 'POST') {
        try {
            const { username, password } = req.body;
            const user1 = await md.userModel.findOne({ username });
            if (!user1) {
                return res.status(400).json({msg: "sai thông tin đăng nhập"});
            } else {
                // So sánh mật khẩu đã băm
                const passwordMatch = await bcrypt.compare(password, user1.password);
                if (!passwordMatch) {
                    return res.status(401).json({msg : "sai mật khẩu"});
                }
                if (!user1.isActive) {
                    return res.status(403).json({msg: "tài khoản của bạn đã bị khóa"});
                } 
                else {
                    console.log("Đăng nhập thành công.");
                   return res.status(200).json({
                    username: user1.username, password: user1.password,
                    userId: user1._id,name: user1.name,
                    role: user1.role, image:user1.image,
                    phone: user1.phone, isActive: user1.isActive
                   });
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};
const vietnamesePhoneNumberRegex = /(0[1-9][0-9]{8})\b/;
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
            try {
                let objU = new md.userModel();
                objU.username = req.body.username;
                objU.password = req.body.password;
            
                objU.role = 'User';
                
                const salt = await bcrypt.genSalt(10);
                objU.password = await bcrypt.hash(req.body.password, salt);
                objU.name = req.body.name;
                
                objU.phone = req.body.phone;
                objU.isActive = true;

                await objU.save();
            return res.status(200).json("đăng ký thành công");

            } catch (error) {
                
                return res.status(500).json("Lỗi");
            }
        }
};