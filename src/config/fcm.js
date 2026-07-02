import admin from 'firebase-admin';
import logger from '../utils/logger.js';

let fcmInitialized = false;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8')
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    
    fcmInitialized = true;
    logger.info('Firebase Admin (FCM) initialized successfully.');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin', { error: error.message });
  }
}

export const sendPushNotification = async ({ token, title, body, data = {} }) => {
  if (!fcmInitialized) {
    logger.warn('FCM not initialized, skipping push notification');
    return false;
  }
  
  try {
    const message = {
      notification: { title, body },
      data,
      token,
    };
    
    const response = await admin.messaging().send(message);
    logger.info('Successfully sent message:', response);
    return true;
  } catch (error) {
    logger.error('Error sending push notification:', error);
    return false;
  }
};
