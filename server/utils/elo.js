// server/utils/elo.js
function expectedScore(Ra, Rb) {
  return 1 / (1 + Math.pow(10, (Rb - Ra) / 400));
}

function updateElo(Ra, Rb, result, K = 20) {
  // result: '1-0' (white wins), '0-1' (black wins), '1/2-1/2' (draw)
  let Sa;
  if (result === '1-0') Sa = 1;
  else if (result === '0-1') Sa = 0;
  else Sa = 0.5;

  const Ea = expectedScore(Ra, Rb);
  const Eb = 1 - Ea;

  const Ra_new = Math.round(Ra + K * (Sa - Ea));
  const Rb_new = Math.round(Rb + K * ((1 - Sa) - Eb));

  const deltaA = Ra_new - Ra;
  const deltaB = Rb_new - Rb;

  return { newA: Ra_new, newB: Rb_new, deltaA, deltaB };
}

module.exports = { expectedScore, updateElo };