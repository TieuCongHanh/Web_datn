const AddressModel = require('../models/address.models');

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
exports.removeAddress = async (req, res) => {
    try {
        await AddressModel.deleteOne({_id: req.body.id_address});
        res.send("Remove address successfully!");
      } catch (error) {
        res.status(500).json({ error: 'Error delete address\n'+error });
      }
}
