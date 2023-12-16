const { log } = require('console');
var categoryMD = require('../models/category.models');
var productMD = require('../models/sanpham.models');

var msg = '';
const excelJs = require("exceljs");
const PDFDocument = require("pdfkit");

exports.list = async (req, res, next) => {
    let page = parseInt(req.params.i);
    let perPage = parseInt(req.query.data_tables_leght) || 5;
    let categorySearch = null;

  const searchTerm = req.query.categorySearch || '';
  const regex = new RegExp(searchTerm, 'i');

  if (searchTerm !== '') {
    categorySearch = {
      $or: [
        { name: { $regex: regex } },
        { _id: { $regex: regex } },
      ]
    };
  }
    let start=( page - 1 )*perPage; // vị trí 0
   
    const by = req.query.by || '_id'; // Sắp xếp theo price nếu không có giá trị by
    const order = req.query.order || 'desc'; // Sắp xếp tăng dần nếu không có giá trị order

    let list = await categoryMD.categoryModel.find(categorySearch).skip(start).limit(perPage).sort({ [by] :order });
    let totalSP = await categoryMD.categoryModel.find(categorySearch).countDocuments();
    let currentPageTotal = start + list.length;

    let countlist = await categoryMD.categoryModel.find(categorySearch);
    let count = countlist.length / perPage;
    count = Math.ceil(count);

    res.render('category/list', {perPage : perPage,  start : start, listL: list, countPage: count , req: req , msg: msg,by : by, order :order,totalSP: totalSP,currentPageTotal:currentPageTotal});
}

exports.in = async (req, res, next) => {
    try {
        let workbook = new excelJs.Workbook();
        const sheet = workbook.addWorksheet("TheLoai");
        sheet.columns = [
            { header: "Mã", key: "_id", width: 50 },
            { header: "Tên", key: "name", width: 30 },
            { header: "Mô tả", key: "describe", width: 50 },
        ];
        const theLoai = await categoryMD.categoryModel.find({}); 
        // Thêm dữ liệu người dùng vào bảng Excel
        theLoai.forEach((sanpham) => {
            sheet.addRow({
                _id: sanpham._id,
                name: sanpham.name,
                describe: sanpham.describe,
            });
        });
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "theLoai.xlsx"
        );
        // Ghi workbook vào response để tải xuống
        await workbook.xlsx.write(res);
    } catch (error) {
        console.log(error);
    }
};
exports.print = async (req, res, next) => {
    try {
        const category = await categoryMD.categoryModel.find({});
        // Tạo một tệp PDF mới
        const doc = new PDFDocument();
        const pdfFileName = "TheLaoi.pdf";
        // Thiết lập tiêu đề tệp PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${pdfFileName}"`
        );

        // Ghi dữ liệu người dùng vào tệp PDF
        doc.pipe(res);

        doc.fontSize(20).text("Danh sách thể loại", { align: "center" });
        doc.moveDown(1);
       
        // Xuất danh sách người dùng
        category.forEach((Sanpham) => {
            doc.fontSize(14).text(`sp ID: ${Sanpham._id}`);
            doc.fontSize(12).text(`Name: ${Sanpham.name}`);
            doc.fontSize(12).text(`describe: ${Sanpham.describe}`);
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
    try {
        const objSP = new categoryMD.categoryModel();
        objSP.name = req.body.name;
        objSP.describe = req.body.describe;

        const objloai = await objSP.save();
        if (objloai) {
            msg = "Thêm thành công";
        } else {
            msg = "Thêm thất bại";
        }
    } catch (err) {
        console.log(err);
    }
    
    res.redirect('/category/1');
};
exports.edit = async (req, res, next) => {
    try {
      const updatedCategory = await categoryMD.categoryModel.findByIdAndUpdate(
        req.body.categoryId,
        {
          name: req.body.nameUpdate,
          describe: req.body.describeUpdate
        },
        { new: true }
      );
  
      if (!updatedCategory) {
        return res.status(404).json({ error: 'Không tìm thấy mục thể loại' });
      }
      res.redirect('/category/1');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lỗi khi cập nhật mục thể loại' });
    }
  };

exports.getEdit = async (req, res, next) => {
    try {
      const categoryId = req.params.categoryId;
      const category = await categoryMD.categoryModel.findById(categoryId);
  
      if (!category) {
        return res.status(404).json({ error: 'Không tìm thấy mục thể loại' });
      }
  
      res.status(200).json(category);
    } catch (error) {
      console.error(error);
      // Xử lý lỗi
      res.status(500).json({ error: 'Lỗi khi truy vấn dữ liệu' });
    }
  };

// delete
exports.deleteLoai= async (req,res,next)=>{
  try {
      let category = await categoryMD.categoryModel.deleteOne({_id: req.body.IdDelete});
      
      if(category){
          let productList = await productMD.sanphamModel.find({id_category : req.body.IdDelete});
          
          for (let i = 0; i < productList.length; i++) {
              let product = productList[i];
              product.id_category = undefined;
              product.category_name = "Khác";
              await product.save();
          }
      }
  
      res.redirect('/category/1');
  } catch (error) {
      console.log(error);
      res.redirect('/category/1');
  }
}



