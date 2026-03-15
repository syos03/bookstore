/**
 * Wrapper để xử lý async/await errors tự động
 * Thay vì phải dùng try/catch trong mỗi controller
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
