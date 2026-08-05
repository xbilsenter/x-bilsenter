'use strict';

module.exports = function pingHandler(_req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    ok: true,
    service: 'x-bilsenter',
    adminUrl: process.env.ADMIN_API_URL || null
  }));
};
