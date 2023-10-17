'use strict';


const { promisify } = require('util');
const { reservationInventory } = require('../models/repositories/inventory.repo');

// const host = 'redis-10656.c252.ap-southeast-1-1.ec2.cloud.redislabs.com'; // Thay YOUR_REDIS_HOST bằng địa chỉ host của Redis server
// const port = 10656; // Thay YOUR_REDIS_PORT bằng cổng của Redis server
// const password = 'YyRAhniRFBzK12CyXWE9fBj9w25rEt4H'; // Thay YOUR_REDIS_PASSWORD bằng mật khẩu của Redis server
const {createClient} = require("redis") 


// Initialize client.

const redisClient = createClient({
  host: '127.0.0.1',
  port: 6379,
 
});
redisClient.connect().catch(() => console.log("no"))

// // Kiểm tra kết nối Redis
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// // Kiểm tra lỗi kết nối Redis
redisClient.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

const expire = promisify(redisClient.expire).bind(redisClient);
const setnxAsync = promisify(redisClient.set).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTimes; i++) {
    // Tạo một key, ai giữ sẽ được vào
    const result = await setnxAsync(key, expireTime);

    // Nếu có người giữ trả về 0
    if (result === 1) {
      // Thao tác với inventory
      const isReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });

      if (isReservation.modifiedCount) {
        await expire(key, expireTime);
        return key;
      }

      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await delAsyncKey(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
