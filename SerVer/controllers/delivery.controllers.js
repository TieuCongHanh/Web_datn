const DeliveryModel = require('../models/delivery.models');


exports.getAllDelivery = async (req, res) => {
  try {
    const deliveries = await DeliveryModel.find();
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};


exports.createDelivery = async (req, res) => {
  try {
    const { name, phone, location, email } = req.body;
    const delivery = new DeliveryModel({
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
    const delivery = await DeliveryModel.findById(deliveryId);
    if (delivery) {
      res.json(delivery);
    } else {
      res.status(404).json({ error: 'Delivery không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};