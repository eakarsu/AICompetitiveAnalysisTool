const express = require('express');

const router = express.Router();

router.post('/score', (req, res) => {
  const competitors = Array.isArray(req.body?.competitors)
    ? req.body.competitors
    : [
        { name: 'You', mentions: 420, positive: 260, searchRank: 2 },
        { name: 'RivalOne', mentions: 510, positive: 230, searchRank: 1 },
        { name: 'NicheCo', mentions: 180, positive: 120, searchRank: 5 },
      ];
  const totalMentions = competitors.reduce((sum, item) => sum + Number(item.mentions || 0), 0) || 1;
  const ranked = competitors.map((item) => {
    const mentions = Number(item.mentions || 0);
    const positive = Number(item.positive || 0);
    const share = (mentions / totalMentions) * 100;
    const sentiment = mentions ? (positive / mentions) * 100 : 0;
    const rankDrag = Math.max(0, Number(item.searchRank || 4) - 1) * 4;
    return {
      name: item.name || 'Competitor',
      share: Number(share.toFixed(1)),
      sentiment: Number(sentiment.toFixed(1)),
      opportunityScore: Math.max(0, Math.round(100 - share + sentiment / 3 - rankDrag)),
    };
  }).sort((a, b) => b.opportunityScore - a.opportunityScore);

  res.json({
    ranked,
    leader: ranked[0]?.name,
    recommendations: [
      'Target keywords where share is under 25% and sentiment is above 50%.',
      'Convert positive review themes into comparison-page proof points.',
      'Refresh battlecards for competitors with higher mention share but weaker sentiment.',
    ],
  });
});

module.exports = router;
