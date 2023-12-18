const { log } = require('console');
var myMD = require('../models/user.models');
var addressModel = require('../models/address.models');
const excelJs = require("exceljs");
var fs = require('fs');
const bcrypt = require('bcrypt');
var msg = '';
const cloudinary = require('cloudinary').v2;

exports.list = async (req, res, next) => {
    let page = parseInt(req.params.i);
    let perPage = parseInt(req.query.data_tables_leght) || 5;
    let searchUser = null;
  
    const searchTerm = req.query.searchUser || '';
    const regex = new RegExp(searchTerm, 'i');
  
    if (searchTerm !== '') {
        searchUser = {
            $and: [
              {
                $or: [
                  { name: { $regex: regex } },
                  { username: { $regex: regex } },
                  { userEmail: { $regex: regex } },
                  { _id: { $regex: regex } },
                  { phone: { $regex: regex } }
                ]
              },
              { role: 'User' }
            ]
          };
    }else {
        searchUser = { role: 'User' };
    }
  
    let start = (page - 1) * perPage;
  
    const by = req.query.by || '_id';
    const order = req.query.order || 'desc';
  
    let list = await myMD.userModel
      .find(searchUser)
      .skip(start)
      .limit(perPage)
      .sort({ [by]: order });
  
    list = await Promise.all(
      list.map(async (user) => {
        const addressList = await addressModel.addressModel.find({ id_user: user._id });
        return { ...user.toObject(), addressList };
      })
    );

    let totalUsers = await myMD.userModel.find(searchUser).countDocuments();
    let currentPageTotal = start + list.length;
  
    let countlist = await myMD.userModel.find(searchUser);
    let count = countlist.length / perPage;
    count = Math.ceil(count);
  
    res.render('user/list', {
      perPage: perPage,
      start: start,
      listUS: list,
      countPage: count,
      req: req,
      msg: msg,
      by: by,
      order: order,
      totalUsers: totalUsers,
      currentPageTotal: currentPageTotal
    });
  };

exports.in = async (req, res, next) => {
    try {
        let workbook = new excelJs.Workbook();
        const sheet = workbook.addWorksheet("user");
        sheet.columns = [
            { header: "_id", key: "_id", width: 50 },
            { header: "username", key: "username", width: 30 },
            { header: "name", key: "name", width: 30 },
            { header: "role", key: "role", width: 10 },
            { header: "isActive", key: "isActive", width: 10 },
            { header: "phone", key: "phone", width: 10 },
            { header: "image", key: "image", width: 70 },
        ];
        const users = await myMD.userModel.find({}); 
        // Thêm dữ liệu người dùng vào bảng Excel
        users.forEach((user) => {
            sheet.addRow({
                _id: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
                isActive: user.isActive,
                phone: user.phone,
                image: user.image || '', 
            });
        });
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "user.xlsx"
        );
        // Ghi workbook vào response để tải xuống
        await workbook.xlsx.write(res);
    } catch (error) {
        console.log(error);
    }
};
const PDFDocument = require("pdfkit");

exports.print = async (req, res, next) => {
    try {
        const users = await myMD.userModel.find({});
        // Tạo một tệp PDF mới
        const doc = new PDFDocument();
        const pdfFileName = "users.pdf";
        // Thiết lập tiêu đề tệp PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${pdfFileName}"`
        );

        // Ghi dữ liệu người dùng vào tệp PDF
        doc.pipe(res);

        doc.fontSize(20).text("List Users", { align: "center" });
        doc.moveDown(1);
       
        // Xuất danh sách người dùng
        users.forEach((user) => {
            doc.fontSize(14).text(`User ID: ${user._id}`);
            doc.fontSize(12).text(`UserName: ${user.username}`);
            doc.fontSize(12).text(`Name: ${user.name}`);
            doc.fontSize(12).text(`Role: ${user.role}`);
            doc.fontSize(12).text(`Status: ${user.isActive}`);
            doc.fontSize(12).text(`Phone: ${user.phone}`);
            doc.fontSize(12).text(`AVT: ${user.image || "N/A"}`);
            doc.moveDown(1);
        });

        // Kết thúc tệp PDF
        doc.end();

    } catch (error) {
        console.log(error);
        res.status(500).send("Đã xảy ra lỗi trong quá trình in dữ liệu.");
        return; 
    }
};


