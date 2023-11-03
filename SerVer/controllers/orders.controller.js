const OrderModel = require('../models/orders.models');


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .populate('id_user')
      .populate('total_price')
      .populate('id_deliver');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { id_user, total_price, delivery_status, id_deliver, date } = req.body;
    const order = new OrderModel({
      id_user,
      total_price,
      delivery_status,
      id_deliver,
      date,
    });
    await order.save();
    await order.populate('id_user').populate('total_price').populate('id_deliver').execPopulate();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};


exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await OrderModel.findById(orderId)
      .populate('id_user')
      .populate('total_price')
      .populate('id_deliver');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};