-- Enable chat functionality by allowing students and teachers to see each other's profiles
-- This is required for the UserSelector component to show available users for chat

-- Policy 5: Students can view teacher profiles for chat
CREATE POLICY "Students can view teachers for chat" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  role = 'teacher' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'student'
  )
);

-- Policy 6: Teachers can view student profiles for chat  
CREATE POLICY "Teachers can view students for chat" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  role = 'student' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  )
);

-- Also ensure the trigger is properly set up for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comment explaining these policies
COMMENT ON POLICY "Students can view teachers for chat" ON public.profiles IS 
'Allows students to see teacher profiles in chat user selector';

COMMENT ON POLICY "Teachers can view students for chat" ON public.profiles IS 
'Allows teachers to see student profiles in chat user selector';