-- 🎨 Artist Metadata Population Script
-- Run this script to populate metadata for common artists in your artworks table

-- Add the new columns if they don't exist (skip if already added via createTables())
-- ALTER TABLE artworks ADD COLUMN IF NOT EXISTS art_movement VARCHAR(100);
-- ALTER TABLE artworks ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);  
-- ALTER TABLE artworks ADD COLUMN IF NOT EXISTS time_period VARCHAR(50);

-- 🇮🇹 Italian Renaissance Masters
UPDATE artworks SET art_movement = 'Renaissance', nationality = 'Italian', time_period = 'Renaissance' 
WHERE artist_name_en LIKE '%Leonardo da Vinci%' OR artist_name_en LIKE '%Da Vinci%';

UPDATE artworks SET art_movement = 'Renaissance', nationality = 'Italian', time_period = 'Renaissance' 
WHERE artist_name_en LIKE '%Michelangelo%';

UPDATE artworks SET art_movement = 'Renaissance', nationality = 'Italian', time_period = 'Renaissance' 
WHERE artist_name_en LIKE '%Raphael%' OR artist_name_en LIKE '%Raffaello%';

UPDATE artworks SET art_movement = 'Renaissance', nationality = 'Italian', time_period = 'Renaissance' 
WHERE artist_name_en LIKE '%Botticelli%';

UPDATE artworks SET art_movement = 'Baroque', nationality = 'Italian', time_period = 'Baroque' 
WHERE artist_name_en LIKE '%Caravaggio%';

UPDATE artworks SET art_movement = 'Renaissance', nationality = 'Italian', time_period = 'Renaissance' 
WHERE artist_name_en LIKE '%Titian%';

-- 🇫🇷 French Impressionists
UPDATE artworks SET art_movement = 'Impressionism', nationality = 'French', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Claude Monet%' OR artist_name_en LIKE '%Monet%';

UPDATE artworks SET art_movement = 'Impressionism', nationality = 'French', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Renoir%';

UPDATE artworks SET art_movement = 'Impressionism', nationality = 'French', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Degas%';

UPDATE artworks SET art_movement = 'Post-Impressionism', nationality = 'French', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Cézanne%';

UPDATE artworks SET art_movement = 'Post-Impressionism', nationality = 'French', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Gauguin%';

UPDATE artworks SET art_movement = 'Post-Impressionism', nationality = 'French', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Toulouse-Lautrec%';

-- 🇳🇱 Dutch Masters
UPDATE artworks SET art_movement = 'Baroque', nationality = 'Dutch', time_period = 'Baroque' 
WHERE artist_name_en LIKE '%Rembrandt%';

UPDATE artworks SET art_movement = 'Baroque', nationality = 'Dutch', time_period = 'Baroque' 
WHERE artist_name_en LIKE '%Vermeer%';

UPDATE artworks SET art_movement = 'Post-Impressionism', nationality = 'Dutch', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Van Gogh%' OR artist_name_en LIKE '%van Gogh%';

-- 🇪🇸 Spanish Masters
UPDATE artworks SET art_movement = 'Cubism', nationality = 'Spanish', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Picasso%';

UPDATE artworks SET art_movement = 'Surrealism', nationality = 'Spanish', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Dalí%' OR artist_name_en LIKE '%Dali%';

UPDATE artworks SET art_movement = 'Baroque', nationality = 'Spanish', time_period = 'Baroque' 
WHERE artist_name_en LIKE '%Velázquez%' OR artist_name_en LIKE '%Velazquez%';

UPDATE artworks SET art_movement = 'Romanticism', nationality = 'Spanish', time_period = '18th Century' 
WHERE artist_name_en LIKE '%Goya%';

UPDATE artworks SET art_movement = 'Mannerism', nationality = 'Spanish', time_period = 'Renaissance' 
WHERE artist_name_en LIKE '%El Greco%';

-- 🇷🇺 Russian Artists
UPDATE artworks SET art_movement = 'Realism', nationality = 'Russian', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Repin%';

UPDATE artworks SET art_movement = 'Realism', nationality = 'Russian', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Shishkin%';

UPDATE artworks SET art_movement = 'Romanticism', nationality = 'Russian', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Vasnetsov%';

UPDATE artworks SET art_movement = 'Realism', nationality = 'Russian', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Levitan%';

UPDATE artworks SET art_movement = 'Realism', nationality = 'Russian', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Kustodiev%';

