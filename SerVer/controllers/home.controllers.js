const md = require('../models/user.models');
const bcrypt = require('bcrypt');
var msg = '';
exports.home = async (req, res, next) => {
    let countUser = await md.userModel.countDocuments({});
    console.log(`Tổng số user: ${countUser}`);
    res.render('home/home', {req : req , msg: msg, countUser: countUser});
}
exports.Login = async (req, res, next) => {
    let msg = '';
    if (req.method == 'POST') {
        try {
            const { username, password } = req.body;
            const user1 = await md.userModel.findOne({ username });
            if (!user1) {
                return res.render('home/dn', { msg: 'Tài khoản không đúng vui lòng đăng nhập lại.', req: req });
            } else {
                // Kiểm tra trường isActive của người dùng
                if (!user1.isActive) {
                    return res.render('home/dn', { msg: 'Tài khoản của bạn đã bị vô hiệu hóa.', req: req });
                }

                // So sánh mật khẩu đã băm
                const passwordMatch = await bcrypt.compare(password, user1.password);
                if (!passwordMatch) {
                    return res.render('home/dn', { msg: 'Bạn nhập sai mật khẩu vui lòng đăng nhập lại.', req: req });
                } else {
                    // Kiểm tra vaitro của người dùng
                    if (user1.role !== 'Admin') {
                        return res.render('home/dn', { msg: 'Bạn không có quyền đăng nhập.', req: req });
                    }

                    console.log("Đăng nhập thành công.");
                    req.session.userLogin = user1;
                    return res.redirect('/');
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    return res.render('home/dn', { msg: msg, req: req });
};

const vietnamesePhoneNumberRegex = /(0[1-9][0-9]{8})\b/;
exports.Reg = async (req, res, next) => {
    let msg = '';
    const existingUser = await md.userModel.findOne({ username: req.body.username });
    let countUser = await md.userModel.countDocuments({});
    if (req.method === 'POST') {
        console.log(req.body);

       
<<<<<<< Updated upstream
        if (!req.body.username || !req.body.password || !req.body.passwd2 || !req.body.name  || !req.body.phone) {
=======
        if (!req.body.username || !req.body.password || !req.body.passwd2 || !req.body.name || !req.body.phone) {
>>>>>>> Stashed changes
            msg = 'Vui lòng điền đầy đủ thông tin.';
            return res.render('home/dk', { msg: msg });
        }
        if (existingUser) {
            msg = 'Tài khoản đã tồn tại. Vui lòng chọn tên đăng nhập khác.';
            return res.render('home/dk', { msg: msg });
        }

        if (req.body.password !== req.body.passwd2) {
            msg = 'Xác nhận mật khẩu không trùng khớp.';
            return res.render('home/dk', { msg: msg });
        }  // Kiểm tra định dạng số điện thoại
        if (!vietnamesePhoneNumberRegex.test(req.body.phone)) {
            msg = 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.';
            return res.render('home/dk', { msg: msg });
        }
            try {
                let objU = new md.userModel();
                objU.username = req.body.username;
                objU.password = req.body.password;
              

                if (countUser === 0) {
                    objU.role = 'Admin';
                } else {
                    objU.role = 'User';
                }
                const salt = await bcrypt.genSalt(10);
                objU.password = await bcrypt.hash(req.body.password, salt);
                objU.name = req.body.name;
                
                objU.phone = req.body.phone;
                objU.isActive = true;

                await objU.save();
                msg = 'Đăng ký thành công.';

            } catch (error) {
                msg = error.message;
            }
        }
    
    res.render('home/dk', { msg: msg });
};


exports.Logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/');
        }
      });
}
