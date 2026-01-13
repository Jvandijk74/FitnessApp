-- Update nutrition_logs to support product-based logging
alter table nutrition_logs add column if not exists product_name text;
alter table nutrition_logs add column if not exists product_brand text;
alter table nutrition_logs add column if not exists barcode text;
alter table nutrition_logs add column if not exists serving_size numeric;
alter table nutrition_logs add column if not exists serving_unit text;
alter table nutrition_logs add column if not exists openfoodfacts_id text;

-- Rename meal_name to name for more generic use
alter table nutrition_logs rename column meal_name to name;

-- Add index for barcode lookups
create index if not exists idx_nutrition_logs_barcode on nutrition_logs(barcode);
create index if not exists idx_nutrition_logs_openfoodfacts_id on nutrition_logs(openfoodfacts_id);

-- Update the table comment
comment on table nutrition_logs is 'Individual food products logged throughout the day, categorized by meal type';
