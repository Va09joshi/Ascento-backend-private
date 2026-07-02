import razorpayInstance from '../../config/razorpay.js';
import { supabaseAdmin } from '../../config/supabase.js';
import crypto from 'crypto';

export const createOrder = async (student_id, data) => {
  if (!razorpayInstance) throw new Error('Razorpay is not configured');
  
  const options = {
    amount: Math.round(data.amount * 100), // Amount in paise
    currency: 'INR',
    receipt: `receipt_${crypto.randomBytes(4).toString('hex')}`,
  };

  const order = await razorpayInstance.orders.create(options);

  const { data: payment, error } = await supabaseAdmin.from('payments').insert({
    student_id,
    enrollment_id: data.enrollment_id,
    razorpay_order_id: order.id,
    amount: data.amount,
    currency: order.currency,
    status: 'pending',
  }).select().single();

  if (error) throw new Error(error.message);

  return { order_id: order.id, amount: order.amount, currency: order.currency, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID };
};

export const verifyPayment = async (data) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  
  const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new Error('Invalid signature');
  }

  const { data: payment, error } = await supabaseAdmin.from('payments').update({
    razorpay_payment_id,
    razorpay_signature,
    status: 'paid',
    paid_at: new Date(),
  }).eq('razorpay_order_id', razorpay_order_id).select().single();

  if (error) throw new Error(error.message);

  if (payment.enrollment_id) {
    await supabaseAdmin.from('enrollments').update({ is_active: true }).eq('id', payment.enrollment_id);
  }

  // Queue email and notification for receipt
  
  return payment;
};

export const getPaymentHistory = async (student_id) => {
  const { data, error } = await supabaseAdmin.from('payments').select('*').eq('student_id', student_id).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const getAllPayments = async () => {
  const { data, error } = await supabaseAdmin.from('payments').select('*, users!student_id(full_name)').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};
