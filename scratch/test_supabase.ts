import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG = {
  url: 'https://osfnqpehvhznrecljjjf.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjY5MzYsImV4cCI6MjA5MTQ0MjkzNn0.e5dGTLIwTErEACfDTAAn2aDagkm08Q0cd0n6ESXDStw'
};

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      if (error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
        console.error('CRITICAL: Network connection failed. Check if the URL is accessible.');
      }
    } else {
      console.log('Connection successful! Data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
