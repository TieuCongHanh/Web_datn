var db = require("./db");
var addressModal = require('../models/address.models')

const ordersSchema = new db.mongoose.Schema(
  {
    _id: { type: db.mongoose.Schema.Types.String },
    id_user: { type: db.mongoose.Schema.Types.String, ref: "userModel" , field: "username" },
    id_staff: { type: db.mongoose.Schema.Types.String, ref: "staffModel" },
    id_payment: { type: db.mongoose.Schema.Types.String, ref: "paymentModel" },
    total_price: { type: Number, require: true },
    delivery_status: { type: String, require: true },
    pay_status: { type: Boolean, require: true },
    id_address: { type: db.mongoose.Schema.Types.String, ref: "addressModel" },
    address: {type: String, require: true},
    phone: {type: String, require: true},
    date: { type: Date, require: true },
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
      .then(async (maxStaff) => {
        // Tăng giá trị ID lên 1
        const regex = /^OD(\d+)$/;
        const maxIdMatch = regex.exec(maxStaff?._id || "");
        const nextId = maxIdMatch ? parseInt(maxIdMatch[1]) + 1 : 1;
        const formattedId = "OD" + String(nextId).padStart(3, "0");

        // Gán giá trị ngày hiện tại cho trường "date"
        doc.date = new Date();
        doc._id = formattedId;
        doc.delivery_status = "Chờ xử lý"

        const address = await addressModal.addressModel.findById(this.id_address);
        if (address) {
          this.address = address.address;
          this.phone = address.phone;
        }else{
          this.address = "";
        }
        
        next();
      })
      .catch((error) => {
        next(error);
      });
  } else {
    next();
  }
});



let ordersModel = db.mongoose.model("ordersModel", ordersSchema);

module.exports = { ordersModel };