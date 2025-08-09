-- Create chat message persistence with validation
-- This migration implements server-side message storage and validation

-- Create chat_messages table for persistent message storage
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_role user_role NOT NULL,
  content TEXT NOT NULL,
  sequence_number BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_name ON public.chat_messages(room_name);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sequence ON public.chat_messages(room_name, sequence_number);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read messages from their chat rooms
CREATE POLICY "Users can read own chat messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  -- User is the sender
  sender_id = auth.uid() 
  OR
  -- User is part of private room (room_name format: private-{id1}-{id2})
  (
    room_name LIKE 'private-%' AND
    auth.uid()::text = ANY(string_to_array(substring(room_name FROM 9), '-'))
  )
);

-- RLS Policy: Users can only insert their own messages
CREATE POLICY "Users can insert own messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  sender_role = (SELECT role FROM profiles WHERE id = auth.uid()) AND
  room_name LIKE 'private-%' AND
  auth.uid()::text = ANY(string_to_array(substring(room_name FROM 9), '-'))
);

-- Create message validation function
CREATE OR REPLACE FUNCTION validate_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify message sender matches authenticated user
  IF NEW.sender_id != auth.uid() THEN
    RAISE EXCEPTION 'Message sender does not match authenticated user';
  END IF;
  
  -- Verify role matches user's actual role
  IF NEW.sender_role != (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Message role does not match user role';
  END IF;
  
  -- Verify user is part of the room
  IF NEW.room_name LIKE 'private-%' THEN
    IF auth.uid()::text != ANY(string_to_array(substring(NEW.room_name FROM 9), '-')) THEN
      RAISE EXCEPTION 'User is not part of this chat room';
    END IF;
  END IF;
  
  -- Set updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for message validation
CREATE TRIGGER validate_chat_message_trigger
  BEFORE INSERT OR UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION validate_chat_message();

-- Create function to get chat messages for a room
CREATE OR REPLACE FUNCTION get_chat_messages(room_name_param TEXT, limit_param INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  room_name TEXT,
  sender_id UUID,
  sender_name TEXT,
  sender_role user_role,
  content TEXT,
  sequence_number BIGINT,
  created_at TIMESTAMPTZ
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    cm.id,
    cm.room_name,
    cm.sender_id,
    p.full_name as sender_name,
    cm.sender_role,
    cm.content,
    cm.sequence_number,
    cm.created_at
  FROM chat_messages cm
  JOIN profiles p ON cm.sender_id = p.id
  WHERE cm.room_name = room_name_param
    AND (
      cm.sender_id = auth.uid() 
      OR (
        cm.room_name LIKE 'private-%' AND
        auth.uid()::text = ANY(string_to_array(substring(cm.room_name FROM 9), '-'))
      )
    )
  ORDER BY cm.sequence_number ASC, cm.created_at ASC
  LIMIT limit_param;
$$;

-- Grant permissions
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_messages(TEXT, INT) TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.chat_messages IS 'Persistent storage for chat messages with validation';
COMMENT ON FUNCTION validate_chat_message() IS 'Validates chat messages for security and data integrity';
COMMENT ON FUNCTION get_chat_messages(TEXT, INT) IS 'Securely retrieves chat messages for a room with RLS enforcement';

-- Log the migration
DO $$ 
BEGIN 
  RAISE NOTICE 'Chat message persistence and validation have been implemented successfully';
END $$;