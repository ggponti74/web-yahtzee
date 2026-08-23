// --- Category scoring functions ---
function scoreOnes(dice) {
  return dice.filter(d => d === 1).length * 1;
}

function scoreTwos(dice) {
  return dice.filter(d => d === 2).length * 2;
}

function scoreThrees(dice) {
  return dice.filter(d => d === 3).length * 3;
}

function scoreFours(dice) {
  return dice.filter(d => d === 4).length * 4;
}

function scoreFives(dice) {
  return dice.filter(d => d === 5).length * 5;
}

function scoreSixes(dice) {
  return dice.filter(d => d === 6).length * 6;
}

function scoreThreeKind(dice) {
  return hasOfAKind(dice, 3) ? sumDice(dice) : 0;
}

function scoreFourKind(dice) {
  return hasOfAKind(dice, 4) ? sumDice(dice) : 0;
}

function scoreFullHouse(dice) {
  return hasFullHouse(dice) ? 25 : 0;
}

function scoreSmallStraight(dice) {
  return hasSmallStraight(dice) ? 30 : 0;
}

function scoreLargeStraight(dice) {
  return hasLargeStraight(dice) ? 40 : 0;
}

function scoreYahtzee(dice) {
  return hasOfAKind(dice, 5) ? 50 : 0;
}

function scoreChance(dice) {
  return sumDice(dice);
}

// --- Helpers ---
function sumDice(dice) {
  return dice.reduce((a, b) => a + b, 0);
}

function hasOfAKind(dice, count) {
  const counts = {};
  dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
  return Object.values(counts).some(c => c >= count);
}

function hasFullHouse(dice) {
  const counts = {};
  dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
  const values = Object.values(counts);
  return values.includes(3) && values.includes(2);
}

function hasSmallStraight(dice) {
  const unique = [...new Set(dice)].sort();
  const straights = [[1,2,3,4],[2,3,4,5],[3,4,5,6]];
  return straights.some(seq => seq.every(n => unique.includes(n)));
}

function hasLargeStraight(dice) {
  const unique = [...new Set(dice)].sort().join('');
  return unique === '12345' || unique === '23456';
}

// --- Main dispatcher ---
export function calculateScore(category, dice) {
  switch (category) {
    case 'ones': return scoreOnes(dice);
    case 'twos': return scoreTwos(dice);
    case 'threes': return scoreThrees(dice);
    case 'fours': return scoreFours(dice);
    case 'fives': return scoreFives(dice);
    case 'sixes': return scoreSixes(dice);
    case 'three-kind': return scoreThreeKind(dice);
    case 'four-kind': return scoreFourKind(dice);
    case 'full-house': return scoreFullHouse(dice);
    case 'small-straight': return scoreSmallStraight(dice);
    case 'large-straight': return scoreLargeStraight(dice);
    case 'yahtzee': return scoreYahtzee(dice);
    case 'chance': return scoreChance(dice);
    default: return 0;
  }
}

// --- Totals ---
export function updateTotals(scorecard) {
  const total = Object.values(scorecard).reduce((a, b) => a + b, 0);
  document.getElementById('total-score').textContent = total;
}
