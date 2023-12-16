const md = require('../models/user.models');
const md1 = require('../models/sanpham.models');
const md2 = require('../models/orders.models');
const bcrypt = require('bcrypt');
var msg = '';
exports.home = async (req, res, next) => {
    let countUser = await md.userModel.countDocuments({});
    let countProduct = await md1.sanphamModel.countDocuments({});
    let totalQuantitySold = 0;
    let dthuproduct = await md2.ordersModel.find({pay_status : true});
    dthuproduct.forEach((order) => {
        totalQuantitySold += order.total_price;
    });
    res.render('home/home', {req : req , msg: msg, countProduct: countProduct, countUser:countUser, totalQuantitySold:totalQuantitySold});
}
exports.Login = async (req, res, next) => {
    let msg = '';
    const adminUser = await md.userModel.findOne({ role: 'Admin' });
    if (req.method == 'POST') {
        try {
            const { username, password } = req.body;
            const user1 = await md.userModel.findOne({ username });
            if (!user1) {
                return res.render('home/dn', { msg: 'Tài khoản không đúng vui lòng đăng nhập lại.', req: req , adminUser : adminUser});
            } else {
                // Kiểm tra trường isActive của người dùng
                if (!user1.isActive) {
                    return res.render('home/dn', { msg: 'Tài khoản của bạn đã bị vô hiệu hóa.', req: req , adminUser : adminUser});
                }

                // So sánh mật khẩu đã băm
                const passwordMatch = await bcrypt.compare(password, user1.password);
                if (!passwordMatch) {
                    return res.render('home/dn', { msg: 'Bạn nhập sai mật khẩu vui lòng đăng nhập lại.', req: req , adminUser : adminUser});
                } else {
                    // Kiểm tra vaitro của người dùng
                    if (user1.role !== 'Admin') {
                        return res.render('home/dn', { msg: 'Bạn không có quyền đăng nhập.', req: req , adminUser : adminUser});
                    }

                    req.session.userLogin = user1;
                    return res.redirect('/');
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    return res.render('home/dn', { msg: msg, req: req , adminUser : adminUser});
};

const vietnamesePhoneNumberRegex = /(0[1-9][0-9]{8})\b/;
exports.Reg = async (req, res, next) => {
    let msg = '';
    const adminUser = await md.userModel.findOne({ role: 'Admin' });
    if (adminUser) {
        return res.redirect('/');
    }
    const existingUser = await md.userModel.findOne({ username: req.body.username });
    let countUser = await md.userModel.countDocuments({});
    if (req.method === 'POST') {

       
        if (!req.body.username || !req.body.password || !req.body.passwd2 || !req.body.name || !req.body.userEmail || !req.body.phone) {
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
                objU.userEmail = req.body.userEmail;

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
