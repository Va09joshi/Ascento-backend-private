import crypto from 'crypto';

export const generateSecurePassword = (length = 12) => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const special = '!@#$%^&*()';
  const allChars = upper + lower + nums + special;
  
  let password = '';
  // Guarantee at least one of each required type
  password += upper.charAt(crypto.randomInt(0, upper.length));
  password += lower.charAt(crypto.randomInt(0, lower.length));
  password += nums.charAt(crypto.randomInt(0, nums.length));
  password += special.charAt(crypto.randomInt(0, special.length));
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(crypto.randomInt(0, allChars.length));
  }
  
  // Shuffle the password so the guaranteed chars aren't always at the start
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};
