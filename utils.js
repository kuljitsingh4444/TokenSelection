const execute = (app) => {
    let tokenData = [];
    app.get('/getTokens', (req, res) => {
        res.send({ tokens : tokenData });
    })
    app.post('/updateTokens', (req, res) => {
        tokenData = req.body;
        res.send({success : true})
    })
}

module.exports = execute;