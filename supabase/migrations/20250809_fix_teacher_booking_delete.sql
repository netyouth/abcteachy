-- Add DELETE policy for teachers to delete their own bookings
-- This mirrors the UPDATE policy that allows teachers to update bookings they're involved in

CREATE POLICY "bookings_delete_participants_or_admin" 
ON "public"."bookings" 
AS PERMISSIVE 
FOR DELETE 
TO authenticated 
USING (is_admin() OR (auth.uid() = student_id) OR (auth.uid() = teacher_id));