// middleware wrapper per gestire errori nelle funzioni asincrone di Express.
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
