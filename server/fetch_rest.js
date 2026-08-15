const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

async function run() {
  if (urlMatch && keyMatch) {
    const res = await fetch(`${urlMatch[1].trim()}/rest/v1/events?id=eq.495b08f1-e2ec-4c04-8167-09b74cf88e58`, {
      headers: {
        'apikey': keyMatch[1].trim(),
        'Authorization': `Bearer ${keyMatch[1].trim()}`
      }
    });
    const data = await res.json();
    console.log("STATUS:", data[0].status);
    console.log("CATEGORY_CODE:", data[0].category_code);
    console.log("EXT_CHAMP_ID:", data[0].external_championship_id);
    console.log("SPORTS_STATUS:", data[0].sports_integration_status);
  }
}
run();
