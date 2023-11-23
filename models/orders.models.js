var db = require("./db");
const { orderDetailModel, updateTotalPrice } = require("../models/orderdetail.models");

const ordersSchema = new db.mongoose.Schema(
  {
    _id: { type: db.mongoose.Schema.Types.String },
    id_user: { type: db.mongoose.Schema.Types.String, ref: "userModel" },
    id_staff: { type: db.mongoose.Schema.Types.String, ref: "staffModel" },
    id_payment: { type: db.mongoose.Schema.Types.String, ref: "paymentModel" },
    total_price: { type: Number, require: true },
    delivery_status: { type: String, require: true },
    pay_status: { type: Boolean, require: true },
    id_address: { type: db.mongoose.Schema.Types.String, ref: "addressModel" },
    date: { type: String, require: true },
  },
  {
    collection: "orders",
  }
);

// Middleware "pre" để tự động tăng giá trị _id lên 1
ordersSchema.pre("save", function (next) {
  const doc = this;
  if (doc.isNew) {
    // Tìm người dùng có giá trị ID lớn nhất
    ordersModel
      .findOne({}, { _id: 1 }, { sort: { _id: -1 } })
      .then((maxStaff) => {
        // Tăng giá trị ID lên 1
        const regex = /^OD(\d+)$/;
        const maxIdMatch = regex.exec(maxStaff?._id || "");
        const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
        const formattedId = "OD" + String(nextId).padStart(3, "0");
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

ordersSchema.pre("save", async function (next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const totalOrderPrice = await orderDetailModel.aggregate([
        { $match: { id_order: doc._id } },
        {
          $group: {
            _id: null,
            total: { $sum: "$total_price" },
          },
        },
      ]);

      doc.total_price = totalOrderPrice[0]?.total || 0;

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

ordersSchema.post("save", async function (doc) {
  try {
    // Gọi hàm cập nhật lại giá trị total_price
    await updateTotalPrice(doc._id);
  } catch (error) {
    console.error("Error updating total price:", error);
  }
});

// Middleware "pre" để tự động cập nhật giá trị total_price khi có thay đổi trong orderDetailModel
ordersSchema.post("findOneAndUpdate", async function (doc) {
  try {
    // Gọi hàm cập nhật lại giá trị total_price
    await updateTotalPrice(doc._id);
  } catch (error) {
    console.error("Error updating total price:", error);
  }
});

let ordersModel = db.mongoose.model("ordersModel", ordersSchema);

module.exports = { ordersModel };