var myMD = require('../models/sanpham.models');
var categoryMD = require('../models/category.models');
const excelJs = require("exceljs");
var fs = require('fs');
var msg = '';
const cloudinary = require('cloudinary').v2;


exports.list = async (req, res, next) => {
    let page = parseInt(req.params.i);
    let perPage = parseInt(req.query.data_tables_leght) || 5;
    let productSearch = null;

   
  const searchTerm = req.query.productSearch || '';
  const regex = new RegExp(searchTerm, 'i');

  if (searchTerm !== '') {
    productSearch = {
      $or: [
        { name: { $regex: regex } },
        { _id: { $regex: regex } },
        { category_name: { $regex: regex } },
      ]
    };
  }
    let start=( page - 1 )*perPage; // vị trí 0
   
    const by = req.query.by || '_id'; // Sắp xếp theo price nếu không có giá trị by
    const order = req.query.order || 'desc'; // Sắp xếp tăng dần nếu không có giá trị order

    let list = await myMD.sanphamModel.find(productSearch).skip(start).limit(perPage).sort({ [by] :order }).populate('id_category');
    let totalSP = await myMD.sanphamModel.find(productSearch).countDocuments();
    let currentPageTotal = start + list.length;

    let countlist = await myMD.sanphamModel.find(productSearch);
    let count = countlist.length / perPage;
    count = Math.ceil(count);

    res.render('sanpham/list', {perPage : perPage,  start : start, listL: list, countPage: count , req: req , msg: msg,by : by, order :order,totalSP: totalSP,currentPageTotal:currentPageTotal});
}

exports.in = async (req, res, next) => {
    try {
        let workbook = new excelJs.Workbook();
        const sheet = workbook.addWorksheet("LoaiSP");
        sheet.columns = [
            { header: "Mã", key: "_id", width: 50 },
            { header: "Tên", key: "name", width: 30 },
            { header: "Loại", key: "category", width: 30 },
            { header: "Giá", key: "price", width: 30 },
            { header: "Số lượng", key: "quantity", width: 30 },
            { header: "Mô tả", key: "describe", width: 50 },
            { header: "Ảnh", key: "image", width: 70 },
        ];
        const sanphams = await myMD.sanphamModel.find({}); 
        // Thêm dữ liệu người dùng vào bảng Excel
        sanphams.forEach((sanpham) => {
            sheet.addRow({
                _id: sanpham._id,
                category: sanpham.id_category.name,
                name: sanpham.name,
                price: sanpham.price,
                quantity: sanpham.quantity,
                describe: sanpham.describe,
                image: sanpham.image || '', 
            });
        });
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "sanpham.xlsx"
        );
        // Ghi workbook vào response để tải xuống
        await workbook.xlsx.write(res);
    } catch (error) {
        console.log(error);
    }
};
const PDFDocument = require("pdfkit");

exports.print = async (req, res, next) => {
    try {
        const Sanpham = await myMD.sanphamModel.find({});
        // Tạo một tệp PDF mới
        const doc = new PDFDocument();
        const pdfFileName = "SanPham.pdf";
        // Thiết lập tiêu đề tệp PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${pdfFileName}"`
        );

        // Ghi dữ liệu người dùng vào tệp PDF
        doc.pipe(res);

        doc.fontSize(20).text("List SanPham", { align: "center" });
        doc.moveDown(1);
       
        // Xuất danh sách người dùng
        Sanpham.forEach((Sanpham) => {
            doc.fontSize(14).text(`sp ID: ${Sanpham._id}`);
            doc.fontSize(12).text(`Name: ${Sanpham.name}`);
            doc.fontSize(12).text(`Category: ${Sanpham.category}`);
            doc.fontSize(12).text(`Price: ${Sanpham.price}`);
            doc.fontSize(12).text(`Price: ${Sanpham.quantity}`);
            doc.fontSize(12).text(`describe: ${Sanpham.describe}`);
            doc.fontSize(12).text(`AVT: ${Sanpham.image || "N/A"}`);
            doc.moveDown(1);
        });

        // Kết thúc tệp PDF
        doc.end();

    } catch (error) {
        console.log(error);
        res.status(500).send("Đã xảy ra lỗi trong quá trình in dữ liệu.");
        return; 
    }
};


exports.add = async (req, res, next) => {
    const listCategory = await categoryMD.categoryModel.find();
    if (req.method == 'POST') {
        try {
            if (!req.body.name || !req.body.price) {
                res.render('sanpham/add', { req: req, listCategory :listCategory, msg: "Vui lòng điền đầy đủ thông tin sản phẩm." });
                return;
            }

            const price = parseFloat(req.body.price);
            if (isNaN(price) || price <= 0) {
                res.render('sanpham/add', { req: req, listCategory :listCategory, msg: "Giá sản phẩm phải là một số dương." });
                return;
            }
            const quantity = parseFloat(req.body.quantity);
            if (isNaN(quantity) || quantity <= 0) {
                res.render('sanpham/add', { req: req, listCategory :listCategory, msg: "Số lượng sản phẩm phải là một số dương." });
                return;
            }

            const image = [];
            
            if (req.files != undefined) {
                const fileData = req.files
                fileData.forEach(item => {
                    image.push(item.path)
                });
            } else {
                res.render('sanpham/add', { req: req, listCategory :listCategory, msg: "Vui lòng chọn một tệp hình ảnh" });
                return;
            }
            
            const objSP = new myMD.sanphamModel();
            objSP.id_category = req.body.category
            objSP.name = req.body.name;
            objSP.price = req.body.price;
            objSP.quantity = req.body.quantity;
            objSP.describe = req.body.describe;
            objSP.image = image[0];
            objSP.imageDetail = image;
            await objSP.save();
            msg = "Thêm thành công";
        } catch (err) {
            console.log(err);
        }
    }
    res.render('sanpham/add', { req: req, msg: msg ,listCategory :listCategory});
};

