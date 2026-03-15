/**
 * ApiFeatures - Xử lý filter, sort, paginate cho MongoDB queries
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Tìm kiếm
  search() {
    const keyword = this.queryString.q
      ? {
          $or: [
            { title: { $regex: this.queryString.q, $options: 'i' } },
            { author: { $regex: this.queryString.q, $options: 'i' } },
            { description: { $regex: this.queryString.q, $options: 'i' } },
          ],
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  // Lọc theo các tiêu chí
  filter() {
    const queryCopy = { ...this.queryString };

    // Loại bỏ các field đặc biệt
    const removeFields = ['q', 'page', 'limit', 'sort', 'fields'];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Lọc theo giá: price[gte]=100000&price[lte]=500000
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sắp xếp
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Giới hạn fields trả về
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Phân trang
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = ApiFeatures;
