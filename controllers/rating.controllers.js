const rM = require('../models/rating.models');
var myMD = require('../models/user.models');
const excelJs = require("exceljs");
var fs = require('fs');
const bcrypt = require('bcrypt');
var msg = '';

exports.listRating = async (req, res, next) => {
    let page=req.params.i;
    let msg = '';
    let perPage=4; 
    let totalRating = await rM.ratingModel.find().countDocuments();
    const by = req.query.by || 'price'; // Sắp xếp theo price nếu không có giá trị by
    const order = req.query.order || 'asc'; // Sắp xếp tăng dần nếu không có giá trị order
    let list = await rM.ratingModel.find().populate('id_user', 'id_item');
    let count = list.length / perPage;
    let start=( page - 1 )*perPage;
    let currentPageTotal = start + list.length;
    console.log(list);
    res.render('danhgia/danhgia', {list: list,  req: req, countPage: count, msg: msg,by : by, order :order,totalRating: totalRating, currentPageTotal:currentPageTotal});
}

exports.in = async (req, res, next) => {
    try {
        let workbook = new excelJs.Workbook();
        const sheet = workbook.addWorksheet("LoaiSP");
        sheet.columns = [
            { header: "_id", key: "_id", width: 50 },
            { header: "name", key: "name", width: 30 },
            { header: "price", key: "price", width: 30 },
            { header: "image", key: "image", width: 70 },
        ];
        const loaisp = await myMD.sanphamModel.find({}); 
        // Thêm dữ liệu người dùng vào bảng Excel
        users.forEach((user) => {
            sheet.addRow({
                _id: user._id,
                tenLoai: user.tenLoai,
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

