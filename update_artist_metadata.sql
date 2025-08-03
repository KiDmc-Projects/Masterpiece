-- ========================================
-- Artist Metadata Update Script
-- Generated: 2025-08-03
-- Purpose: Update metadata for artists found in ARTIST_METADATA_GUIDE.md
-- ========================================

-- Execute these updates in Supabase SQL Editor
-- This will populate art_movement, nationality, and time_period fields
-- for artists that are documented in the metadata guide

BEGIN;

-- ========================================
-- German Artists
-- ========================================

-- Update Albrecht Dürer
UPDATE artworks SET
  art_movement = 'Renaissance',
  nationality = 'German', 
  time_period = 'Renaissance'
WHERE artist_name_en = 'Albrecht Dürer';

-- ========================================
-- Italian Artists  
-- ========================================

-- Update Alessandro Botticelli (Sandro Botticelli)
UPDATE artworks SET
  art_movement = 'Renaissance',
  nationality = 'Italian',
  time_period = 'Renaissance' 
WHERE artist_name_en = 'Alessandro Botticelli';

-- Update Caravaggio
UPDATE artworks SET
  art_movement = 'Baroque',
  nationality = 'Italian',
  time_period = 'Baroque'
WHERE artist_name_en = 'Caravaggio';

-- Update Michelangelo Buonarroti
UPDATE artworks SET
  art_movement = 'Renaissance',
  nationality = 'Italian', 
  time_period = 'Renaissance'
WHERE artist_name_en = 'Michelangelo Buonarroti';

-- Update Titian
UPDATE artworks SET
  art_movement = 'Renaissance',
  nationality = 'Italian',
  time_period = 'Renaissance'
WHERE artist_name_en = 'Titian';

-- ========================================
-- French Artists
-- ========================================

-- Update Camille Pissarro
UPDATE artworks SET
  art_movement = 'Impressionism',
  nationality = 'French',
  time_period = '19th Century'
WHERE artist_name_en = 'Camille Pissarro';

-- Update Edgar Degas
UPDATE artworks SET
  art_movement = 'Impressionism', 
  nationality = 'French',
  time_period = '19th Century'
WHERE artist_name_en = 'Edgar Degas';

-- Update Jean-Honoré Fragonard
UPDATE artworks SET
  art_movement = 'Rococo',
  nationality = 'French',
  time_period = '18th Century'
WHERE artist_name_en = 'Jean-Honoré Fragonard';

-- Update Paul Gauguin
UPDATE artworks SET
  art_movement = 'Post-Impressionism',
  nationality = 'French', 
  time_period = '19th Century'
WHERE artist_name_en = 'Paul Gauguin';

-- Update Pierre-Auguste Renoir
UPDATE artworks SET
  art_movement = 'Impressionism',
  nationality = 'French',
  time_period = '19th Century'
WHERE artist_name_en = 'Pierre-Auguste Renoir';

-- ========================================
-- Dutch Artists
-- ========================================

-- Update Johannes Vermeer
UPDATE artworks SET
  art_movement = 'Baroque',
  nationality = 'Dutch',
  time_period = 'Baroque'
WHERE artist_name_en = 'Johannes Vermeer';

-- Update Rembrandt
UPDATE artworks SET
  art_movement = 'Baroque',
  nationality = 'Dutch', 
  time_period = 'Baroque'
WHERE artist_name_en = 'Rembrandt';

-- ========================================
-- Spanish Artists
-- ========================================

-- Update Diego Velázquez
UPDATE artworks SET
  art_movement = 'Baroque',
  nationality = 'Spanish',
  time_period = 'Baroque'
WHERE artist_name_en = 'Diego Velázquez';

-- Update El Greco
UPDATE artworks SET
  art_movement = 'Mannerism',
  nationality = 'Spanish',
  time_period = 'Renaissance'
WHERE artist_name_en = 'El Greco';

-- ========================================
-- Russian Artists
-- ========================================

-- Update Ilya Repin
UPDATE artworks SET
  art_movement = 'Realism',
  nationality = 'Russian',
  time_period = '19th Century'
WHERE artist_name_en = 'Ilya Repin';

-- Update Isaac Levitan
UPDATE artworks SET
  art_movement = 'Realism',
  nationality = 'Russian',
  time_period = '19th Century'
WHERE artist_name_en = 'Isaac Levitan';

-- Update Ivan Shishkin
UPDATE artworks SET
  art_movement = 'Realism',
  nationality = 'Russian',
  time_period = '19th Century'
WHERE artist_name_en = 'Ivan Shishkin';

