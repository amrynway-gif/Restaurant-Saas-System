const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: restaurant, error } = await supabase.from('restaurants').select('*').ilike('subdomain', '%shawarmabros%');
  if (error) { console.error(error); return; }
  console.log("Restaurants matching shawarmabros:");
  console.log(restaurant);
  
  if (restaurant && restaurant.length > 0) {
    for (const r of restaurant) {
      const { data: profiles } = await supabase.from('profiles').select('*').eq('restaurant_id', r.id);
      console.log(`Profiles for ${r.name} (${r.subdomain}):`);
      console.log(profiles);
      
      if (profiles && profiles.length > 0) {
        for (const p of profiles) {
           // wait, we don't store email in profiles directly, it's in auth.users
           const { data: userData } = await supabase.auth.admin.getUserById(p.id);
           if (userData && userData.user) {
             console.log(`User email: ${userData.user.email}`);
           }
        }
      }
    }
  } else {
    console.log("No shawarmabros found.");
  }
}
check();
