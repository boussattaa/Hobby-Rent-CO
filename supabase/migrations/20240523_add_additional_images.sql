alter table items
add column if not exists additional_images text[] default '{}';
