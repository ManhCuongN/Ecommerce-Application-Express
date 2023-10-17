const { Kafka, Partitioners  } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
})
const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner})

const runProducer = async () => {
    await producer.connect()
    await producer.send({
        topic: 'test-topic',
        messages: [
            { value: 'Hello KafkaJS user By TipJS!' },
        ],
    })

    await producer.disconnect()
}

runProducer().catch(console.error)
