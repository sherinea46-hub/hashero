module.exports = async function handler(req, res) {
  return res.status(200).json({ pong: true, method: req.method });
};
