const { log } = require('console');
var myMD = require('../models/sanpham.models');
const excelJs = require("exceljs");
var fs = require('fs');
const bcrypt = require('bcrypt');
var msg = '';

exports.list = async (req, res, next) => {
    let page=req.params.i;  // trang
    let perPage=4; 
    let timkiemSP = null;
    if (req.query.name != '' && String(req.query.name) != 'undefined') {
        timkiemSP = { name: req.query.name }
    }
    let start=( page - 1 )*perPage; // vị trí 0
   
    const by = req.query.by || 'price'; // Sắp xếp theo price nếu không có giá trị by
    const order = req.query.order || 'asc'; // Sắp xếp tăng dần nếu không có giá trị order

    let list = await myMD.sanphamModel.find(timkiemSP).skip(start).limit(perPage).sort({ [by] :order });
// Tính tổng số người dùng
let totalSP = await myMD.sanphamModel.find(timkiemSP).countDocuments();

// Tính tổng số người dùng trên trang hiện tại
let currentPageTotal = start + list.length;

    let countlist = await myMD.sanphamModel.find(timkiemSP);
    let count = countlist.length / perPage;
    count = Math.ceil(count);

    console.log(list);
    res.render('sanpham/list', { listL: list, countPage: count , req: req , msg: msg,by : by, order :order,totalSP: totalSP,currentPageTotal:currentPageTotal});
}
exports.in = async (req, res, next) => {
    try {
        let workbook = new excelJs.Workbook();
        const sheet = workbook.addWorksheet("LoaiSP");
        sheet.columns = [
            { header: "_id", key: "_id", width: 50 },
            { header: "name", key: "name", width: 30 },
            { header: "price", key: "price", width: 30 },
            { header: "describe", key: "describe", width: 50 },
            { header: "image", key: "image", width: 70 },
        ];
        const sanphams = await myMD.sanphamModel.find({}); 
        // Thêm dữ liệu người dùng vào bảng Excel
        sanphams.forEach((sanpham) => {
            sheet.addRow({
                _id: sanpham._id,
                tenLoai: sanpham.tenLoai,
                describe: sanpham.describe,
                image: sanpham.image || '', 
            });
        });
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "sanpham.xlsx"
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
        const Sanpham = await myMD.sanphamModel.find({});
        // Tạo một tệp PDF mới
        const doc = new PDFDocument();
        const pdfFileName = "Loaisp.pdf";
        // Thiết lập tiêu đề tệp PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${pdfFileName}"`
        );

        // Ghi dữ liệu người dùng vào tệp PDF
        doc.pipe(res);

        doc.fontSize(20).text("List SanPham", { align: "center" });
        doc.moveDown(1);
       
        // Xuất danh sách người dùng
        Sanpham.forEach((Sanpham) => {
            doc.fontSize(14).text(`sp ID: ${Sanpham._id}`);
            doc.fontSize(12).text(`Name: ${Sanpham.name}`);
            doc.fontSize(12).text(`Price: ${Sanpham.price}`);
            doc.fontSize(12).text(`describe: ${Sanpham.describe}`);
            doc.fontSize(12).text(`AVT: ${Sanpham.image || "N/A"}`);
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
        try {
            if (!req.body.name || !req.body.price) {
                res.render('sanpham/add', { req: req, msg: "Vui lòng điền đầy đủ thông tin sản phẩm." });
                return;
            }

            const price = parseFloat(req.body.price);
            if (isNaN(price) || price <= 0) {
                res.render('sanpham/add', { req: req, msg: "Giá sản phẩm phải là một số dương." });
                return;
            }

            let url_file = '';
            if (req.file != undefined) {
                fs.renameSync(req.file.path, "./public/uploads/" + req.file.originalname);
                url_file = '/uploads/' + req.file.originalname;
            } else {
                res.render('sanpham/add', { req: req, msg: "Vui lòng chọn một tệp hình ảnh" });
                return;
            }

            const objSP = new myMD.sanphamModel();
            objSP.name = req.body.name;
            objSP.price = req.body.price;
            objSP.describe = req.body.describe;
            objSP.image = url_file;

            const objloai = await objSP.save();
            msg = "Thêm thành công";
            console.log(objloai);
        } catch (err) {
            console.log(err);
        }
    }
    res.render('sanpham/add', { req: req, msg: msg });
};

exports.edit = async (req, res, next) => {
    let msg = '';
    let idsp = req.params.id;
    let objSP = await myMD.sanphamModel.findById(idsp);

    if (req.method === 'POST') {
        try {
            if (!req.body.name || !req.body.price) {
                res.render('sanpham/edit', { req: req, msg: "Vui lòng điền đầy đủ thông tin sản phẩm." });
                return;
            }

            const price = parseFloat(req.body.price);
            if (isNaN(price) || price <= 0) {
                res.render('sanpham/edit', { req: req, msg: "Giá sản phẩm phải là một số dương." });
                return;
            }

            // Sử dụng cùng một biến `objSP` để cập nhật thông tin sản phẩm
            objSP.name = req.body.name;
            objSP.price = req.body.price;
            objSP.describe = req.body.describe;

            if (req.file != undefined) {
                fs.renameSync(req.file.path, "./public/uploads/" + req.file.originalname);
                let url_file = '/uploads/' + req.file.originalname;
                objSP.image = url_file;
            }

            await objSP.save(); // Sử dụng .save() để lưu thông tin sản phẩm

            msg = 'Cập Nhật Thành Công';
        } catch (error) {
            msg = 'Lỗi Ghi CSDL: ' + error.message;
            console.log(error);
        }
    }

    res.render('sanpham/edit', { msg: msg, objL: objSP, req: req });
};


// delete
exports.deleteLoai= async (req,res,next)=>{
    await myMD.sanphamModel.deleteOne({_id: req.body.IdDelete});
    res.redirect('/sanpham/1');
}




