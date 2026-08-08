-- Migration: Add waiting_list_capacity to registration configuration
-- 072_add_waiting_list_capacity.sql

-- Add waiting_list_capacity to the registration group configuration (additive)
UPDATE system_configurations
SET settings = settings || '{"waiting_list_capacity": 0}'::jsonb
WHERE group_name = 'registration'
  AND NOT settings ? 'waiting_list_capacity';
