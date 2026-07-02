import * as paymentService from './payments.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const order = await paymentService.createOrder(req.user.id, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) { next(error); }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.verifyPayment(req.body);
    res.status(200).json({ success: true, data: payment, message: 'Payment verified' });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const history = await paymentService.getPaymentHistory(req.user.id);
    res.status(200).json({ success: true, data: history });
  } catch (error) { next(error); }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json({ success: true, data: payments });
  } catch (error) { next(error); }
};

export const razorpayWebhook = async (req, res, next) => {
  // Webhook validation logic here (simplified for this plan)
  res.status(200).send('OK');
};
