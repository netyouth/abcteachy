
-- Create a table to store tutor booking requests
CREATE TABLE public.tutor_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.tutor_bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert bookings (public form)
CREATE POLICY "Anyone can create booking requests" 
  ON public.tutor_bookings 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow reading all bookings (for admin purposes)
CREATE POLICY "Anyone can view booking requests" 
  ON public.tutor_bookings 
  FOR SELECT 
  USING (true);
