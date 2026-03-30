// server/utils/elo.js
function expectedScore(Ra, Rb) {
  return 1 / (1 + Math.pow(10, (Rb - Ra) / 400));
}

/**
 * Simple rating adjustment with fixed points.
 * @param {number} Ra - current rating of player A (white)
 * @param {number} Rb - current rating of player B (black)
 * @param {string} result - '1-0' (white wins), '0-1' (black wins), '1/2-1/2' (draw)
 * @param {number} K - ignored, kept for compatibility
 * @returns {object} { newA, newB, deltaA, deltaB }
 */
function updateElo(Ra, Rb, result, K = 20) {
  let deltaA, deltaB;
  if (result === '1-0') {
    deltaA = 3;
    deltaB = -3;
  } else if (result === '0-1') {
    deltaA = -3;
    deltaB = 3;
  } else { // draw
    deltaA = 1;
    deltaB = 1;
  }

  const Ra_new = Ra + deltaA;
  const Rb_new = Rb + deltaB;

  return { newA: Ra_new, newB: Rb_new, deltaA, deltaB };
}

module.exports = { expectedScore, updateElo };
