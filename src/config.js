module.exports = {
  host: "amqp://localhost",
  tradeMsg: {
    queue: "tradeMsg",
    exchange: "Trade",
    key: "directTradeIn",
  },
};