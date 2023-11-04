const addressModel = require('../models/address.models');

exports.listAddress = async(req, res) => {
    let list = await addressModel.find().populate('id_user');
    res.send(list);
}