UPDATE artworks SET art_movement = 'Romanticism', nationality = 'Russian', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Bryullov%';

UPDATE artworks SET art_movement = 'Abstract Art', nationality = 'Russian', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Kandinsky%';

UPDATE artworks SET art_movement = 'Suprematism', nationality = 'Russian', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Malevich%';

UPDATE artworks SET art_movement = 'Expressionism', nationality = 'Russian', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Chagall%';

-- 🇬🇧 British Artists
UPDATE artworks SET art_movement = 'Romanticism', nationality = 'British', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Turner%';

UPDATE artworks SET art_movement = 'Romanticism', nationality = 'British', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Constable%';

-- 🇺🇸 American Artists
UPDATE artworks SET art_movement = 'Abstract Expressionism', nationality = 'American', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Jackson Pollock%' OR artist_name_en LIKE '%Pollock%';

UPDATE artworks SET art_movement = 'Pop Art', nationality = 'American', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Andy Warhol%' OR artist_name_en LIKE '%Warhol%';

UPDATE artworks SET art_movement = 'Modernism', nationality = 'American', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Georgia O''Keeffe%' OR artist_name_en LIKE '%O''Keeffe%';

UPDATE artworks SET art_movement = 'Realism', nationality = 'American', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Edward Hopper%' OR artist_name_en LIKE '%Hopper%';

-- 🇦🇹 Austrian Artists
UPDATE artworks SET art_movement = 'Art Nouveau', nationality = 'Austrian', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Gustav Klimt%' OR artist_name_en LIKE '%Klimt%';

UPDATE artworks SET art_movement = 'Expressionism', nationality = 'Austrian', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Egon Schiele%' OR artist_name_en LIKE '%Schiele%';

-- 🇩🇪 German Artists
UPDATE artworks SET art_movement = 'Renaissance', nationality = 'German', time_period = 'Renaissance' 
WHERE artist_name_en LIKE '%Albrecht Dürer%' OR artist_name_en LIKE '%Dürer%' OR artist_name_en LIKE '%Durer%';

UPDATE artworks SET art_movement = 'Romanticism', nationality = 'German', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Caspar David Friedrich%' OR artist_name_en LIKE '%Friedrich%';

-- 🇧🇪 Belgian Artists
UPDATE artworks SET art_movement = 'Surrealism', nationality = 'Belgian', time_period = '20th Century' 
WHERE artist_name_en LIKE '%René Magritte%' OR artist_name_en LIKE '%Magritte%';

UPDATE artworks SET art_movement = 'Baroque', nationality = 'Belgian', time_period = 'Baroque' 
WHERE artist_name_en LIKE '%Peter Paul Rubens%' OR artist_name_en LIKE '%Rubens%';

UPDATE artworks SET art_movement = 'Renaissance', nationality = 'Belgian', time_period = 'Renaissance' 
WHERE artist_name_en LIKE '%Jan van Eyck%' OR artist_name_en LIKE '%van Eyck%';

UPDATE artworks SET art_movement = 'Renaissance', nationality = 'Belgian', time_period = 'Renaissance' 
WHERE artist_name_en LIKE '%Pieter Bruegel%' OR artist_name_en LIKE '%Bruegel%';

-- 🇳🇴 Norwegian Artists
UPDATE artworks SET art_movement = 'Expressionism', nationality = 'Norwegian', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Edvard Munch%' OR artist_name_en LIKE '%Munch%';

-- 🇲🇽 Mexican Artists
UPDATE artworks SET art_movement = 'Surrealism', nationality = 'Mexican', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Frida Kahlo%' OR artist_name_en LIKE '%Kahlo%';

UPDATE artworks SET art_movement = 'Muralism', nationality = 'Mexican', time_period = '20th Century' 
WHERE artist_name_en LIKE '%Diego Rivera%' OR artist_name_en LIKE '%Rivera%';

-- 🇨🇿 Czech Artists
UPDATE artworks SET art_movement = 'Art Nouveau', nationality = 'Czech', time_period = '19th Century' 
WHERE artist_name_en LIKE '%Alphonse Mucha%' OR artist_name_en LIKE '%Mucha%';

-- Display results
SELECT artist_name_en, art_movement, nationality, time_period 
FROM artworks 
WHERE art_movement IS NOT NULL 
ORDER BY nationality, artist_name_en;

-- Check how many artists still need metadata
SELECT COUNT(*) as artists_without_metadata
FROM artworks 
WHERE art_movement IS NULL OR nationality IS NULL OR time_period IS NULL;