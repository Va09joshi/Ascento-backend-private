import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdmin() {
  const email = 'superadmin@ascento.com';
  const password = 'secure_password';
  const fullName = 'Super Admin';

  try {
    console.log('Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    let authId;

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('User already exists in Supabase Auth. Fetching ID...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if(signInData?.user) {
           authId = signInData.user.id;
        } else {
            console.log('Failed to sign in to existing user:', signInError);
            return;
        }
      } else {
        throw authError;
      }
    } else {
        authId = authData.user.id;
        console.log('User created in Auth. ID:', authId);
    }

    if (authId) {
        console.log('Inserting/updating in users table...');
        const { data: dbData, error: dbError } = await supabase
            .from('users')
            .upsert({
                auth_id: authId,
                role: 'super_admin',
                full_name: fullName,
                email: email,
                is_active: true,
                must_change_password: false
            }, { onConflict: 'email' })
            .select();

        if (dbError) {
            console.error('Database error:', dbError);
        } else {
            console.log('User inserted/updated in database successfully:', dbData[0]?.id);
            console.log('\n--- SUCCESS ---');
            console.log('You can now log in using:');
            console.log('Email:', email);
            console.log('Password:', password);
        }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();
