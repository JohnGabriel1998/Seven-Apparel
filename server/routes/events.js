const express = require('express');
const router = express.Router();
const { eventBus } = require('../utils/eventBus');

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const keepAlive = setInterval(() => {
    res.write(':keep-alive\n\n');
  }, 25000);

  const onProductUpdated = (payload) => {
    res.write(`event: productUpdated\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  eventBus.on('productUpdated', onProductUpdated);

  req.on('close', () => {
    clearInterval(keepAlive);
    eventBus.off('productUpdated', onProductUpdated);
  });
});

module.exports = router;


