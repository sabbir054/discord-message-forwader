const amqp = require('amqplib');
const config = require('./config'); 

async function produceTradeMessage(msg) {
  const connection = await amqp.connect(config.host);
  const channel = await connection.createChannel();

  const { exchange,queue, key } = config.tradeMsg;

  await channel.assertExchange(exchange, 'direct', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, key);

  channel.publish(exchange, key, Buffer.from(msg));
  console.log(`Sent "${msg}" to exchange "${exchange}" with key "${key}"`);
  await channel.close();
  await connection.close();
  // setTimeout(() => connection.close(), 500);
}



module.exports = {produceTradeMessage};
