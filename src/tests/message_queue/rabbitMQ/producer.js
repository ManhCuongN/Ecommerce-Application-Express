const amqp = require('amqplib')
const messages = 'hello, RabbitMQ for TipJS'

const runProducer = async() => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost')

        const channel = await connection.createChannel()

        const queueName = 'test-topic'
        await channel.assertQueue(queueName, {
            durable: true
        })

        channel.sendToQueue(queueName, Buffer.from(messages))
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