const redis = require('redis');
const host = 'redis-10656.c252.ap-southeast-1-1.ec2.cloud.redislabs.com'; // Thay YOUR_REDIS_HOST bằng địa chỉ host của Redis server
const port = 10656; // Thay YOUR_REDIS_PORT bằng cổng của Redis server
const password = 'YyRAhniRFBzK12CyXWE9fBj9w25rEt4H'; // Thay YOUR_REDIS_PASSWORD bằng mật khẩu của Redis server
const database = "ManhCuong-free-db"
const redisClient = redis.createClient();
// Kiểm tra kết nối Redis
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Kiểm tra lỗi kết nối Redis
redisClient.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});


const arr = [
  {
    size: "M",
    inventory: 100
  },
  {
    size: "L",
    inventory: 100
  },
  {
    size: "S",
    inventory: 100
  }
]