const express = require('express');
const router = express.Router();

// Hiện tại các tác vụ review được xử lý ở bookRoutes (addReview) 
// và adminRoutes (get/delete reviews).
// File này để dự phòng cho các route review độc lập trong tương lai.

module.exports = router;
