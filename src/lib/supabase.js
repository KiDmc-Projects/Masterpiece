import { createClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";

export const supabase = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
);

// Quiz-related functions
export async function getDifficultyLevels() {
  const { data, error } = await supabase
    .from("difficulty_levels")
    .select("*")
    .order("id");

  if (error) {
    console.error("Error fetching difficulty levels:", error);
    return [];
  }

  return data;
}

export async function getQuestionsByDifficulty(
  difficultyId,
  limit = 10,
  language = "ru",
) {
  console.log("Fetching questions for difficulty:", difficultyId);

  // Get artworks for this difficulty level - fetch more than needed to allow shuffling
  const { data: artworksData, error: artworksError } = await supabase
    .from("artworks")
    .select("*")
    .eq("difficulty_level", difficultyId);

  console.log("Artworks query result:", { artworksData, artworksError });

  if (artworksError) {
    console.error("Database error:", artworksError);
    return createMockQuestions(difficultyId, limit);
  }

  if (!artworksData || artworksData.length === 0) {
    console.log("No artworks found for difficulty level", difficultyId);
    return createMockQuestions(difficultyId, limit);
  }

  console.log(
    `Found ${artworksData.length} artworks for difficulty ${difficultyId}`,
  );

  // Shuffle artworks and limit to requested amount
  const shuffledArtworks = artworksData
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
  console.log(`Selected ${shuffledArtworks.length} random artworks for quiz`);

  // Build questions from shuffled artworks using smart wrong answers
  const questions = await Promise.all(
    shuffledArtworks.map(async (artwork) => {
      const isRussian = language === "ru";
      const title = isRussian ? artwork.title_ru : artwork.title_en;
      const artist = isRussian
        ? artwork.artist_name_ru
        : artwork.artist_name_en;

      // Get smart wrong answers based on artist metadata
      const wrongAnswers = await getSmartWrongAnswers(
        artwork,
        difficultyId,
        language,
        2,
      );

      const question = {
        id: artwork.id,
        artwork_id: artwork.id,
        question_text: isRussian
          ? `Кто написал картину \"${title}\"?`
          : `Who painted \"${title}\"?`,
        painting_title: title,
        painting_artist: artist,
        image_url: getImageUrl(artwork.image_path),
        correct_answer: artist,
        option_a: artist,
        option_b: wrongAnswers[0] || getRandomArtist(artist, 1, language),
        option_c: wrongAnswers[1] || getRandomArtist(artist, 2, language),
        explanation: isRussian
          ? `${title} была написана ${artist} в ${artwork.year_created} году.`
          : `${title} was painted by ${artist} in ${artwork.year_created}.`,
      };

      console.log("Created smart question:", question);
      return question;
    }),
  );

  console.log("Successfully built questions from real data:", questions);
  return questions;
}

function createMockQuestions(difficultyId, limit) {
  const mockQuestions = [];

  for (let i = 0; i < limit; i++) {
    mockQuestions.push({
      id: `mock_${difficultyId}_${i}`,
      question_text: `Mock Question ${i + 1} (Difficulty ${difficultyId})`,
      painting_title: `Mock Artwork ${i + 1}`,
      painting_artist: `Mock Artist ${i + 1}`,
      image_url: `https://picsum.photos/400/300?random=${difficultyId}${i}`,
      correct_answer: `Mock Artist ${i + 1}`,
      option_a: `Mock Artist ${i + 1}`,
      option_b: `Wrong Artist ${i + 1}A`,
      option_c: `Wrong Artist ${i + 1}B`,
      explanation: `This is a mock question for testing. Difficulty: ${difficultyId}`,
    });
  }

  return mockQuestions;
}

