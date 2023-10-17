 const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
    CLIENT_ID: 'x-client-id',
    REFRESHTOKEN: 'x-rtoken-id'
}

const enumOrderStatus = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    SHIPPED: "shipped",
    CANCELLED: "cancelled",
    DELIVERED: "delivered"
}

const TYPE_NOTIFICATIONS ={
     ORDER_001: "order success",
     ORDER_002: "order failed",
     PROMOTION_001: "new promotion",
     SHOP_001: "new product"
}

module.exports = {
    HEADER,
    TYPE_NOTIFICATIONS,
    enumOrderStatus
}

