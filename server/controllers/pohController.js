exports.checkPoH = async (req, res) => {
    const { userId } = req.body;
  
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
  
    const isHuman = true; // Simulate Fractal check
  
    return res.json({
      userId,
      verified: isHuman,
      message: 'User verified via Fractal ID (simulated)'
    });
  };
  