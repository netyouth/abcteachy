#!/usr/bin/env node

/**
 * Admin User Creation Script for ABC Teachy
 * 
 * This script creates admin users in Supabase with proper profile setup.
 * It uses the service role key to bypass RLS for admin operations.
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Supabase configuration
const SUPABASE_URL = "https://objcklmxfnnsveqhsrok.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamNrbG14Zm5uc3ZlcWhzcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODYyNTYsImV4cCI6MjA2OTI2MjI1Nn0.d7qKh3jffBDmCZz2pUpRr02SET72PSVnm-N_oUW_DXU";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase clients
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function askSecretQuestion(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    process.stdout.write(question);
    let password = '';
    
    stdin.on('data', function (ch) {
      ch = ch + '';
      
      switch (ch) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl-D
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl-C
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += ch;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createAdminUser() {
  try {
    console.log('🚀 ABC Teachy Admin User Creation Tool\n');
    
    // Check if service role key is provided
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY environment variable not set.');
      console.log('   You can still create admin users, but we\'ll use the regular client.\n');
    }
    
    // Get user input
    const email = await askQuestion('📧 Enter admin email: ');
    const fullName = await askQuestion('👤 Enter full name: ');
    const password = await askSecretQuestion('🔐 Enter password (8+ characters): ');
    
    console.log('\n🔄 Creating admin user...');
    
    // Validate input
    if (!email || !fullName || !password) {
      throw new Error('All fields are required');
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // Create user with admin privileges
    const client = SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : supabaseClient;
    
    let result;
    if (SUPABASE_SERVICE_ROLE_KEY) {
      // Use admin client to create user directly
      result = await client.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'admin'
        }
      });
    } else {
      // Use regular signup
      result = await client.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin'
          }
        }
      });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    console.log('✅ Admin user created successfully!');
    console.log(`   User ID: ${result.data.user?.id}`);
    console.log(`   Email: ${email}`);
    console.log(`   Full Name: ${fullName}`);
    console.log(`   Role: admin`);
    
    // Verify profile was created
    if (result.data.user?.id) {
      console.log('\n🔍 Verifying profile creation...');
      
      const { data: profile, error: profileError } = await supabaseAdmin.from('profiles')
        .select('*')
        .eq('id', result.data.user.id)
        .single();
      
      if (profileError) {
        console.log('⚠️  Profile verification failed:', profileError.message);
        console.log('   The user was created but profile may need manual setup.');
      } else {
        console.log('✅ Profile verified successfully!');
        console.log(`   Profile Role: ${profile.role}`);
        console.log(`   Created: ${profile.created_at}`);
      }
    }
    
    console.log('\n🎉 Admin setup complete!');
    console.log('   You can now login at: http://localhost:3000/login');
    console.log(`   Email: ${email}`);
    console.log('   Password: [the password you entered]');
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function listAdminUsers() {
  try {
    console.log('📋 Current Admin Users:\n');
    
    const { data: admins, error } = await supabaseAdmin.from('profiles')
      .select(`
        id,
        full_name,
        role,
        created_at,
        updated_at
      `)
      .eq('role', 'admin')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    if (admins.length === 0) {
      console.log('   No admin users found.');
    } else {
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.full_name}`);
        console.log(`      ID: ${admin.id}`);
        console.log(`      Created: ${new Date(admin.created_at).toLocaleString()}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error listing admin users:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--list') || args.includes('-l')) {
    await listAdminUsers();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 ABC Teachy Admin User Creation Tool

Usage:
  node create-admin-user.js              Create a new admin user
  node create-admin-user.js --list       List existing admin users
  node create-admin-user.js --help       Show this help message

Environment Variables:
  SUPABASE_SERVICE_ROLE_KEY              Optional: Service role key for direct user creation

Examples:
  # Create new admin user
  node create-admin-user.js
  
  # List existing admins
  node create-admin-user.js --list
  
  # With service role key
  SUPABASE_SERVICE_ROLE_KEY=your_key_here node create-admin-user.js
`);
    return;
  }
  
  await createAdminUser();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createAdminUser, listAdminUsers }; 