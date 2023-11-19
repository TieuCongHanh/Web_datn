const OrderModel = require("../models/orders.models");
const paymentModel = require("../models/payment.models");
const detailModel = require("../models/orderdetail.models");
const excelJs = require("exceljs");
const PDFDocument = require("pdfkit");

var msg = "";

exports.list = async (req, res) => {
  let page = req.params.i; // trang
  let perPage = 4;
  let timkiemSP = null;
  if (req.query.name != "" && String(req.query.name) != "undefined") {
    timkiemSP = { name: req.query.name };
  }
  let start = (page - 1) * perPage; // vị trí 0

  const by = req.query.by || "price"; // Sắp xếp theo price nếu không có giá trị by
  const order = req.query.order || "asc"; // Sắp xếp tăng dần nếu không có giá trị order

  let list = await OrderModel.ordersModel
    .find(timkiemSP)
    .skip(start)
    .limit(perPage)
    .sort({ [by]: order })
    .populate("id_user")
    .populate("id_staff")
    .populate("total_price")
    .populate("id_address");

  // Tính tổng số người dùng
  let totalSP = await OrderModel.ordersModel.find(timkiemSP).countDocuments();

  // Tính tổng số người dùng trên trang hiện tại
  let currentPageTotal = start + list.length;

  let countlist = await OrderModel.ordersModel.find(timkiemSP);
  let count = countlist.length / perPage;
  count = Math.ceil(count);

  console.log(list);
  res.render("order/list", {
    listL: list,
    countPage: count,
    req: req,
    msg: msg,
    by: by,
    order: order,
    totalSP: totalSP,
    currentPageTotal: currentPageTotal,
  });
};

exports.in = async (req, res, next) => {
  try {
    let workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet("LoaiSP");
    sheet.columns = [
      {
        header: "Mã đơn hàng",
        key: "_id",
        width: 10,
        style: { alignment: { horizontal: "center" } },
      },
      {
        header: "Mã người dùng",
        key: "id_user",
        width: 10,
        style: { alignment: { horizontal: "center" } },
      },
      {
        header: "Tổng giá",
        key: "total_price",
        width: 30,
        style: { alignment: { horizontal: "center" } },
      },
      {
        header: "Trạng thái giao",
        key: "delivery_status",
        width: 20,
        style: { alignment: { horizontal: "center" } },
      },
      {
        header: "Ngày đặt",
        key: "date",
        width: 30,
        style: { alignment: { horizontal: "center" } },
      },
    ];
    const orders = await OrderModel.ordersModel.find({});
    // Thêm dữ liệu người dùng vào bảng Excel
    orders.forEach((order) => {
      sheet.addRow({
        _id: order._id,
        id_user: order.id_user,
        total_price: order.total_price,
        delivery_status: order.delivery_status,
        date: order.date,
      });
    });

    // Định dạng header để in đậm
    sheet.getRow(1).font = { bold: true };

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

exports.print = async (req, res, next) => {
  try {
    const orders = await OrderModel.ordersModel.find({});
    // Tạo một tệp PDF mới
    const doc = new PDFDocument();
    const pdfFileName = "DanhSach.pdf";
    // Thiết lập tiêu đề tệp PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfFileName}"`
    );

    // Ghi dữ liệu người dùng vào tệp PDF
    doc.pipe(res);

    doc.fontSize(20).text("Danh sách đơn hàng", { align: "center" });
    doc.moveDown(1);

    // Xuất danh sách người dùng
    orders.forEach((order) => {
      doc.fontSize(14).text(`Mã đơn hàng: ${order._id}`);
      doc.fontSize(12).text(`Mã người dùng: ${order.id_user}`);
      doc.fontSize(12).text(`Tổng giá: ${order.total_price}`);
      doc.fontSize(12).text(`Trạng thái giao: ${order.delivery_status}`);
      doc.fontSize(12).text(`Ngày đặt: ${order.date}`);
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


exports.details = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const order = await OrderModel.ordersModel
      .findById(orderId)
      .populate("id_user")
      .populate("id_staff")
      .populate("total_price")
      .populate("id_address");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const listOrderDetail = await detailModel.orderDetailModel.find({ id_order : orderId })
    .populate("id_order")
    .populate("id_product");

    console.log({order, listOrderDetail});
    res.json({order, listOrderDetail});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};
