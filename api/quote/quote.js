const Gdax = require('gdax');

const productsCache = {
    productList : undefined,
    dateUpdate : undefined
};

const orderBookCache = new Map();
const productCache = new Set();

const TIME_LIMIT_PRODUCTS = 1000 * 5;
const TIME_LIMIT_ORDER_BOOK = 1000 * 30;

/**
 * Find best quote using public order book
 * @quote - quote (sell or buy)
 */
function findQuote(quote) {
    console.log("find quote ", quote.amount);

    let reversedOrderBook = false;
    let productId = quote.baseCurrency + "-" + quote.quoteCurrency;

    return getProducts()
        .then(productsSet => {
            if (!productsSet.has(productId)){
                productId = quote.quoteCurrency + "-" + quote.baseCurrency;
                if (!productsSet.has(productId)){
                    throw new Error('Product not found ' + productId);
                }else{
                    reversedOrderBook = true;
                }
            }

            return getProductOrderBook(productId)
                .then(orderBook => findQuoteInto(quote, orderBook, reversedOrderBook));
        });
}

function getProducts() {
    if (productsCache.productList !== undefined && productsCache.dateUpdate + TIME_LIMIT_PRODUCTS > new Date().getTime()) {
        return productsCache.productList;
    }else {
        return createProductListCache();
    }
}

function createProductListCache() {
    productsCache.productList = new Gdax.PublicClient().getProducts().then(productList => new Set(productList.map(p=>p.id)));
    console.log("-------- populate cache");
    productsCache.dateUpdate = new Date().getTime();
    return productsCache.productList;
}

function getProductOrderBook(productId) {
    let orderBookValue = orderBookCache.get(productId);
    if (!orderBookValue || orderBookValue.dateUpdate + TIME_LIMIT_ORDER_BOOK < new Date().getTime()) {
        orderBookValue = createOrderBookListCache(productId);
    }
    return orderBookValue.orderBook;
}

function createOrderBookListCache(productId) {
    console.log("-----------createOrderBookList : " + productId);

    const orderBookObj = {
        orderBook: new Gdax.PublicClient(productId).getProductOrderBook({'level': 2}),
        dateUpdate: new Date().getTime()
    };
    orderBookCache.set(productId, orderBookObj);

    return orderBookObj;
}


/**
 * Find best quote in provided order book
 * @quote - quote (sell or buy)
 * @book - specific order book to look up the quote
 * @reversedOrderBook - to show that the book was reversed
 */
function findQuoteInto(quote, book, reversedOrderBook) {
    const result = {
        total: 0,
        price: 0,
        currency: "",
        bestPrice: 0,
        lastPrice: 0
    };
    let orders;
    if (!reversedOrderBook) {
        orders = (quote.action === "sell") ? book.bids : book.asks;
    } else {
        orders = (quote.action === "sell") ? book.asks : book.bids;
    }

    let remainingAmount = parseFloat(quote.amount);
    let totalCost = 0;

    let i = 0;
    let price = 0;
    let size = 0;

    while (i < orders.length) {
        price = parseFloat(orders[i][0]);
        size = parseFloat(orders[i][1]);
        const initialSize = size;

        if (reversedOrderBook) {
            size = size * price;
        }

        if (size >= remainingAmount) {
            totalCost += (reversedOrderBook ? remainingAmount / price : remainingAmount * price);
            remainingAmount = 0;
            break;
        } else {
            remainingAmount -= size;
            totalCost += reversedOrderBook ? initialSize : size * price;
        }

        i++;
    }
    const totalSize = quote.amount - remainingAmount;
    const averPrice = totalCost / totalSize;

    //if (remainingAmount > 0) {
    //  throw new Error('Unable to find the best match fulfilling the quote ');
    //}

    result.total = formatNumber(totalCost);
    result.price = formatNumber(averPrice);
    result.currency = quote.quoteCurrency;
    if (reversedOrderBook) {
        result.bestPrice = formatNumber(1 / orders[0][0]);
    } else {
        result.bestPrice = formatNumber(orders[0][0]);
    }

    result.unfilled = remainingAmount;
    if (reversedOrderBook) {
        result.lastPrice = formatNumber(1 / price);
    } else {
        result.lastPrice = formatNumber(price);
    }


    return result;
}

function formatNumber(value, precision = 8) {
    return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
}

exports.findQuoteInto = findQuoteInto;
exports.findQuote = findQuote;
