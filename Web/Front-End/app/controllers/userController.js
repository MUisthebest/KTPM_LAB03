exports.index = (req, res) => {
   res.render('layout', { content: 'login', apiBaseUrl: process.env.API_BASE_URL  || 3001 });
};

exports.register = (req, res) => {
   res.render('layout', { content: 'register', apiBaseUrl: process.env.API_BASE_URL  || 3001 });
};

exports.profile = (req, res) => {
    res.render('layout', { content: 'profile', apiBaseUrl: process.env.API_BASE_URL  || 3001 });
};