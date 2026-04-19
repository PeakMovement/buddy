/*
  # Seed invitation webhook URL

  ## Summary
  Pre-populates the webhook_settings table with the Make.com webhook URL
  for all existing practitioners who don't already have a webhook configured.
  This allows the client invitation feature to work immediately without
  requiring manual configuration in Settings.

  ## Changes
  - Inserts a webhook_settings row for each practitioner that lacks one,
    using the provided Make.com webhook URL with enabled = true.
*/

INSERT INTO webhook_settings (practitioner_id, webhook_url, enabled)
SELECT id, 'https://hook.eu2.make.com/8yhpc3dxe7pvii3vl455xdf97p3qlhaw', true
FROM practitioners
WHERE id NOT IN (SELECT practitioner_id FROM webhook_settings);
