const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(createProxyMiddleware('/api', { target: 'http://127.0.0.1:8000/' }));
    app.use(createProxyMiddleware('/oauth', { target: 'http://127.0.0.1:8000/' }));
};