// Smart wrong answer selection based on artist metadata
async function getSmartWrongAnswers(
  correctArtwork,
  difficultyId,
  language = "en",
  count = 2,
) {
  console.log(
    "Getting smart wrong answers for:",
    correctArtwork.artist_name_en,
  );

  // Get all artworks to find similar artists
  const { data: allArtworks, error } = await supabase
    .from("artworks")
    .select("*");

  if (error || !allArtworks) {
    console.error("Error fetching artworks for smart answers:", error);
    return getFallbackWrongAnswers(correctArtwork, language, count);
  }

  const correctArtist =
    language === "ru"
      ? correctArtwork.artist_name_ru
      : correctArtwork.artist_name_en;
  let candidates = [];

  // Find similar artists based on difficulty
  if (difficultyId === 3) {
    // Master - hardest
    // Same art movement (most challenging)
    candidates = allArtworks.filter(
      (artwork) =>
        artwork.art_movement === correctArtwork.art_movement &&
        (language === "ru"
          ? artwork.artist_name_ru
          : artwork.artist_name_en) !== correctArtist,
    );

    // If not enough, add same nationality + time period
    if (candidates.length < count) {
      const additional = allArtworks.filter(
        (artwork) =>
          artwork.nationality === correctArtwork.nationality &&
          artwork.time_period === correctArtwork.time_period &&
          (language === "ru"
            ? artwork.artist_name_ru
            : artwork.artist_name_en) !== correctArtist &&
          !candidates.some(
            (c) =>
              (language === "ru" ? c.artist_name_ru : c.artist_name_en) ===
              (language === "ru"
                ? artwork.artist_name_ru
                : artwork.artist_name_en),
          ),
      );
      candidates = candidates.concat(additional);
    }
  } else if (difficultyId === 2) {
    // Artisan - medium
    // Same nationality or time period
    candidates = allArtworks.filter(
      (artwork) =>
        (artwork.nationality === correctArtwork.nationality ||
          artwork.time_period === correctArtwork.time_period) &&
        (language === "ru"
          ? artwork.artist_name_ru
          : artwork.artist_name_en) !== correctArtist,
    );
  } else {
    // Neophyte - easiest
    // Different movement but similar time period for educational value
    candidates = allArtworks.filter(
      (artwork) =>
        artwork.art_movement !== correctArtwork.art_movement &&
        artwork.time_period === correctArtwork.time_period &&
        (language === "ru"
          ? artwork.artist_name_ru
          : artwork.artist_name_en) !== correctArtist,
    );

    // If not enough, add same nationality but different movement
    if (candidates.length < count) {
      const additional = allArtworks.filter(
        (artwork) =>
          artwork.nationality === correctArtwork.nationality &&
          artwork.art_movement !== correctArtwork.art_movement &&
          (language === "ru"
            ? artwork.artist_name_ru
            : artwork.artist_name_en) !== correctArtist &&
          !candidates.some(
            (c) =>
              (language === "ru" ? c.artist_name_ru : c.artist_name_en) ===
              (language === "ru"
                ? artwork.artist_name_ru
                : artwork.artist_name_en),
          ),
      );
      candidates = candidates.concat(additional);
    }
  }

  // Remove duplicates by artist name
  const uniqueArtists = [];
  const seenArtists = new Set();

  for (const candidate of candidates) {
    const artistName =
      language === "ru" ? candidate.artist_name_ru : candidate.artist_name_en;
    if (!seenArtists.has(artistName)) {
      seenArtists.add(artistName);
      uniqueArtists.push(candidate);
    }
  }

  // Shuffle and take the required count
  const shuffled = uniqueArtists.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  // If we don't have enough smart answers, fill with fallback
  if (selected.length < count) {
    console.log(
      `Only found ${selected.length} smart answers, using fallback for remaining`,
    );
    const fallbackAnswers = getFallbackWrongAnswers(
      correctArtwork,
      language,
      count - selected.length,
    );
    const fallbackArtists = fallbackAnswers.map((name) => ({
      [language === "ru" ? "artist_name_ru" : "artist_name_en"]: name,
    }));
    selected.push(...fallbackArtists);
  }

  // Return artist names
  return selected.map((artwork) =>
    language === "ru" ? artwork.artist_name_ru : artwork.artist_name_en,
  );
}

