var db = require("./db");
const sanPhamModel = require("../models/sanpham.models");

const orderDetailSchema = new db.mongoose.Schema(
  {
    _id: { type: db.mongoose.Schema.Types.String },
    id_order: { type: db.mongoose.Schema.Types.String, ref: "ordersModel" },
    id_product: { type: db.mongoose.Schema.Types.String, ref: "sanphamModel" },
    price: { type: Number, require: true },
    quantity: { type: Number, require: true },
    total_price: { type: Number, require: true },
  },
  {
    collection: "orderDetail",
  }
);


orderDetailSchema.pre("save", function (next) {
  const doc = this;
  if (doc.isNew) {

    orderDetailModel.findOne({}, { _id: 1 }, { sort: { _id: -1 } })
      .then((maxStaff) => {
        // Tăng giá trị ID lên 1
        const regex = /^CT(\d+)$/;
        const maxIdMatch = regex.exec(maxStaff?._id || "");
        const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
        const formattedId = "CT" + String(nextId).padStart(3, "0");
        doc._id = formattedId;
        next();
      })
      .catch((error) => {
        next(error);
      });
  } else {
    next();
  }
});

orderDetailSchema.pre("save", async function (next) {
  const doc = this;

  if (doc.isModified("quantity") || doc.isModified("id_product")) {
    try {
      const product = await sanPhamModel.sanphamModel
        .findById(doc.id_product)
        .exec();

      doc.price = product.price;

      const total_price = doc.quantity * doc.price;

      doc.total_price = total_price;
      product.quantity -= this.quantity;
      await product.save();
    } catch (error) {
      return next(error);
    }
  }
  next();
});


let orderDetailModel = db.mongoose.model("orderDetailModel", orderDetailSchema);

module.exports = { orderDetailModel };