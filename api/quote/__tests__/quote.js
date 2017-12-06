const findQuote = require("../quote").findQuote;
const findQuoteInto = require("../quote").findQuoteInto;

describe("findQuote", () => {
    /**
     * Test : quote sell is fulfilled immediately
     * (sell quantity is 1 and last bid quantity is 1)
     */
    it("should find a perfect 1 to 1 match in first bid", () => {
        // GIVEN
        const quote = {
            "action": "sell",
            "baseCurrency": "BTC",
            "quoteCurrency": "USD",
            "amount": 1
        };

        const bidsArray = [];
        bidsArray.push(["6201.06", "1", 1]);
        bidsArray.push(["6201.05", "1", 1]);
        bidsArray.push(["6201.03", "1", 2]);

        const mockOrderBook = {bids: bidsArray};


        // WHEN
        const res = findQuoteInto(quote, mockOrderBook);

        // THEN
        expect(res.price).toBe(6201.06);
        expect(res.total).toBe(6201.06);
    });


    /**
     * Test : quote sell is fulfilled in first bid
     * (sell quantity is less than first bid quantity)
     */
    it("should find a match in first bid", () => {
        // GIVEN
        const quote = {
            "action": "sell",
            "baseCurrency": "BTC",
            "quoteCurrency": "USD",
            "amount": "3.05502416"
        };

        const bidsArray = [];
        bidsArray.push(["6211.91", "6.45979053", 1]);
        bidsArray.push(["6211.9", "0.25", 1]);
        bidsArray.push(["6211.85", "0.01", 1]);

        const mockOrderBook = {bids: bidsArray};

        // WHEN
        const res = findQuoteInto(quote, mockOrderBook);

        // THEN
        expect(res.price).toBe(6211.91);
        expect(res.total).toBe(18977.53512975);
    });

    /**
     * Test : quote sell is fulfilled over several bids
     *
     */
    it("should find a match adding several different bids", () => {
        // GIVEN
        const quote = {
            "action": "sell",
            "baseCurrency": "BTC",
            "quoteCurrency": "USD",
            "amount": "3.05502416"
        };

        const bidsArray = [];
        bidsArray.push(["6211.9", "0.25", 1]); //1552.975
        bidsArray.push(["6211.85", "0.01", 1]); // 62.1185
        bidsArray.push(["6211.5", "0.9012", 2]); // 5597.8038
        bidsArray.push(["6211.11", "9.05", 2]); // reste 1.89382416 -> 11762.7501784176
        bidsArray.push(["6211.01", "0.01", 1]);
        bidsArray.push(["6211", "1.69651", 5]);

        const mockOrderBook = {bids: bidsArray};

        // WHEN
        const res = findQuoteInto(quote, mockOrderBook);

        // THEN
        expect(res.price).toBe(6211.29211574);
        expect(res.total).toBe(18975.64747842);
    });

    /**
     * Test : quote sell is fulfilled over several asks
     *
     */
    it("should find a match over several different asks", () => {
        // GIVEN
        const quote = {
            "action": "buy",
            "baseCurrency": "BTC",
            "quoteCurrency": "USD",
            "amount": "11"
        };

        const asksArray = [];
        asksArray.push(["6211.94", "3", 9]); //18635.82
        asksArray.push(["6211.95", "7", 1]); //43483.65
        asksArray.push(["6212.01", "0.2", 1]);//1242.402
        asksArray.push(["6212.02", "0.9", 1]);// 4969.616
        asksArray.push(["6212.1", "0.1", 1]);
        asksArray.push(["6212.83", "1", 1]);

        const mockOrderBook = {asks: asksArray};

        // WHEN
        const res = findQuoteInto(quote, mockOrderBook);

        // THEN
        expect(res.price).toBe(6211.95345455);
        expect(res.total).toBe(68331.488);

    });

    /**
     * Test : the quantity of quote is not fulfilled
     *
     */
    it("should not find a match if initial quantity is not fulfilled", () => {
        // GIVEN
        const quote = {
            "action": "buy",
            "baseCurrency": "BTC",
            "quoteCurrency": "USD",
            "amount": "5"
        };

        const asksArray = [];
        asksArray.push(["6211.94", "3", 1]);

        const mockOrderBook = {asks: asksArray};

        // WHEN
        const res = findQuoteInto(quote, mockOrderBook);

        //
        expect(res.price).toBe(6211.94);
        expect(res.total).toBe(18635.82);
        expect(res.currency).toBe("USD");
        expect(res.unfilled).toBe(2);

    });

    it("should find a match while base currency and quote currency being reversed", () => {
        // GIVEN
        const quote = {
            "action": "buy",
            "baseCurrency": "USD",
            "quoteCurrency": "BTC",
            "amount": "1000"
        };

        const bidsArray = [];
        bidsArray.push(["500", "3", 1]);

        const mockOrderBook = {bids: bidsArray};
        const reverseOrderBook = true;

        // WHEN
        const res = findQuoteInto(quote, mockOrderBook, reverseOrderBook);

        // THEN
        expect(res.price).toBe(0.002);
        expect(res.total).toBe(2);
        expect(res.currency).toBe("BTC");
    });

    it("should find the best quote in reversed mode", () => {
        // GIVEN
        const quote = {
            "action": "buy",
            "baseCurrency": "USD",
            "quoteCurrency": "BTC",
            "amount": "1000"
        };

        const bidsArray = [];
        bidsArray.push(["1000", "3", 1]);
        bidsArray.push(["500", "3", 1]);

        const mockOrderBook = {bids: bidsArray};
        const reverseOrderBook = true;

        // WHEN
        const res = findQuoteInto(quote, mockOrderBook, reverseOrderBook);

        // THEN
        expect(res.price).toBe(0.001);
        expect(res.total).toBe(1);
        expect(res.currency).toBe("BTC");
    })
});