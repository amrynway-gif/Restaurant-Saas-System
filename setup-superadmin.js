const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperAdmin() {
  const email = "amrynway@gmail.com";
  const password = "Amir++42503487";

  console.log(`Checking if user ${email} already exists...`);
  
  // 1. Check if user already exists
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
    process.exit(1);
  }

  let user = usersData.users.find(u => u.email === email);

  if (!user) {
    console.log("User not found. Creating new user...");
    // 2. Create the user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // automatically confirm email
    });

    if (createError) {
      console.error("Error creating user:", createError);
      process.exit(1);
    }
    user = newUser.user;
    console.log(`Created user with ID: ${user.id}`);
    
    // Wait briefly for triggers to run
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    console.log(`User already exists with ID: ${user.id}`);
  }

  console.log("Updating profile to super_admin...");
  
  // 3. Update the profiles table
  const { data: profileData, error: updateError } = await supabase
    .from('profiles')
    .update({ 
      role: 'super_admin',
      restaurant_id: null 
    })
    .eq('id', user.id);

  if (updateError) {
    console.error("Error updating profile:", updateError);
    process.exit(1);
  }

  console.log("Successfully set user as super_admin!");
}

createSuperAdmin();
