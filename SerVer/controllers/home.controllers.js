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
            const { user, password } = req.body;
            const user1 = await md.userModel.findOne({ user });
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
                    // if (user1.vaitro !== 'Admin') {
                    //     return res.render('home/dn', { msg: 'Bạn không có quyền đăng nhập.', req: req });
                    // }
                    
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


exports.Reg = async (req, res, next) => {
    let msg = '';
    const existingUser = await md.userModel.findOne({ user: req.body.user });
    let countUser = await md.userModel.countDocuments({});
    if (req.method === 'POST') {
        console.log(req.body);

        if (existingUser) {
            msg = 'Tài khoản đã tồn tại. Vui lòng chọn tên đăng nhập khác.';
            return res.render('home/dk', { msg: msg });
        }

        if (req.body.password !== req.body.passwd2) {
            msg = 'Xác nhận mật khẩu không trùng khớp.';
            return res.render('home/dk', { msg: msg });
        } else {
            try {
                let objU = new md.userModel();
                objU.user = req.body.user;
                objU.password = req.body.password;
                objU.img = req.body.img;

                if (countUser === 0) {
                    objU.vaitro = 'Admin';
                } else {
                    objU.vaitro = 'User';
                }
                const salt = await bcrypt.genSalt(10);
                objU.password = await bcrypt.hash(req.body.password, salt);
                
                objU.isActive = true;

                await objU.save();
                msg = 'Đăng ký thành công.';

            } catch (error) {
                msg = error.message;
            }
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
