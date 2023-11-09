const AddressModel = require('../models/address.models');

exports.test = async (req, res) => {
    res.send("Test Address");
}
exports.getListAddressByUsedId = async (req, res) => {
    let list = await AddressModel.find().populate('id_user');
    res.send(list);
}
exports.addAddress = async (req, res) => {
    try {
        const { id_user, address} = req.body;
        const newAddress = new AddressModel({
            id_user,
            address,
        });
        await newAddress.save();
        res.json(newAddress);
      } catch (error) {
        res.status(500).json({ error: 'Error add new address\n'+error });
      }
}