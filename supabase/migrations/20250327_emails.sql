-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    to_email TEXT NOT NULL,
    from_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error TEXT
);

-- Create email processing function
CREATE OR REPLACE FUNCTION process_email_queue(email_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update status to processing
    UPDATE emails
    SET status = 'processing'
    WHERE id = email_id;

    -- Send email using Supabase's built-in email functionality
    PERFORM net.http_post(
        url := 'https://api.supabase.com/v1/email/send',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
            'to', (SELECT to_email FROM emails WHERE id = email_id),
            'from', (SELECT from_email FROM emails WHERE id = email_id),
            'subject', (SELECT subject FROM emails WHERE id = email_id),
            'html', (SELECT body FROM emails WHERE id = email_id)
        )
    );

    -- Update status to sent
    UPDATE emails
    SET status = 'sent',
        sent_at = TIMEZONE('utc', NOW())
    WHERE id = email_id;

EXCEPTION WHEN OTHERS THEN
    -- Update status to error
    UPDATE emails
    SET status = 'error',
        error = SQLERRM
    WHERE id = email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;