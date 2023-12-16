const rM = require('../models/rating.models');
var myMD = require('../models/user.models');
const excelJs = require("exceljs");
var fs = require('fs');
const bcrypt = require('bcrypt');
var msg = '';

exports.listRating = async (req, res, next) => {
    let page = parseInt(req.params.i);
    let perPage = parseInt(req.query.data_tables_leght) || 5;
    let ratingSearch = null;

  const searchTerm = req.query.ratingSearch || '';
  const regex = new RegExp(searchTerm, 'i');

  if (searchTerm !== '') {
    ratingSearch = {
      $or: [
        { product_name: { $regex: regex } },
        { _id: { $regex: regex } },
      ]
    };
  }
    let start=( page - 1 )*perPage; // vị trí 0
   
    const by = req.query.by || '_id'; // Sắp xếp theo price nếu không có giá trị by
    const order = req.query.order || 'desc'; // Sắp xếp tăng dần nếu không có giá trị order

    let list = await rM.ratingModel.find(ratingSearch).skip(start).limit(perPage).sort({ [by] :order });
    let totalSP = await rM.ratingModel.find(ratingSearch).countDocuments();
    let currentPageTotal = start + list.length;

    let countlist = await rM.ratingModel.find(ratingSearch);
    let count = countlist.length / perPage;
    count = Math.ceil(count);

    res.render('danhgia/danhgia', {perPage : perPage,  start : start, list: list, countPage: count , req: req , msg: msg,by : by, order :order,totalSP: totalSP,currentPageTotal:currentPageTotal});
}