exports.edit = async (req, res, next) => {
    let msg = '';
    let idsp = req.params.id;
    let objSP = await myMD.sanphamModel.findById(idsp).populate('id_category');
    const listCategory = await categoryMD.categoryModel.find();
    const query = req.query;
    let currenImage = Number(query.left) || Number(query.right) || 0;
    let lengthImage = objSP.imageDetail.length

    if (req.method === 'POST') {
        try {


            if (!req.body.name || !req.body.price) {
                res.render('sanpham/edit', { req: req,
                     listCategory: listCategory,
                      objL: objSP,
                       msg: "Vui lòng điền đầy đủ thông tin sản phẩm." ,
                       lengthImage: lengthImage - 1,
                       currenImage: currenImage,});
                return;
            }

            const price = parseFloat(req.body.price);
            if (isNaN(price) || price <= 0) {
                res.render('sanpham/edit', { req: req, listCategory: listCategory, objL: objSP, msg: "Giá sản phẩm phải là một số dương."  ,
                lengthImage: lengthImage - 1,
                currenImage: currenImage,});
                return;
            }

            const quantity = parseFloat(req.body.quantity);
            if (isNaN(quantity) || quantity <= 0) {
                res.render('sanpham/edit', { req: req, listCategory: listCategory, objL: objSP, msg: "Số lượng sản phẩm phải là một số dương."  ,
                lengthImage: lengthImage - 1,
                currenImage: currenImage,});
                return;
            }

            objSP.name = req.body.name;
            objSP.id_category = req.body.category;
            if (req.body.category) {
                const foundCategory = listCategory.find(category => category._id.toString() === req.body.category);
                objSP.category_name = foundCategory ? foundCategory.name : "Khác";
            } else {
                objSP.category_name = "Khác";
            }
            objSP.price = req.body.price;
            objSP.quantity = req.body.quantity;
            objSP.describe = req.body.describe;
            var image = [];
            const fileData = req.files

            if (fileData != undefined && fileData.length > 0) {
                console.log(fileData);
                objSP.imageDetail.map(url => {
                    const publicId = getPublicIdFromUrl(url)
                    cloudinary.uploader.destroy(publicId), (error, result) => {
                        if (error) {
                            console.log("Update Product xóa ảnh khỏi cloud không thành công !!");
                        } else {
                            console.log("Update Product xóa ảnh khỏi cloud  thành công !!");
    
                        }
                    }
                });
                fileData.forEach(item => {
                    image.push(item.path)
                });
              objSP.image = image[0];
              objSP.imageDetail = image;

            } else {
                objSP.image = objSP.image; 
                objSP.imageDetail =  objSP.imageDetail;
            }

            await objSP.save(); // Sử dụng .save() để lưu thông tin sản phẩm

            msg = 'Cập Nhật Thành Công';
        } catch (error) {
            msg = 'Lỗi Ghi CSDL: ' + error.message;
            console.log(error);
        }
    }

    res.render('sanpham/edit', { msg: msg, objL: objSP, listCategory: listCategory, req: req  ,
        lengthImage: lengthImage - 1,
        currenImage: currenImage,});
};


// delete
exports.deleteLoai= async (req,res,next)=>{
    await myMD.sanphamModel.deleteOne({_id: req.body.IdDelete});
    res.redirect('/sanpham/1');
}



exports.import = async (req, res, next) => {
    try {
        const productId = req.body.productId;
        const importDate = new Date();
        const importQuantity = req.body.importQuantity;

        const updatedProduct = await myMD.sanphamModel.findOneAndUpdate(
            { _id: productId },
            {
                $inc: { quantity: importQuantity },
                $push: {
                    importHistory: {
                        date: importDate,
                        quantity: importQuantity
                    }
                }
            },
            { new: true }
        );

        res.json({msg :'Thông tin nhập hàng đã được cập nhật'});
    } catch (err) {
        console.error(err);
        res.status(500).json({msg : 'Lỗi khi cập nhật thông tin nhập hàng'});
    }
};



exports.getProduct  = async (req, res) => {
    var productId = req.params.productId;
    try {
      const order = await myMD.sanphamModel
        .findById(productId)
        .populate("id_category")

      res.json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server error" });
    }
  };

  function getPublicIdFromUrl(url) {
    const startIndex = url.lastIndexOf('/') + 1;
    const endIndex = url.lastIndexOf('.');
    return url.substring(startIndex, endIndex);
}
exports.updateDislay = async (req, res, next) => {
    try {
      const _id = req.body._id;
      const display = req.body.display;
  
      const updatedOrder = await myMD.sanphamModel.findById(_id)
        
      updatedOrder.display = display;

      await updatedOrder.save();
  
      res.json({ msg: 'Thông tin trạng thái hiển thị được cập nhật' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Lỗi khi cập nhật thông tin trạng thái hiển thị' });
    }
  };
