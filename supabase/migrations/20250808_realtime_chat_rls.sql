-- Enable RLS on realtime.messages for chat authorization
-- This migration implements private chat channels with proper RLS policies

-- Enable RLS on realtime.messages table
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can join private chat channels" ON realtime.messages;
DROP POLICY IF EXISTS "Users can send private messages" ON realtime.messages;

-- Policy 1: Allow users to join private chat channels (SELECT for receiving messages)
CREATE POLICY "Users can join private chat channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Check if topic matches expected private room pattern
  (SELECT realtime.topic()) LIKE 'private-%' AND
  -- Verify user is part of this conversation by checking if their ID is in the room name
  (SELECT auth.uid()::text) = ANY(
    string_to_array(
      substring((SELECT realtime.topic()) FROM 9), -- Remove 'private-' prefix
      '-'
    )
  ) AND
  -- Only apply to broadcast messages
  extension = 'broadcast'
);

-- Policy 2: Allow users to send messages in their private channels (INSERT for sending messages)
CREATE POLICY "Users can send private messages"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if topic matches expected private room pattern
  (SELECT realtime.topic()) LIKE 'private-%' AND
  -- Verify user is part of this conversation by checking if their ID is in the room name
  (SELECT auth.uid()::text) = ANY(
    string_to_array(
      substring((SELECT realtime.topic()) FROM 9), -- Remove 'private-' prefix
      '-'
    )
  ) AND
  -- Only apply to broadcast messages
  extension = 'broadcast'
);

-- Grant necessary permissions for realtime functions
GRANT EXECUTE ON FUNCTION realtime.topic() TO authenticated;

-- Add helpful comments
COMMENT ON POLICY "Users can join private chat channels" ON realtime.messages IS 
'Allows authenticated users to receive broadcast messages only from private chat rooms they are part of';

COMMENT ON POLICY "Users can send private messages" ON realtime.messages IS 
'Allows authenticated users to send broadcast messages only to private chat rooms they are part of';

-- Log the migration
DO $$ 
BEGIN 
  RAISE NOTICE 'Realtime chat RLS policies have been created successfully';
END $$;