exports.index = (req, res) => {
    res.render('layout', { content: 'cart', apiBaseUrl: process.env.API_BASE_URL  || 3003 });
}