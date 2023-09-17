module.exports = (err, req, res, next) => {
    console.error(err);
    if (err.name === 'UnauthorizedError') {

      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.status(500).json({ message: 'Server error' });
  };
  