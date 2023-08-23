const search = (query, queryStr) => {
  const keyword = queryStr.keyword
    ? {
        name: {
          $regex: queryStr.keyword,
          $options: "i", // Case-insensitive matching
        },
      }
    : {};

  query = query.find({ ...keyword });
  return query;
};

const filter = (query, queryStr) => {
  const queryCopy = { ...queryStr };

  const removeFields = ["keyword", "limit", "page"];
  removeFields.forEach((el) => delete queryCopy[el]);

  // Convert queryCopy to JSON and replace comparison operators
  let queryStrJSON = JSON.stringify(queryCopy);
  queryStrJSON = queryStrJSON.replace(
    /\b(gt|gte|lt|lte)\b/g,
    (match) => `$${match}`
  );

  query = query.find(JSON.parse(queryStrJSON));
  return query;
};

const pagination = (query, queryStr, resPerPage) => {
  const currentPage = Number(queryStr.page) || 1;
  const skip = resPerPage * (currentPage - 1);

  // Limit the number of results per page and skip appropriate records
  query = query.limit(resPerPage).skip(skip);
  return query;
};

export { search, filter, pagination };
