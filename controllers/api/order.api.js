var OrderModel = require('../../models/orders.models');
var orderDetailModel = require('../../models/orderdetail.models');

var msg = '';

exports.ordered = async (req, res, next) => {
    try {
        let id_user = req.body.id_user;
        let listOrdered = await OrderModel.ordersModel
        .findOne({id_user : id_user})
        .populate("id_user")
        .populate("id_staff")
        .populate("id_payment")
        .populate("id_address");

        if(listOrdered){

            let listOrderDetail = await orderDetailModel.orderDetailModel.find({id_order : listOrdered._id}).populate('id_product');
            return res.status(200).json({ordered : listOrdered, listDetail : listOrderDetail , msg :"Danh sách đơn hàng"});
        }

    } catch (error) {
        return res.status(500).json({ordered : [], msg :"error"});
    }
}


exports.addOrder = async (req, res, next) => {
  try {
    let id_user = req.body.id_user;
    let id_staff = req.body.id_staff;
    let id_payment = req.body.id_payment;
    let delivery_status = req.body.delivery_status;
    let pay_status = req.body.pay_status;
    let id_address = req.body.id_address;
    let date = req.body.date;

    let quantity = req.body.quantity;
    let id_product = req.body.id_product;

    let orderDetails = []; // Danh sách orderDetail

    if (Array.isArray(quantity) && Array.isArray(id_product) && quantity.length === id_product.length) {
      for (let i = 0; i < quantity.length; i++) {
        let orderDetail = new orderDetailModel.orderDetailModel({
          quantity: quantity[i],
          id_product: id_product[i],
        });

        orderDetails.push(orderDetail);
      }
    } else {
      return res.status(400).json({ msg: "Lỗi: quantity và id_product không khớp" });
    }

    let savedOrderDetails = [];
    let totalPrice = 0; // Tổng giá trị total_price của các orderDetail
    for (const orderDetail of orderDetails) {
      let savedOrderDetail = await orderDetail.save();
      savedOrderDetails.push(savedOrderDetail);

      totalPrice += savedOrderDetail.total_price;
    }

    let newOrder = new OrderModel.ordersModel({
      id_user: id_user,
      id_staff: id_staff,
      id_payment: id_payment,
      delivery_status: delivery_status,
      pay_status: pay_status,
      id_address: id_address,
      total_price: totalPrice, // Gán tổng giá trị total_price
      date: date,
    });

    let savedOrder = await newOrder.save();

    if (savedOrder) {
      // Cập nhật id_order trong các orderDetail đã lưu
      await orderDetailModel.orderDetailModel.updateMany(
        { _id: { $in: savedOrderDetails.map((orderDetail) => orderDetail._id) } },
        { $set: { id_order: savedOrder._id } }
      );

      let updatedOrderDetails = await orderDetailModel.orderDetailModel.find({ id_order: savedOrder._id });

      return res.status(200).json({ order: savedOrder, orderDetails: updatedOrderDetails, msg: "Đã thêm đơn hàng và chi tiết đơn hàng" });
    } else {
      return res.status(400).json({ msg: "Không thể thêm đơn hàng" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Lỗi server" });
  }
}