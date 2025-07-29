import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://objcklmxfnnsveqhsrok.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamNrbG14Zm5uc3ZlcWhzcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY4NjI1NiwiZXhwIjoyMDY5MjYyMjU2fQ.remwy5eTrZgoLv1XWmguP7O3ZCGKMBLsLkxZRjDZzds';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupAdmin() {
  const email = 'lfortin.netyouth@gmail.com';
  const password = 'UQRfSLZvQGm39j2';
  const fullName = 'Leonhel Fortin';
  
  try {
    console.log('🔍 Checking current database state...');
    
    // First, check existing users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      throw new Error(`Failed to list users: ${usersError.message}`);
    }
    
    console.log(`📊 Found ${users.users.length} existing users`);
    
    // Check if our admin user already exists
    const existingUser = users.users.find(user => user.email === email);
    
    if (existingUser) {
      console.log('👤 User already exists, checking profile...');
      
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', existingUser.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('📝 Creating missing profile...');
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: existingUser.id,
            full_name: fullName,
            role: 'admin'
          });
        
        if (createError) {
          throw new Error(`Failed to create profile: ${createError.message}`);
        }
        
        console.log('✅ Profile created successfully!');
      } else if (profileError) {
        throw new Error(`Profile check failed: ${profileError.message}`);
      } else {
        // Profile exists, check role
        if (profile.role !== 'admin') {
          console.log('🔧 Updating role to admin...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', existingUser.id);
          
          if (updateError) {
            throw new Error(`Failed to update role: ${updateError.message}`);
          }
          
          console.log('✅ Role updated to admin!');
        } else {
          console.log('✅ User is already an admin!');
        }
      }
      
      console.log('\n🎉 Admin setup complete!');
      console.log(`📧 Email: ${email}`);
      console.log(`🔐 Password: ${password}`);
      return;
    }
    
    console.log('🚀 Creating new admin user...');
    
    // Try creating user without metadata to avoid trigger issues
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
      // No user_metadata to avoid trigger complications
    });
    
    if (createError) {
      throw new Error(`User creation failed: ${createError.message}`);
    }
    
    if (!newUser.user) {
      throw new Error('User creation returned no user data');
    }
    
    console.log('👤 User created successfully!');
    console.log('📝 Creating admin profile...');
    
    // Wait a moment for any async operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create profile manually
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        full_name: fullName,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      // If profile creation fails, it might be because the trigger already created it
      console.log('⚠️  Profile insert failed, checking if trigger created it...');
      
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', newUser.user.id)
        .single();
      
      if (checkError || !existingProfile) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
      
      // Profile exists, update role if needed
      if (existingProfile.role !== 'admin') {
        console.log('🔧 Updating existing profile role to admin...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            full_name: fullName
          })
          .eq('id', newUser.user.id);
        
        if (updateError) {
          throw new Error(`Failed to update profile role: ${updateError.message}`);
        }
      }
    }
    
    console.log('✅ Profile setup complete!');
    console.log('\n🎉 Admin account created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`🆔 User ID: ${newUser.user.id}`);
    
    // Final verification
    console.log('\n🔍 Verifying setup...');
    const { data: finalProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', newUser.user.id)
      .single();
    
    if (verifyError) {
      console.log('⚠️  Verification failed:', verifyError.message);
    } else {
      console.log('✅ Verification successful!');
      console.log(`   Name: ${finalProfile.full_name}`);
      console.log(`   Role: ${finalProfile.role}`);
      console.log(`   Created: ${finalProfile.created_at}`);
    }
    
  } catch (error) {
    console.error('❌ Error setting up admin account:', error.message);
    console.error('📝 Error details:', error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your Supabase project is active');
    console.log('3. Check if email confirmations are disabled in Supabase Auth settings');
    console.log('4. Try running the script again (it\'s safe to re-run)');
  }
}

console.log('🚀 ABC Teachy Admin Setup');
console.log('========================\n');
setupAdmin(); 