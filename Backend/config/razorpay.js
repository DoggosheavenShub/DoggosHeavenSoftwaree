const Razorpay = require("razorpay");

let _instance = null;

const getInstance = () => {
  if (!_instance) {
    _instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }
  return _instance;
};

exports.instance = {
  orders: {
    create: (opts) => getInstance().orders.create(opts),
  },
};