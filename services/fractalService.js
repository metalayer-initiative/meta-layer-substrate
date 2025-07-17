async function checkFractalVerification(userId) {
  // Temporary mock, replace with real Fractal API call later
  return {
    userId,
    isHuman: true,
    source: 'Fractal',
    verifiedAt: new Date().toISOString()
  };
}
