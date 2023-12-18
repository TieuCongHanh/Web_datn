const OrderModel = require("../models/orders.models");
const paymentModel = require("../models/payment.models");
const userModel = require("../models/user.models");
const staffModel = require("../models/staffs.models")
const detailModel = require("../models/orderdetail.models");
const NotificationModel = require("../models/notificationModel.models");
const excelJs = require("exceljs");
const PDFDocument = require("pdfkit");
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
var serviceAccount = require("../labfirebase-ph21007-2824b-firebase-adminsdk-iknbr-aa19e278a7.json");
const secretKey = process.env.SECRETKEY;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firebaseMessaging = admin.messaging();
var msg = "";

exports.list = async (req, res) => {
  let page = parseInt(req.params.i);
  let perPage = parseInt(req.query.data_tables_leght) || 5; // Lấy số mục từ query parameter
  let orderSearch = {};

  const searchTerm = req.query.orderSearch || '';
  const regex = new RegExp(searchTerm, 'i');

  let startDate = req.query.startDate;
  let endDate = req.query.endDate;

  let dateSearch = {};
  let hasDateSearch = false;

  if (startDate && endDate) {
    dateSearch = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
    hasDateSearch = true; // Đánh dấu rằng có điều kiện ngày
  } else if (startDate && !endDate) {
    dateSearch = {
      date: {
        $gte: new Date(startDate),
      },
    };
    hasDateSearch = true;
  } else if (!startDate && endDate) {
    dateSearch = {
      date: {
        $lte: new Date(endDate),
      },
    };
    hasDateSearch = true;
  }

  if (hasDateSearch) {
    orderSearch = {
      ...dateSearch,
      $or: [
        { $expr: { $regexMatch: { input: "$id_user._id", regex } } },
        { $expr: { $regexMatch: { input: "$id_user.name", regex } } },
        { $expr: { $regexMatch: { input: "$id_address.address", regex } } },
        { _id: { $regex: regex } },
      ],
    };
  } else {
    orderSearch = {
      $or: [
        { $expr: { $regexMatch: { input: "$id_user._id", regex } } },
        { $expr: { $regexMatch: { input: "$id_user.name", regex } } },
        { $expr: { $regexMatch: { input: "$id_address.address", regex } } },
        { _id: { $regex: regex } },
      ],
    };
  }

  let start = (page - 1) * perPage;

  const by = req.query.by || "_id"; // Sắp xếp theo price nếu không có giá trị by
  const order = req.query.order || "desc"; // Sắp xếp tăng dần nếu không có giá trị order

  let list = await OrderModel.ordersModel
    .find(orderSearch)
    .skip(start)
    .limit(perPage)
    .sort({ [by]: order })
    .populate("id_user")
    .populate("id_staff")
    .populate("id_payment")
    .populate("id_address");

  let totalSP = await OrderModel.ordersModel.countDocuments(orderSearch);
  let currentPageTotal = start + list.length;

  let countlist = await OrderModel.ordersModel.find(orderSearch);
  let count = countlist.length / perPage;
  count = Math.ceil(count);

  res.render("order/list", {
    start: start,
    perPage: perPage,
    listL: list,
    countPage: count,
    req: req,
    msg: msg,
    by: by,
    order: order,
    totalSP: totalSP,
    currentPageTotal: currentPageTotal,
    startDate: startDate,
    endDate: endDate,
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
      .populate("id_payment")
      .populate("id_address");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const listOrderDetail = await detailModel.orderDetailModel.find({ id_order : orderId })
    .populate("id_order")
    .populate("id_product");
    
    res.json({order, listOrderDetail});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const id_order = req.body.id_order;
    const newStatus = req.body.newStatus;
    const deliveryPerson = req.body.deliveryPerson;

    const updatedOrder = await OrderModel.ordersModel.findById(id_order)
      
    updatedOrder.delivery_status = newStatus;
    updatedOrder.id_staff = deliveryPerson;
    if(newStatus == "Đã giao"){
      updatedOrder.pay_status = true;
    }
    await updatedOrder.save();

    res.json({ msg: 'Thông tin trạng thái đã được cập nhật' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi khi cập nhật thông tin trạng thái' });
  }
};
exports.listStaff = async (req, res, next) => {
  try {
    const staffList = await staffModel.staffModel.find();
    res.json(staffList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi khi cập nhật thông tin trạng thái' });
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const id_order = req.body.id_order;
    const newStatus = req.body.newStatus;
    const deliveryPerson = req.body.deliveryPerson;

    const updatedOrder = await OrderModel.ordersModel.findById(id_order).populate('id_staff');
      
    updatedOrder.delivery_status = newStatus;
    updatedOrder.id_staff = deliveryPerson;
    if (newStatus === "Đã giao") {
      updatedOrder.pay_status = true;
    }
    await updatedOrder.save();

    const userId = updatedOrder.id_user;

    const token = generateToken(userId);

    let message =  `Đơn hàng ${updatedOrder._id} của bạn được cập nhật trạng thái ${newStatus}`;

    if(updatedOrder.id_staff){
      const staffs = await staffModel.staffModel.findById(updatedOrder.id_staff);
      message += `\nNgười giao: ${staffs.name}\n Số điện thoại: ${staffs.phone}`;
    }

    sendNotification(userId, message, token);

    res.json({ msg: 'Thông tin trạng thái đã được cập nhật' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi khi cập nhật thông tin trạng thái' });
  }
};

function generateToken(userId) {
  const payload = {
    id: userId,
  };
  const token = jwt.sign(payload, secretKey);

  return token;
}

async function sendNotification(userId, message, token) {
  const user = await userModel.userModel.findById(userId);
  console.log(user);
  const notification = {
    token: user.deviceToken,
    notification: {
      title: 'Thông báo',
      body: message
    },
    data: {
      token: token
    }
  };

  firebaseMessaging.send(notification)
    .then(async (response) => {
      console.log('Thông báo đã được gửi thành công:', response);
  
      const newNotification = await new NotificationModel.notificationModel({
        id_user: userId,
        message: message
      });
      newNotification.save();
    })
    .catch((error) => {
      console.error('Lỗi khi gửi thông báo:', error);
    });
}