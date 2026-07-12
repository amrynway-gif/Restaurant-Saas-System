const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function update() {
  const userId = '789c9128-8b08-47c3-aa86-f1504d03c5a1';
  const newEmail = 'shawarmabros@gmail.com';
  const newPassword = 'Amir++42503487';
  
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    email: newEmail,
    password: newPassword,
    email_confirm: true
  });
  
  if (error) {
    console.error("Error updating user auth:", error);
    return;
  }
  
  const { error: profileError } = await supabase.from('profiles').update({ login_email: newEmail }).eq('id', userId);
  if (profileError) {
    console.error("Error updating profile:", profileError);
    return;
  }
  
  console.log(`Successfully updated shawarmabros login!`);
  console.log(`Email: ${newEmail}`);
  console.log(`Password: ${newPassword}`);
}
update();
