// services/policy.js

function evaluatePolicy(user, ruleset) {
    if (!ruleset) return 'allow';
  
    if (ruleset.requirePoH && !user.PoH_status) {
      return 'block';
    }
  
    if (ruleset.allowedRoles && !ruleset.allowedRoles.includes(user.role)) {
      return 'block';
    }
  
    return 'allow';
  }
  
  module.exports = { evaluatePolicy };
  