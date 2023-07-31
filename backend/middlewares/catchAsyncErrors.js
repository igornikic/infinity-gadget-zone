// Wraps function with a try-catch block to handle any errors
export default (func) => (req, res, next) =>
  Promise.resolve(func(req, res, next)).catch(next);
