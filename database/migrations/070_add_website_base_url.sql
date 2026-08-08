-- Add website_base_url to website_identity

UPDATE system_configurations 
SET settings = jsonb_set(settings, '{website_base_url}', '"https://muskom.komitkabe.com"')
WHERE group_name = 'website_identity' AND NOT (settings ? 'website_base_url');
