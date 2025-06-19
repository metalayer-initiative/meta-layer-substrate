// sessionStore.js
let currentSession = null;

module.exports = {
  getSession: () => currentSession,
  setSession: (session) => { currentSession = session; },
};