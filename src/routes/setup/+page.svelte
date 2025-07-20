<script>
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase.js';
	
	let status = 'Testing connection...';
	let logs = [];
	
	function addLog(message) {
		logs = [...logs, `${new Date().toLocaleTimeString()}: ${message}`];
		console.log(message);
	}
	
	async function testConnection() {
		try {
			addLog('Testing Supabase connection...');
			
			// Try to query any table to test connection
			const { data, error } = await supabase
				.from('difficulty_levels')
				.select('*')
				.limit(1);
			
			if (error) {
				addLog(`Connection test failed: ${error.message}`);
				return false;
			}
			
			addLog('✅ Connection successful!');
			addLog(`Found ${data?.length || 0} difficulty levels`);
			return true;
		} catch (err) {
			addLog(`❌ Connection error: ${err.message}`);
			return false;
		}
	}
	
	async function createTablesManually() {
		addLog('Creating tables manually...');
		
		try {
			// Test if we can create a simple table
			const { data, error } = await supabase
				.from('test_table')
				.select('*')
				.limit(1);
			
			addLog(`Test query result - Error: ${error?.message || 'none'}`);
			
			if (error && error.message.includes('does not exist')) {
				addLog('Tables need to be created. Please run the SQL manually in Supabase dashboard.');
				status = 'Tables missing - create them manually';
			} else {
				addLog('Some tables exist already');
				status = 'Tables found';
			}
			
		} catch (err) {
			addLog(`Error: ${err.message}`);
		}
	}
	
	async function fixIDSequence() {
		addLog('Fixing ID sequence...');
		
		try {
			// Get the current max ID
			const { data: maxData, error: maxError } = await supabase
				.from('artworks')
				.select('id')
				.order('id', { ascending: false })
				.limit(1);
			
			if (maxError) {
				addLog(`❌ Error getting max ID: ${maxError.message}`);
				return;
			}
			
			const maxId = maxData && maxData.length > 0 ? maxData[0].id : 0;
			addLog(`Current max ID: ${maxId}`);
			
			// Reset the sequence to start after the max ID
			const { data, error } = await supabase.rpc('exec_sql', {
				sql: `SELECT setval('artworks_id_seq', ${maxId + 1});`
			});
			
			if (error) {
				addLog(`❌ Error fixing sequence: ${error.message}`);
			} else {
				addLog(`✅ ID sequence fixed - next ID will be ${maxId + 1}`);
			}
			
		} catch (err) {
			addLog(`❌ Error: ${err.message}`);
		}
	}
	
	async function checkArtworksData() {
		addLog('Checking artworks data...');
		
		try {
			// Check all artworks
			const { data: allArtworks, error: allError } = await supabase
				.from('artworks')
				.select('*');
			
			if (allError) {
				addLog(`❌ Error querying artworks: ${allError.message}`);
				return;
			}
			
			addLog(`✅ Found ${allArtworks?.length || 0} total artworks`);
			
			if (allArtworks && allArtworks.length > 0) {
				addLog('First artwork:');
				addLog(JSON.stringify(allArtworks[0], null, 2));
				
				// Check by difficulty levels
				for (let diff = 1; diff <= 3; diff++) {
					const { data: diffData, error: diffError } = await supabase
						.from('artworks')
						.select('*')
						.eq('difficulty_level', diff);
					
					if (diffError) {
						addLog(`❌ Error for difficulty ${diff}: ${diffError.message}`);
					} else {
						addLog(`Difficulty ${diff}: ${diffData?.length || 0} artworks`);
						if (diffData && diffData.length > 0) {
							addLog(`  - ${diffData.map(a => a.title_en).join(', ')}`);
						}
					}
				}
			} else {
				addLog('❌ No artworks found in database');
			}
			
		} catch (err) {
			addLog(`❌ Error: ${err.message}`);
		}
	}
	
	onMount(async () => {
		await testConnection();
		await createTablesManually();
	});
</script>

<svelte:head>
	<title>Database Setup - Masterpiece Quiz</title>
</svelte:head>

<div class="min-h-screen p-8 bg-background">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold text-text-primary mb-8">Database Setup & Testing</h1>
		
		<div class="bg-white rounded-xl p-6 mb-6">
			<h2 class="text-xl font-semibold mb-4">Status: {status}</h2>
			
			<div class="space-y-3 mb-6">
				<button 
					class="btn-primary mr-3"
					on:click={testConnection}
				>
					Test Connection
				</button>
				
				<button 
					class="btn-secondary mr-3"
					on:click={createTablesManually}
				>
					Check Tables
				</button>
				
				<button 
					class="btn-secondary"
					on:click={checkArtworksData}
				>
					Check Artworks Data
				</button>
			</div>
		</div>
		
		<div class="bg-gray-100 rounded-xl p-6">
			<h3 class="font-semibold mb-3">Debug Logs:</h3>
			<div class="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
				{#each logs as log}
					<div class="text-gray-700">{log}</div>
				{/each}
			</div>
		</div>
		
		<div class="mt-6 bg-blue-50 rounded-xl p-6">
			<h3 class="font-semibold text-blue-900 mb-3">Manual Setup Instructions:</h3>
			<p class="text-blue-800 mb-3">If automatic setup fails, go to your Supabase Dashboard → SQL Editor and run:</p>
			<pre class="bg-blue-100 p-3 rounded text-xs overflow-x-auto text-blue-900">
CREATE TABLE difficulty_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

INSERT INTO difficulty_levels (id, name, description) VALUES
(1, 'Neophyte', 'Perfect for art beginners'),
(2, 'Artisan', 'For art enthusiasts'),
(3, 'Master', 'Challenge for art experts'),
(4, 'Mix', 'Questions from all levels');
			</pre>
		</div>
		
		<div class="mt-4 text-center">
			<a href="/" class="btn-secondary">← Back to Quiz</a>
		</div>
	</div>
</div>