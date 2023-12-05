const mongoose =  require('mongoose');
mongoose.connect('mongodb+srv://duAnTotNghiep:hvh12345@cluster0.zlbpgt6.mongodb.net/outstandfood?retryWrites=true&w=majority')
.catch((err) => {
console.log('lỗi');
console.log(err);   
})
module.exports = {mongoose};