// Fallback to the old system if smart answers aren't available
function getFallbackWrongAnswers(correctArtwork, language = "en", count = 2) {
  const randomArtistsEn = [
    "Pablo Picasso",
    "Claude Monet",
    "Salvador Dalí",
    "Vincent van Gogh",
    "Michelangelo",
    "Leonardo da Vinci",
    "Rembrandt",
    "Pierre-Auguste Renoir",
    "Caravaggio",
    "Johannes Vermeer",
    "Frida Kahlo",
    "Jackson Pollock",
  ];

  const randomArtistsRu = [
    "Пабло Пикассо",
    "Клод Моне",
    "Сальвадор Дали",
    "Винсент ван Гог",
    "Микеланджело",
    "Леонардо да Винчи",
    "Рембрандт",
    "Пьер-Огюст Ренуар",
    "Караваджо",
    "Йоханнес Вермеер",
    "Фрида Кало",
    "Джексон Поллок",
  ];

  const randomArtists = language === "ru" ? randomArtistsRu : randomArtistsEn;
  const correctArtist =
    language === "ru"
      ? correctArtwork.artist_name_ru
      : correctArtwork.artist_name_en;

  // Filter out the correct artist
  const filtered = randomArtists.filter((artist) => artist !== correctArtist);

  // Shuffle and return the required count
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Legacy function for backward compatibility
function getRandomArtist(correctArtist, index, language = "en") {
  const correctArtwork = {
    [language === "ru" ? "artist_name_ru" : "artist_name_en"]: correctArtist,
  };
  const fallbackAnswers = getFallbackWrongAnswers(correctArtwork, language, 2);
  return fallbackAnswers[index % fallbackAnswers.length];
}

export async function createQuizSession(difficultyId) {
  const { data, error } = await supabase
    .from("quiz_sessions")
    .insert([{ difficulty_level_id: difficultyId }])
    .select()
    .single();

  if (error) {
    console.error("Error creating quiz session:", error);
    return null;
  }

  return data;
}

export async function saveQuizAnswer(
  sessionId,
  questionId,
  userAnswer,
  isCorrect,
  timeSpent = null,
) {
  const { data, error } = await supabase.from("quiz_answers").insert([
    {
      session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      time_spent_seconds: timeSpent,
    },
  ]);

  if (error) {
    console.error("Error saving quiz answer:", error);
    return false;
  }

  return true;
}

export async function updateQuizSession(sessionId, score, completed = true) {
  const updates = {
    score,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("quiz_sessions")
    .update(updates)
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating quiz session:", error);
    return false;
  }

  return true;
}

// Storage functions for artwork images
export function getImageUrl(imagePath) {
  if (!imagePath) return null;

  const { data } = supabase.storage
    .from("artwork-images")
    .getPublicUrl(imagePath);

  return data.publicUrl;
}

export async function uploadImage(file, fileName) {
  console.log("Uploading image:", fileName, "Size:", file.size);

  // Use upsert option to overwrite existing files
  const { data, error } = await supabase.storage
    .from("artwork-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // This will overwrite existing files
    });

  if (error) {
    console.error("Error uploading image:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  console.log("Upload successful:", data);
  return data;
}

// Database setup functions
export async function createTables() {
  console.log("Creating database tables...");

  // Create tables using SQL
  const { data, error } = await supabase.rpc("exec_sql", {
    sql: `
		-- Create difficulty_levels table
		CREATE TABLE IF NOT EXISTS difficulty_levels (
			id SERIAL PRIMARY KEY,
			name VARCHAR(50) NOT NULL,
			description TEXT
		);

		-- Insert difficulty levels
		INSERT INTO difficulty_levels (id, name, description) VALUES
		(1, 'Neophyte', 'Perfect for art beginners'),
		(2, 'Artisan', 'For art enthusiasts'),
		(3, 'Master', 'Challenge for art experts'),
		(4, 'Mix', 'Questions from all levels')
		ON CONFLICT (id) DO NOTHING;

		-- Create artists table
		CREATE TABLE IF NOT EXISTS artists (
			id BIGSERIAL PRIMARY KEY,
			name_en VARCHAR(255) NOT NULL,
			name_ru VARCHAR(255) NOT NULL,
			birth_year INTEGER,
			death_year INTEGER,
			nationality VARCHAR(100),
			art_movement VARCHAR(100),
			difficulty_level INTEGER REFERENCES difficulty_levels(id),
			created_at TIMESTAMP DEFAULT NOW()
		);

		-- Create artworks table
		CREATE TABLE IF NOT EXISTS artworks (
			id BIGSERIAL PRIMARY KEY,
			title_en VARCHAR(255) NOT NULL,
			title_ru VARCHAR(255) NOT NULL,
			artist_name_en VARCHAR(255) NOT NULL,
			artist_name_ru VARCHAR(255) NOT NULL,
			artist_id BIGINT REFERENCES artists(id),
			year_created INTEGER,
			image_path VARCHAR(500) NOT NULL,
			medium VARCHAR(100),
			dimensions VARCHAR(100),
			current_location VARCHAR(255),
			difficulty_level INTEGER REFERENCES difficulty_levels(id),
			-- Metadata for smart wrong answers
			art_movement VARCHAR(100),
			nationality VARCHAR(100),
			time_period VARCHAR(50),
			created_at TIMESTAMP DEFAULT NOW()
		);

		-- Create quiz_questions table
		CREATE TABLE IF NOT EXISTS quiz_questions (
			id BIGSERIAL PRIMARY KEY,
			artwork_id BIGINT REFERENCES artworks(id),
			question_type VARCHAR(50) DEFAULT 'artist_identification',
			difficulty_level INTEGER REFERENCES difficulty_levels(id),
			
			correct_answer_en VARCHAR(255) NOT NULL,
			correct_answer_ru VARCHAR(255) NOT NULL,
			
			option_a_en VARCHAR(255) NOT NULL,
			option_a_ru VARCHAR(255) NOT NULL,
			option_b_en VARCHAR(255) NOT NULL, 
			option_b_ru VARCHAR(255) NOT NULL,
			option_c_en VARCHAR(255) NOT NULL,
			option_c_ru VARCHAR(255) NOT NULL,
			
			explanation_en TEXT,
			explanation_ru TEXT,
			created_at TIMESTAMP DEFAULT NOW()
		);

		-- Create quiz_sessions table
		CREATE TABLE IF NOT EXISTS quiz_sessions (
			id BIGSERIAL PRIMARY KEY,
			difficulty_level_id INTEGER REFERENCES difficulty_levels(id),
			score INTEGER DEFAULT 0,
			completed BOOLEAN DEFAULT FALSE,
			completed_at TIMESTAMP,
			created_at TIMESTAMP DEFAULT NOW()
		);

		-- Create quiz_answers table
		CREATE TABLE IF NOT EXISTS quiz_answers (
			id BIGSERIAL PRIMARY KEY,
			session_id BIGINT REFERENCES quiz_sessions(id),
			question_id BIGINT REFERENCES quiz_questions(id),
			user_answer VARCHAR(255),
			is_correct BOOLEAN,
			time_spent_seconds INTEGER,
			created_at TIMESTAMP DEFAULT NOW()
		);
		`,
  });

  if (error) {
    console.error("Error creating tables:", error);
    return false;
  }

  console.log("Tables created successfully:", data);
  return true;
}

export async function testSupabaseConnection() {
  console.log("Testing Supabase connection...");

  try {
    const { data, error } = await supabase
      .from("difficulty_levels")
      .select("*")
      .limit(1);

    if (error) {
      console.log("Connection test failed:", error);
      return false;
    }

    console.log("Connection test successful:", data);
    return true;
  } catch (err) {
    console.log("Connection error:", err);
    return false;
  }
}

// Helper function to get random questions for Mix difficulty
export async function getMixQuestions(limit = 10, language = "ru") {
  console.log("Fetching mix questions for language:", language);

  // Get all artworks from all difficulty levels for maximum randomization
  const { data: artworksData, error: artworksError } = await supabase
    .from("artworks")
    .select("*");

  if (artworksError || !artworksData || artworksData.length === 0) {
    console.error("Error fetching mix artworks:", artworksError);
    return createMockQuestions(4, limit); // Use difficulty 4 for mix
  }

  console.log(`Found ${artworksData.length} artworks for mix difficulty`);

  // Shuffle and limit artworks
  const shuffledArtworks = artworksData
    .sort(() => 0.5 - Math.random())
    .slice(0, limit);

  // Build questions from random artworks using smart wrong answers
  const questions = await Promise.all(
    shuffledArtworks.map(async (artwork) => {
      const isRussian = language === "ru";
      const title = isRussian ? artwork.title_ru : artwork.title_en;
      const artist = isRussian
        ? artwork.artist_name_ru
        : artwork.artist_name_en;

      // Use Artisan-level difficulty (2) for Mix questions - moderate challenge
      const wrongAnswers = await getSmartWrongAnswers(artwork, 2, language, 2);

      const question = {
        id: artwork.id,
        artwork_id: artwork.id,
        question_text: isRussian
          ? `Кто написал картину "${title}"?`
          : `Who painted "${title}"?`,
        painting_title: title,
        painting_artist: artist,
        image_url: getImageUrl(artwork.image_path),
        correct_answer: artist,
        option_a: artist,
        option_b: wrongAnswers[0] || getRandomArtist(artist, 1, language),
        option_c: wrongAnswers[1] || getRandomArtist(artist, 2, language),
        explanation: isRussian
          ? `${title} была написана ${artist} в ${artwork.year_created} году.`
          : `${title} was painted by ${artist} in ${artwork.year_created}.`,
      };

      console.log("Created smart mix question:", question);
      return question;
    }),
  );

  return questions;
}