-- Update Karl Bryullov
UPDATE artworks SET
  art_movement = 'Romanticism',
  nationality = 'Russian',
  time_period = '19th Century'
WHERE artist_name_en = 'Karl Bryullov';

-- Update Kazimir Malevich
UPDATE artworks SET
  art_movement = 'Suprematism',
  nationality = 'Russian',
  time_period = '20th Century'
WHERE artist_name_en = 'Kazimir Malevich';

-- Update Valentin Serov
UPDATE artworks SET
  art_movement = 'Realism',
  nationality = 'Russian',
  time_period = '19th Century'
WHERE artist_name_en = 'Valentin Serov';

-- Update Viktor Vasnetsov
UPDATE artworks SET
  art_movement = 'Romanticism',
  nationality = 'Russian', 
  time_period = '19th Century'
WHERE artist_name_en = 'Viktor Vasnetsov';

-- Update Wassily Kandinsky
UPDATE artworks SET
  art_movement = 'Abstract Art',
  nationality = 'Russian',
  time_period = '20th Century'
WHERE artist_name_en = 'Wassily Kandinsky';

-- ========================================
-- Austrian Artists
-- ========================================

-- Update Gustav Klimt
UPDATE artworks SET
  art_movement = 'Art Nouveau',
  nationality = 'Austrian',
  time_period = '19th Century'
WHERE artist_name_en = 'Gustav Klimt';

-- ========================================
-- Belgian Artists
-- ========================================

-- Update Jan van Eyck
UPDATE artworks SET
  art_movement = 'Renaissance',
  nationality = 'Belgian',
  time_period = 'Renaissance'
WHERE artist_name_en = 'Jan van Eyck';

-- Update Peter Paul Rubens
UPDATE artworks SET
  art_movement = 'Baroque',
  nationality = 'Belgian',
  time_period = 'Baroque'
WHERE artist_name_en = 'Peter Paul Rubens';

-- ========================================
-- Norwegian Artists
-- ========================================

-- Update Edvard Munch
UPDATE artworks SET
  art_movement = 'Expressionism',
  nationality = 'Norwegian',
  time_period = '20th Century'
WHERE artist_name_en = 'Edvard Munch';

-- ========================================
-- American Artists
-- ========================================

-- Update Andy Warhol
UPDATE artworks SET
  art_movement = 'Pop Art',
  nationality = 'American',
  time_period = '20th Century'
WHERE artist_name_en = 'Andy Warhol';

-- ========================================
-- Verification Queries
-- ========================================

-- Check how many artists now have complete metadata
SELECT 
  COUNT(*) as total_artists,
  COUNT(CASE WHEN art_movement IS NOT NULL AND nationality IS NOT NULL AND time_period IS NOT NULL THEN 1 END) as artists_with_metadata,
  ROUND(
    COUNT(CASE WHEN art_movement IS NOT NULL AND nationality IS NOT NULL AND time_period IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as metadata_completion_percentage
FROM (
  SELECT DISTINCT artist_name_en, art_movement, nationality, time_period 
  FROM artworks
) as unique_artists;

-- Show updated artists
SELECT DISTINCT 
  artist_name_en,
  artist_name_ru,
  art_movement,
  nationality, 
  time_period,
  COUNT(*) as artwork_count
FROM artworks 
WHERE art_movement IS NOT NULL 
  AND nationality IS NOT NULL 
  AND time_period IS NOT NULL
GROUP BY artist_name_en, artist_name_ru, art_movement, nationality, time_period
ORDER BY artist_name_en;

-- Show artists still missing metadata
SELECT DISTINCT
  artist_name_en,
  artist_name_ru,
  COUNT(*) as artwork_count
FROM artworks
WHERE art_movement IS NULL 
  OR nationality IS NULL 
  OR time_period IS NULL
GROUP BY artist_name_en, artist_name_ru
ORDER BY COUNT(*) DESC;

COMMIT;

-- ========================================
-- Post-Update Notes
-- ========================================

/*
After running this script:

1. ✅ 27 artists will have complete metadata from the guide
2. 🔍 Verify results using the queries above  
3. 📋 Research remaining artists not in the guide
4. 🧪 Test the smart wrong answer algorithm effectiveness
5. 📊 Monitor quiz question quality improvements

Next steps:
- Research high-priority artists: Édouard Manet, Henri Matisse, Ivan Aivazovsky, Paul Cezanne
- Update ARTIST_METADATA_GUIDE.md with newly researched artists
- Consider adding metadata validation to admin panel

This update should improve smart wrong answer generation from ~36% to ~60% of artists.
*/