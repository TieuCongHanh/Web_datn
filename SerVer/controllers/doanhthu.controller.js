const { log } = require('console');
var myMD = require('../models/sanpham.models');
const excelJs = require("exceljs");
var ordermd = require('../models/orders.models');
var msg = '';

exports.list = async (req, res, next) => {
    let page = req.params.i;  // trang
    let perPage = 4;
    let timkiemSP = null;
    if (req.query.name != '' && String(req.query.name) != 'undefined') {
        timkiemSP = { name: req.query.name }
    }
    let start = (page - 1) * perPage; // vị trí 0

    const by = req.query.by || 'price'; // Sắp xếp theo price nếu không có giá trị by
    const order = req.query.order || 'asc'; // Sắp xếp tăng dần nếu không có giá trị order

    let list = await myMD.sanphamModel.find(timkiemSP).skip(start).limit(perPage).sort({ [by]: order });
    let listod = await ordermd.ordersModel.find(timkiemSP);
    // đang làm số lương sản phẩm bán ra
    let totalRevenue = 0;
    let totalQuantitySold = 0;
    let dthuproduct = await ordermd.ordersModel.find();
    dthuproduct.forEach((order) => {
        totalRevenue += order.quantity;
        //totalQuantitySold += order.price;
        // Sử dụng hàm
        totalQuantitySold += order.price * order.quantity;
    });


    // Tính tổng số người dùng
    let totalSP = await myMD.sanphamModel.find(timkiemSP).countDocuments();

    let countlist = await myMD.sanphamModel.find(timkiemSP);
    let count = countlist.length / perPage;
    count = Math.ceil(count);
    console.log(list);
    res.render('doanhth/doanhthu', { listL: list, listod: listod, totalQuantitySold: totalQuantitySold, totalRevenue: totalRevenue, countPage: count, req: req, msg: msg, by: by, order: order, totalSP: totalSP });
}
exports.in = async (req, res, next) => {
    try {
        let workbook = new excelJs.Workbook();
        const sheet = workbook.addWorksheet("Thongke");
        sheet.columns = [
            { header: "_id", key: "_id", width: 50 },
            { header: "image", key: "image", width: 70 },
            { header: "name", key: "name", width: 30 },
            { header: "price", key: "price", width: 30 },
            { header: "quantity", key: "quantity", width: 30 },
            { header: "revenue", key: "revenue", width: 30 },
        ];
        const inorder = await ordermd.ordersModel.find({});
        // Thêm dữ liệu người dùng vào bảng Excel
        inorder.forEach((order) => {
            sheet.addRow({
                _id: order._id,
                image: order.image || '',
                name: order.name,
                price: order.price,
                quantity: order.quantity,
                revenue: order.price * order.quantity,
            });
        });
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "order.xlsx"
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
        const ordersp = await ordermd.ordersModel.find({});
        // Tạo một tệp PDF mới
        const doc = new PDFDocument();
        const pdfFileName = "Thongke.pdf";
        // Thiết lập tiêu đề tệp PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${pdfFileName}"`
        );

        // Ghi dữ liệu người dùng vào tệp PDF
        doc.pipe(res);
        doc.fontSize(20).text("Thongke", { align: "center" });
        doc.moveDown(1);

        // Xuất danh sách người dùng
        ordersp.forEach((order) => {
            doc.fontSize(14).text(`sp ID: ${order._id}`);
            doc.fontSize(12).text(`AVT: ${order.image || "N/A"}`);
            doc.fontSize(12).text(`Name: ${order.name}`);
            doc.fontSize(12).text(`Price: ${order.price}`);
            doc.fontSize(12).text(`Quantity: ${order.quantity}`);
            doc.fontSize(12).text(`Revenue: ${order.price * order.quantity}`);
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
