// api/ask.js - test version
module.exports = async function handler(req, res) {
  try {
    return res.status(200).json({ ok: true, method: req.method });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};
