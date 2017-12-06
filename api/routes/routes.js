const findQuote = require("../quote/quote").findQuote;

const appRouter = app => {
    app.get("/", (req, res) => {
        res.send("Hello World");
    });

    /**
     * Get the best price the user would be able to get for that request by executing trades
     * Query structure:
     * Action : buy or sell
     * Base_currency : currency to be bought or sold
     * Quote_currency : currency to quote the price in
     * Amount : amount of base currency to be traded
     */
    app.post("/quote", (req, res) => {
        if (!req.body.action) {
            return res.status(400).send({"status": "error", "message": "missing action"});
        }
        if (req.body.action) {
            if (req.body.action.toLowerCase() !== "sell" && req.body.action.toLowerCase() !== "buy")
                return res.status(400).send({"status": "error", "message": "wrong action"});
        }
        if (!req.body.baseCurrency) {
            return res.status(400).send({"status": "error", "message": "missing base currency"});
        }
        else if (req.body.baseCurrency){
            if (typeof req.body.baseCurrency !== 'string') {
                return res.status(400).send({"status": "error", "message": "bad format base currency"});
            }
        }
        if (!req.body.quoteCurrency) {
            return res.status(400).send({"status": "error", "message": "missing quote currency"});
        }
        else if (req.body.quoteCurrency){
            if (typeof req.body.baseCurrency !== 'string') {
                return res.status(400).send({"status": "error", "message": "bad format quote currency"});
            }
        }
        if (!req.body.amount) {
            return res.status(400).send({"status": "error", "message": "missing amount"});
        } else if (typeof req.body.amount !== 'number') {
            return res.status(400).send({"status": "error", "message": "bad format amount"});
        }

        findQuote(req.body)
            .then(result => {
                res.status(200).send(result)
            })
            .catch(error => {
                res.status(404).send({"status": "error", "message": error.message || error})
            });
    });
};

module.exports = appRouter;

