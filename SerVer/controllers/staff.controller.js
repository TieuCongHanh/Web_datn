var myMD = require('../models/staffs.models');
const excelJs = require("exceljs");
var fs = require('fs');
const bcrypt = require('bcrypt');
var msg = '';

exports.list = async (req, res, next) => {
    let page=req.params.i;  // trang
    let perPage=4; 
    let searchStaff = null;
    if (req.query.staffName != '' && String(req.query.staffName) != 'undefined') {
        searchStaff = { name: req.query.staffName }
    }
    let start=( page - 1 )*perPage; // vị trí 0
   
    const by = req.query.by || 'staffId'; // Sắp xếp theo user nếu không có giá trị by
    const order = req.query.order || 'asc'; // Sắp xếp tăng dần nếu không có giá trị order

    let list = await myMD.staffModel.find(searchStaff).skip(start).limit(perPage).sort({ [by] :order });
    // Tính tổng số người dùng
    let totalStaff = await myMD.staffModel.find(searchStaff).countDocuments();
// Tính tổng số người dùng trên trang hiện tại
   let currentPageTotal = start + list.length;
   
    let countlist = await myMD.staffModel.find(searchStaff);
    let count = countlist.length / perPage;
    count = Math.ceil(count);

    console.log(list);
    res.render('staff/list', { listStaff: list, countPage: count , req: req , msg: msg,by : by, order :order, totalStaff: totalStaff, currentPageTotal:currentPageTotal});
}


exports.in = async (req, res, next) => {
    try {
      let workbook = new excelJs.Workbook();
      const sheet = workbook.addWorksheet("Staff");
      sheet.columns = [
        {
          header: "Mã nhân viên",
          key: "_id",
          width: 10,
          style: { alignment: { horizontal: "center" } },
        },
        {
          header: "Họ tên",
          key: "name",
          width: 15,
          style: { alignment: { horizontal: "center" } },
        },
        {
          header: "Địa chỉ",
          key: "address",
          width: 40,
          style: { alignment: { horizontal: "center" } },
        },
        {
            header: "SĐT",
            key: "phone",
            width: 30,
            style: { alignment: { horizontal: "center" } },
          },
          {
            header: "Ngày sinh",
            key: "date",
            width: 20,
            style: { alignment: { horizontal: "center" } },
          },
          {
            header: "Giới tính",
            key: "gender",
            width: 20,
            style: { alignment: { horizontal: "center" } },
          },
        {
          header: "Email",
          key: "email",
          width: 30,
          style: { alignment: { horizontal: "center" } },
        },
        {
            header: "Chức vụ",
            key: "role",
            width: 30,
            style: { alignment: { horizontal: "center" } },
          },
      ];
      const staffs = await myMD.staffModel.find({});
      // Thêm dữ liệu người dùng vào bảng Excel
      orders.forEach((order) => {
        sheet.addRow({
          _id: staffs._id,
          name: staffs.name,
          address: staffs.address,
          phone: staffs.phone,
          date: staffs.date,
          gender: staffs.gender,
          email: staffs.email,
          role: staffs.role,
        });
      });
  
      // Định dạng header để in đậm
      sheet.getRow(1).font = { bold: true };
  
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
  
  exports.print = async (req, res, next) => {
    try {
      const staffs = await myMD.staffModel.find({});
      // Tạo một tệp PDF mới
      const doc = new PDFDocument();
      const pdfFileName = "DanhSach.pdf";
      // Thiết lập tiêu đề tệp PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${pdfFileName}"`
      );
  
      // Ghi dữ liệu người dùng vào tệp PDF
      doc.pipe(res);
  
      doc.fontSize(20).text("Danh sách nhân viên", { align: "center" });
      doc.moveDown(1);
  
      // Xuất danh sách người dùng
      orders.forEach((staffs) => {
        doc.fontSize(14).text(`Mã nhân viên: ${staffs._id}`);
        doc.fontSize(12).text(`Họ tên: ${staffs.name}`);
        doc.fontSize(12).text(`Địa chỉ: ${staffs.address}`);
        doc.fontSize(12).text(`SĐT: ${staffs.phone}`);
        doc.fontSize(12).text(`Ngày sinh: ${staffs.date}`);;
        doc.fontSize(12).text(`Giới tính: ${staffs.gender}`);;
        doc.fontSize(12).text(`Email: ${staffs.email}`);;
        doc.fontSize(12).text(`Chức vụ: ${staffs.role}`);
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
    if (req.method == 'POST') {
        const existingStaff = await myMD.staffModel.find({ name: req.body.nameStaff });
      
        if (!existingStaff) {
            const errorMsg = "Nhân viên đã tồn tại.";
            return res.render('staff/add', { req: req, msg: errorMsg });
        }

        if (!req.body.nameStaff || !req.body.role ||
             !req.body.address || !req.body.phone ||
              !req.body.date || !req.body.gender || !req.body.email ) {

            const errorMsg = "Vui lòng điền đầy đủ thông tin.";
            return res.render('user/add', { req: req, msg: errorMsg });
        }
            try {
                let url_file = ''; 
                if (req.file != undefined) {
                    fs.renameSync(req.file.path, "./public/uploads/" + req.file.originalname);
                    url_file = '/uploads/' + req.file.originalname;
                }

                const objStaff = new myMD.staffModel();
                objStaff.name = req.body.nameStaff;
                objStaff.role = req.body.role;
                objStaff.image = url_file;
                objStaff.address = req.body.address;
                objStaff.phone = req.body.phone;
                objStaff.date = req.body.date;
                objStaff.gender = req.body.gender;
                objStaff.email = req.body.email;

                const new_staff = await objStaff.save();
                msg = "Thêm thành công";
                console.log(new_staff);
            } catch (err) {
                console.log(err);
            }
        
    }
    res.render('staff/add', { req: req, msg: msg });
};


exports.edit = async (req, res, next) => {
    let msg = '';
    let idStaff = req.params.id;
    let objStaff = await myMD.staffModel.findById(idStaff);

    if (req.method === 'POST') {
        if (!req.body.nameStaff || !req.body.role ||
            !req.body.address || !req.body.phone ||
             !req.body.date || !req.body.gender || !req.body.email ) {

            msg = "Vui lòng điền đầy đủ thông tin.";
            return res.render('staff/edit', { msg: msg, objStaff: objStaff, req: req });
        }
        try {
            let objStaff = new myMD.staffModel();
            objStaff.name = req.body.nameStaff;
                objStaff.role = req.body.role;
                objStaff.address = req.body.address;
                objStaff.phone = req.body.phone;
                objStaff.date = req.body.date;
                objStaff.gender = req.body.gender;
                objStaff.email = req.body.email;

            if (req.file != undefined) {
                fs.renameSync(req.file.path, "./public/uploads/" + req.file.originalname);
                let url_file = '/uploads/' + req.file.originalname;
                objStaff.image = url_file;
            } else {
                objStaff.image = objStaff.image;
            }

            await myMD.staffModel.findByIdAndUpdate(idStaff, objStaff);
            msg = 'Cập Nhật Thành Công';
        } catch (error) {
            msg = 'Lỗi Ghi CSDL: ' + error.message;
            console.log(error);
        }
    }

    res.render('staff/edit', { msg: msg, objStaff: objStaff, req: req });
};

// delete
exports.deleteStaff = async (req, res, next) => {
    msg = '';
    try {
      await myMD.staffModel.deleteOne({_id: req.body.IdDelete});
      msg = 'Xóa thành công' 
      res.redirect('/staff/1');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  };




