import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCreateUser() {
  const email = `testuser_${Date.now()}@ascento.com`;
  const password = 'secure_password';

  console.log(`Trying to create user: ${email}`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error('Failed to create user. Error details:');
    console.error(JSON.stringify(error, null, 2));
  } else {
    console.log('User created successfully:', data.user.id);
  }
}

testCreateUser();