exports.add = async (req, res, next) => {
    if (req.method == 'POST') {
        const existingUser = await myMD.userModel.findOne({ username: req.body.username });
      
        if (existingUser) {
            const errorMsg = "Tài khoản đã tồn tại. Vui lòng chọn tên người dùng khác.";
            res.render('user/add', { req: req, msg: errorMsg });
        } 
        if (!req.body.username || !req.body.password || !req.body.name || !req.body.role || !req.body.phone) {
            const errorMsg = "Vui lòng điền đầy đủ thông tin.";
            return res.render('user/add', { req: req, msg: errorMsg });
        }
            try {
                let url_file = ''; 
                if (req.file != undefined) {
                    url_file = req.file.path;
                }

                const objUS = new myMD.userModel();
                objUS.username = req.body.username;
                const salt = await bcrypt.genSalt(10);
                objUS.password = await bcrypt.hash(req.body.password, salt);

                objUS.name = req.body.name;
                objUS.image = url_file;
                objUS.role = req.body.role;
                objUS.phone = req.body.phone;
                objUS.userEmail = req.body.userEmail;

                objUS.isActive = true;

                const new_product = await objUS.save();
                msg = "Thêm thành công";
            } catch (err) {
                console.log(err);
            }
        
    }
    res.render('user/add', { req: req, msg: msg });
};


exports.edit = async (req, res, next) => {
    let msg = '';
    let iduser = req.params.id;
    let objUS = await myMD.userModel.findById(iduser);

    if (req.method === 'PUT') {
        if ( !req.body.name || !req.body.phone) {
            msg = "Vui lòng điền đầy đủ thông tin.";
            return res.render('user/edit', { msg: msg, objUS: objUser, req: req });
        }
        try {
            objUS.username = req.body.username;
            objUS.userEmail = req.body.userEmail;

            objUS.isActive = objUS.isActive;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                objUS.password = await bcrypt.hash(req.body.password, salt);
            } else {
                objUS.password = objUS.password;
            }

            if (req.file != undefined) {
                const publicId = getPublicIdFromUrl(objUS.image);
                cloudinary.uploader.destroy(publicId, (error, result) => {
                  if (error) {
                      console.log("Xóa ảnh khỏi Cloudinary không thành công!");
                  } else {
                      console.log("Xóa ảnh khỏi Cloudinary thành công!");
                  }
              });
              objUS.image = req.file.path;
            } else {
                objUS.image = objUS.image;
            }
          
                objUS.role = req.body.role;
           
            objUS.name = req.body.name;
            objUS.phone = req.body.phone;

            objUS._id = iduser;

            await myMD.userModel.findByIdAndUpdate(iduser, objUS);
            msg = 'Cập Nhật Thành Công';
        } catch (error) {
            msg = 'Lỗi Ghi CSDL: ' + error.message;
            console.log(error);
        }
    }

    res.render('user/edit', { msg: msg, objUS: objUser, req: req });
};

// delete
exports.deleteUser = async (req, res, next) => {
    const userId = req.body.IdDelete;
   msg=''
    try {
        const user = await myMD.userModel.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ msg: 'Người dùng không tồn tại' });
        }
        if (user._id === "KH001" || user == req.session.userLogin) {
            return res.status(403).json({ msg: 'Không thể thay đổi trạng thái của tài khoản này' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.redirect('/user/1');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }

};

function getPublicIdFromUrl(url) {
    const startIndex = url.lastIndexOf('/') + 1;
    const endIndex = url.lastIndexOf('.');
    return url.substring(startIndex, endIndex);
}

exports.setting = async (req, res, next) => {
    let msg = '';
    let iduser = req.session.userLogin._id;
    let objUS = await myMD.userModel.findById(iduser);

    if (req.method === 'POST') {
        if ( !req.body.name || !req.body.phone || !req.body.userEmail) {
            msg = "Vui lòng điền đầy đủ thông tin.";
            return res.render('user/setting', { msg: msg, objUS: objUS, req: req });
        }
        try {
            objUS.username = req.body.username;
            objUS.userEmail = req.body.userEmail;

            if (req.body.password) {
                if(req.body.password != req.body.checkpassword){
                    msg = "Mật khẩu không trùng khớp.";
                    return res.render('user/setting', { msg: msg, objUS: objUS, req: req });
                }
                const salt = await bcrypt.genSalt(10);
                objUS.password = await bcrypt.hash(req.body.password, salt);
            } else {
                objUS.password = objUS.password;
            }

            if (req.file != undefined) {
                if(objUS.image){
                    const publicId = getPublicIdFromUrl(objUS.image);
                    cloudinary.uploader.destroy(publicId, (error, result) => {
                    if (error) {
                        console.log("Xóa ảnh khỏi Cloudinary không thành công!");
                    } else {
                        console.log("Xóa ảnh khỏi Cloudinary thành công!");
                    }
                });
             
                }
                objUS.image = req.file.path;
            } else {
                objUS.image = objUS.image;
            }
            objUS.name = req.body.name;
            objUS.phone = req.body.phone;

            await objUS.save();
            msg = 'Cập Nhật Thành Công';
            console.log(objUS);
        } catch (error) {
            msg = 'Lỗi Ghi CSDL: ' + error.message;
            console.log(error);
        }
    }

    res.render('user/setting', { msg: msg, objUS: objUS, req: req });
};
function getPublicIdFromUrl(url) {
    const startIndex = url.lastIndexOf('/') + 1;
    const endIndex = url.lastIndexOf('.');
    return url.substring(startIndex, endIndex);
}