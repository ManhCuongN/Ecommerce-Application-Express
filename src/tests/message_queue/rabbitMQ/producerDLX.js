const amqp = require('amqplib')
const messages = 'hello, RabbitMQ for TipJS'

const runProducer = async() => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost')

        const channel = await connection.createChannel()

        const notificationExchange = 'notificationEx'
        const notiQueue = 'notificationQueueProcess'
        const notificationExchangeDLX = 'notificationExDLX'
        const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'
        
        //1. create exchange
        await channel.assertExchange(notificationExchange, 'direct',
        {
            durable: true
        })

        //2. create queue
        const queueResult = await channel.assertQueue(notiQueue, {
            exclusive: false, //cho phep cac ketnoi truy cap vao cung 1 luc
           deadLetterRoutingKey: notificationRoutingKeyDLX,
           deadLetterExchange: notificationExchangeDLX
        })
         //3. BINDQUEUE
        await channel.bindQueue(queueResult.queue, notificationExchange) 
        // 4. send msg
        const msg = 'A new product Send a noti'
        console.log(`Producer msg::`, msg);
        await channel.sendToQueue(queueResult.queue, Buffer.from(msg),{
            expiration: '1000'
        })

        setTimeout(() => {
            connection.close()
            process.exit(0)
        }, 500)

        console.log(`messages sent`, messages);
    } catch (error) {
        console.log(console.error(error));
    }
}

runProducer().catch(console.error)