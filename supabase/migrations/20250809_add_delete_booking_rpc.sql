-- Create RPC function for deleting bookings to avoid RLS issues
-- This ensures proper permission checking and provides better error handling

CREATE OR REPLACE FUNCTION delete_booking(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
  v_actor_role text := coalesce((auth.jwt() ->> 'role'), null);
  v_actor_id uuid := auth.uid();
BEGIN
  -- Get the booking record
  SELECT * INTO booking_record
  FROM bookings
  WHERE id = p_booking_id;
  
  -- Check if booking exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Check permissions: must be admin, the teacher, or the student
  IF NOT (
    is_admin() OR 
    auth.uid() = booking_record.teacher_id OR 
    auth.uid() = booking_record.student_id
  ) THEN
    RAISE EXCEPTION 'Permission denied: You can only delete your own bookings';
  END IF;
  
  -- Manually log the deletion before deleting (to avoid trigger issues)
  INSERT INTO public.booking_audit_logs(booking_id, actor_id, actor_role, action, details)
  VALUES (p_booking_id, v_actor_id, v_actor_role, 'deleted', jsonb_build_object('old', to_jsonb(booking_record)));
  
  -- Disable the trigger temporarily for this operation
  SET session_replication_role = replica;
  
  -- Delete the booking (this will cascade delete audit logs due to FK constraint)
  DELETE FROM bookings WHERE id = p_booking_id;
  
  -- Re-enable the trigger
  SET session_replication_role = DEFAULT;
END;
$$;