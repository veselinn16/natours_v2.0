// function to enable us to handle errors in async functions without writing async/await all the time
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
