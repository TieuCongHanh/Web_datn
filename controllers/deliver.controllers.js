const DeliverModel = require('../models/deliver.models');


exports.getAllDelivery = async (req, res) => {
  try {
    const deliveries = await DeliverModel.find();
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { name, phone, location, email } = req.body;
    const updatedDelivery = await DeliverModel.findByIdAndUpdate(
      deliveryId,
      { name, phone, location, email },
      { new: true }
    );
    if (updatedDelivery) {
      res.json(updatedDelivery);
    } else {
      res.status(404).json({ error: 'Delivery không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const deletedDelivery = await DeliverModel.findByIdAndDelete(deliveryId);
    if (deletedDelivery) {
      res.json({ message: 'Xóa thành công' });
    } else {
      res.status(404).json({ error: 'Không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.createDelivery = async (req, res) => {
  try {
    const { name, phone, location, email } = req.body;
    const delivery = new DeliverModel({
      name,
      phone,
      location,
      email,
    });
    await delivery.save();
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};


exports.getDeliveryById = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const delivery = await DeliverModel.findById(deliveryId);
    if (delivery) {
      res.json(delivery);
    } else {
      res.status(404).json({ error: 'Delivery không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};