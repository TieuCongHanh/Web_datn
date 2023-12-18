const notifinModel = require("../../models/notificationModel.models")

exports.getNotificationsByUserId = async (req, res, next) => {
    try {
      const userId = req.query.userId;

      const notifications = await notifinModel.notificationModel.find({ id_user: userId });
      res.json(notifications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Lỗi khi lấy danh sách thông báo' });
    }
};

exports.delete = async (req, res, next) => {
    try {
      const id = req.query.id;
  
      const notification = await notifinModel.notificationModel.findByIdAndDelete(id);
      if (!notification) {
        return res.status(404).json({ msg: 'Không tìm thấy thông báo' });
      }
  
      res.json({ msg: 'Thông báo đã được xóa' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Lỗi khi xóa thông báo' });
    }
  };


