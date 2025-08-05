/*
  # Add Notifications System

  1. New Tables
    - `notifications` - Store app notifications for users
    
  2. Security
    - Enable RLS on notifications table
    - Users can only see their own notifications
    
  3. Features
    - Daily setoran reminders
    - Achievement notifications
    - Warning notifications
*/

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('reminder', 'achievement', 'warning', 'info')) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Function to check and create daily reminders
CREATE OR REPLACE FUNCTION check_daily_setoran_reminders()
RETURNS void AS $$
DECLARE
  student_record RECORD;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Loop through all active students
  FOR student_record IN 
    SELECT id, name 
    FROM users 
    WHERE role = 'siswa' 
    AND organize_id IS NOT NULL
  LOOP
    -- Check if student has submitted setoran today
    IF NOT EXISTS (
      SELECT 1 FROM setoran 
      WHERE siswa_id = student_record.id 
      AND tanggal = today_date
    ) THEN
      -- Create reminder notification if not already exists today
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = student_record.id 
        AND type = 'reminder'
        AND DATE(created_at) = today_date
      ) THEN
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
          student_record.id,
          'Reminder Setoran Harian',
          'Jangan lupa untuk mengirim setoran hafalan atau murojaah hari ini!',
          'reminder'
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;