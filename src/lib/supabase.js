import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// Quiz-related functions
export async function getDifficultyLevels() {
	const { data, error } = await supabase
		.from('difficulty_levels')
		.select('*')
		.order('id');
	
	if (error) {
		console.error('Error fetching difficulty levels:', error);
		return [];
	}
	
	return data;
}

export async function getQuestionsByDifficulty(difficultyId, limit = 10) {
	console.log('Fetching questions for difficulty:', difficultyId);
	
	// Get artworks for this difficulty level
	const { data: artworksData, error: artworksError } = await supabase
		.from('artworks')
		.select('*')
		.eq('difficulty_level', difficultyId)
		.limit(limit);
	
	console.log('Artworks query result:', { artworksData, artworksError });
	
	if (artworksError) {
		console.error('Database error:', artworksError);
		return createMockQuestions(difficultyId, limit);
	}
	
	if (!artworksData || artworksData.length === 0) {
		console.log('No artworks found for difficulty level', difficultyId);
		return createMockQuestions(difficultyId, limit);
	}
	
	console.log(`Found ${artworksData.length} artworks for difficulty ${difficultyId}`);
	
	// Build questions from artworks (simplified - no complex joins needed)
	const questions = artworksData.map(artwork => {
		const question = {
			id: artwork.id,
			artwork_id: artwork.id,
			question_text: `Who painted "${artwork.title_en}"?`,
			painting_title: artwork.title_en,
			painting_artist: artwork.artist_name_en,
			image_url: getImageUrl(artwork.image_path),
			correct_answer: artwork.artist_name_en,
			option_a: artwork.artist_name_en,
			option_b: getRandomArtist(artwork.artist_name_en, 1),
			option_c: getRandomArtist(artwork.artist_name_en, 2),
			explanation: `${artwork.title_en} was painted by ${artwork.artist_name_en} in ${artwork.year_created}.`
		};
		
		console.log('Created question:', question);
		return question;
	});
	
	console.log('Successfully built questions from real data:', questions);
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
			explanation: `This is a mock question for testing. Difficulty: ${difficultyId}`
		});
	}
	
	return mockQuestions;
}

function getRandomArtist(correctArtist, index) {
	const randomArtists = [
		'Pablo Picasso', 'Claude Monet', 'Salvador Dalí', 'Van Gogh', 
		'Michelangelo', 'Da Vinci', 'Rembrandt', 'Renoir'
	];
	
	// Filter out the correct artist and return a random one
	const filtered = randomArtists.filter(artist => artist !== correctArtist);
	return filtered[index % filtered.length];
}

export async function createQuizSession(difficultyId) {
	const { data, error } = await supabase
		.from('quiz_sessions')
		.insert([{ difficulty_level_id: difficultyId }])
		.select()
		.single();
	
	if (error) {
		console.error('Error creating quiz session:', error);
		return null;
	}
	
	return data;
}

export async function saveQuizAnswer(sessionId, questionId, userAnswer, isCorrect, timeSpent = null) {
	const { data, error } = await supabase
		.from('quiz_answers')
		.insert([{
			session_id: sessionId,
			question_id: questionId,
			user_answer: userAnswer,
			is_correct: isCorrect,
			time_spent_seconds: timeSpent
		}]);
	
	if (error) {
		console.error('Error saving quiz answer:', error);
		return false;
	}
	
	return true;
}

export async function updateQuizSession(sessionId, score, completed = true) {
	const updates = {
		score,
		completed,
		completed_at: completed ? new Date().toISOString() : null
	};
	
	const { data, error } = await supabase
		.from('quiz_sessions')
		.update(updates)
		.eq('id', sessionId);
	
	if (error) {
		console.error('Error updating quiz session:', error);
		return false;
	}
	
	return true;
}

// Storage functions for artwork images
export function getImageUrl(imagePath) {
	if (!imagePath) return null;
	
	const { data } = supabase.storage
		.from('artwork-images')
		.getPublicUrl(imagePath);
	
	return data.publicUrl;
}

export async function uploadImage(file, fileName) {
	console.log('Uploading image:', fileName, 'Size:', file.size);
	
	// Use upsert option to overwrite existing files
	const { data, error } = await supabase.storage
		.from('artwork-images')
		.upload(fileName, file, {
			cacheControl: '3600',
			upsert: true // This will overwrite existing files
		});
	
	if (error) {
		console.error('Error uploading image:', error);
		throw new Error(`Upload failed: ${error.message}`);
	}
	
	console.log('Upload successful:', data);
	return data;
}

// Database setup functions
export async function createTables() {
	console.log('Creating database tables...');
	
	// Create tables using SQL
	const { data, error } = await supabase.rpc('exec_sql', {
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
			artist_id BIGINT REFERENCES artists(id),
			year_created INTEGER,
			image_path VARCHAR(500) NOT NULL,
			medium VARCHAR(100),
			dimensions VARCHAR(100),
			current_location VARCHAR(255),
			difficulty_level INTEGER REFERENCES difficulty_levels(id),
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
		`
	});
	
	if (error) {
		console.error('Error creating tables:', error);
		return false;
	}
	
	console.log('Tables created successfully:', data);
	return true;
}

export async function testSupabaseConnection() {
	console.log('Testing Supabase connection...');
	
	try {
		const { data, error } = await supabase
			.from('difficulty_levels')
			.select('*')
			.limit(1);
		
		if (error) {
			console.log('Connection test failed:', error);
			return false;
		}
		
		console.log('Connection test successful:', data);
		return true;
	} catch (err) {
		console.log('Connection error:', err);
		return false;
	}
}

// Helper function to get random questions for Mix difficulty
export async function getMixQuestions(limit = 10) {
	const { data, error } = await supabase
		.from('quiz_questions')
		.select(`
			*,
			artwork:artworks(
				id,
				title_en,
				title_ru,
				image_path,
				year_created,
				artist:artists(
					id,
					name_en,
					name_ru,
					birth_year,
					death_year
				)
			)
		`)
		.limit(limit * 2); // Get more to randomize
	
	if (error) {
		console.error('Error fetching mix questions:', error);
		return [];
	}
	
	// Shuffle and limit
	const shuffled = data.sort(() => 0.5 - Math.random());
	return shuffled.slice(0, limit).map(question => ({
		...question,
		question_text: `Who painted "${question.artwork.title_en}"?`,
		painting_title: question.artwork.title_en,
		painting_artist: question.artwork.artist.name_en,
		image_url: getImageUrl(question.artwork.image_path),
		correct_answer: question.correct_answer_en,
		option_a: question.option_a_en,
		option_b: question.option_b_en,
		option_c: question.option_c_en,
		explanation: question.explanation_en
	}));
}