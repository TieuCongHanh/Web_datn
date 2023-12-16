const { log } = require("console");
var myMD = require("../models/sanpham.models");
const excelJs = require("exceljs");
var ordermd = require("../models/orders.models");
var orderDetailModel = require("../models/orderdetail.models");
const moment = require('moment');

var msg = "";

exports.list = async (req, res, next) => {
  let page = req.params.i; // trang
  let perPage = 4;
  let timkiemSP = null;
  if (req.query.name != "" && String(req.query.name) != "undefined") {
    timkiemSP = { name: req.query.name };
  }
  let start = (page - 1) * perPage; // vị trí 0

  const by = req.query.by || "price"; // Sắp xếp theo price nếu không có giá trị by
  const order = req.query.order || "asc"; // Sắp xếp tăng dần nếu không có giá trị order

  let startDate = req.query.startDate;
  let endDate = req.query.endDate;


  let list = await myMD.sanphamModel
    .find(timkiemSP)
    .skip(start)
    .limit(perPage)
    .sort({ [by]: order });

    let matchCondition = {
      "order._id": { $exists: true },
      "order.pay_status": true,
      "order.delivery_status": { $ne: "Hủy" },
      $expr: { $eq: ["$id_order", { $arrayElemAt: ["$order._id", 0] }] }
    };
    
    if (startDate && endDate) {
      matchCondition["order.date"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (!startDate && !endDate) {
      
    } else {
      matchCondition.$or = [];
      if (startDate) {
        matchCondition.$or.push({ "order.date": { $gte: new Date(startDate) } });
      }
      if (endDate) {
        matchCondition.$or.push({ "order.date": { $lte: new Date(endDate) } });
      }
    }
    
    const listDetailOrder = await orderDetailModel.orderDetailModel.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "id_order",
          foreignField: "_id",
          as: "order",
        },
      },
      {
        $lookup: {
          from: "sanpham",
          localField: "id_product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "order._id",
          foreignField: "_id",
          as: "orderDetails",
        },
      },
      {
        $match: matchCondition,
      },
      {
        $group: {
          _id: "$id_product",
          quantity: { $sum: "$quantity" },
          total_price: { $sum: "$total_price" },
          product: { $first: { $arrayElemAt: ["$product", 0] } },
          orderDetails: { $first: "$orderDetails" },
        },
      },
    ]);
    
    const productList = await Promise.all(
      listDetailOrder.map(async (item) => {
        const productId = item._id.toString();
        const product = await myMD.sanphamModel.findById(productId);
        const startDateD = startDate ? moment(startDate).startOf('day') : null;
        const endDateD = endDate ? moment(endDate).endOf('day') : null;
        let totalQuantity = 0;
    
        if (!startDateD && !endDateD) {
          // Tính tổng số lượng từ toàn bộ lịch sử nhập hàng của sản phẩm
          if (product) {
            totalQuantity = product.importHistory.reduce((total, history) => {
              return total + history.quantity;
            }, 0);
          }
        } else {
          // Tính tổng số lượng trong khoảng thời gian chỉ định
          if (product) {
            totalQuantity = product.importHistory.reduce((total, history) => {
              const historyDate = moment(history.date).startOf('day');
              if (
                (!startDateD || historyDate.isSameOrAfter(startDateD)) &&
                (!endDateD || historyDate.isSameOrBefore(endDateD))
              ) {
                return total + history.quantity;
              }
              return total;
            }, 0);
          }
        }
    
        const detailOrder = listDetailOrder.find((order) => order._id === productId);
    
        return {
          product,
          detailOrder,
          totalQuantity,
        };
      })
    );


    // Tính tổng số lượng nhập vào
    let totalQuantityInput = 0;
    let totalQuantitySold = 0;
    let totalRevenue = 0;
    productList.forEach((order) => {
      totalQuantityInput += order.totalQuantity;
      totalQuantitySold += order.detailOrder.quantity;
      totalRevenue += order.detailOrder.total_price;
    });
    
  res.render("doanhth/doanhthu", {
    listL: list,
    listod: productList,
    req: req,
    msg: msg,
    by: by,
    order: order,
    totalQuantityInput : totalQuantityInput,
    totalQuantitySold :totalQuantitySold,
    totalRevenue, totalRevenue
  });
};




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
        image: order.image || "",
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
    res.setHeader("Content-Disposition", "attachment;filename=" + "order.xlsx");
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
