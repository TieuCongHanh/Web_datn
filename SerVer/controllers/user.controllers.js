const { log } = require('console');
var myMD = require('../models/user.models');
const excelJs = require("exceljs");
var fs = require('fs');
const bcrypt = require('bcrypt');
var msg = '';

exports.list = async (req, res, next) => {
    let page=req.params.i;  // trang
    let perPage=4; 
    let timkiemUser = null;
    if (req.query.user != '' && String(req.query.user) != 'undefined') {
        timkiemUser = { user: req.query.user }
    }
    let start=( page - 1 )*perPage; // vị trí 0
   
    const by = req.query.by || 'user'; // Sắp xếp theo giá nếu không có giá trị by
    const order = req.query.order || 'asc'; // Sắp xếp tăng dần nếu không có giá trị order

    let list = await myMD.userModel.find(timkiemUser).skip(start).limit(perPage).sort({ [by] :order });
    
    let countlist = await myMD.userModel.find(timkiemUser);
    let count = countlist.length / perPage;
    count = Math.ceil(count);

    console.log(list);
    res.render('user/list', { listUS: list, countPage: count , req: req , msg: msg,by : by, order :order});
}
exports.in = async (req, res, next) => {
    try {
        let workbook = new excelJs.Workbook();
        const sheet = workbook.addWorksheet("user");
        sheet.columns = [
            { header: "_id", key: "_id", width: 50 },
            { header: "user", key: "user", width: 30 },
            { header: "vaitro", key: "vaitro", width: 10 },
            { header: "image", key: "image", width: 70 },
        ];
        const users = await myMD.userModel.find({}); 
        // Thêm dữ liệu người dùng vào bảng Excel
        users.forEach((user) => {
            sheet.addRow({
                _id: user._id,
                user: user.user,
                vaitro: user.vaitro,
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
            doc.fontSize(12).text(`UserName: ${user.user}`);
            doc.fontSize(12).text(`Role: ${user.vaitro}`);
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
        const existingUser = await myMD.userModel.findOne({ user: req.body.user });

        if (existingUser) {
            const errorMsg = "Tài khoản đã tồn tại. Vui lòng chọn tên người dùng khác.";
            res.render('user/add', { req: req, msg: errorMsg });
        } else {
            try {
                let url_file = ''; 
                if (req.file != undefined) {
                    fs.renameSync(req.file.path, "./public/uploads/" + req.file.originalname);
                    url_file = '/uploads/' + req.file.originalname;
                }

                const objUS = new myMD.userModel();
                objUS.user = req.body.user;
                const salt = await bcrypt.genSalt(10);
                objUS.password = await bcrypt.hash(req.body.password, salt);

                objUS.image = url_file;
                objUS.vaitro = req.body.vaitro;

                const new_product = await objUS.save();
                msg = "Thêm thành công";
                console.log(new_product);
            } catch (err) {
                console.log(err);
            }
        }
    }
    res.render('user/add', { req: req, msg: msg });
};


exports.edit = async (req, res, next) => {
    let msg = '';
    let iduser = req.params.id;
    let objUser = await myMD.userModel.findById(iduser);

    if (req.method === 'POST') {
        try {
            let objUS = new myMD.userModel();
            objUS.user = req.body.user;
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                objUS.password = await bcrypt.hash(req.body.password, salt);
            } else {
                objUS.password = objUser.password;
            }

            if (req.file != undefined) {
                fs.renameSync(req.file.path, "./public/uploads/" + req.file.originalname);
                let url_file = '/uploads/' + req.file.originalname;
                objUS.image = url_file;
            } else {
                objUS.image = objUser.image;
            }

            objUS.vaitro = req.body.vaitro;
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
exports.deleteUser= async (req,res,next)=>{
    await myMD.userModel.deleteOne({_id: req.body.IdDelete});
    res.redirect('/user/1');

}


