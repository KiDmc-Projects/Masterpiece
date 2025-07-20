<script>
	import { onMount } from 'svelte';
	import { supabase, uploadImage, getImageUrl } from '$lib/supabase.js';
	
	let formData = {
		title_en: '',
		title_ru: '',
		artist_name_en: '',
		artist_name_ru: '',
		year_created: '',
		difficulty_level: 1,
		image_file: null
	};
	
	let uploading = false;
	let message = '';
	let existingArtworks = [];
	let dragActive = false;
	let csvFile = null;
	let csvUploading = false;
	let showBulkImport = false;
	let editingArtwork = null;
	let isAuthenticated = false;
	let passwordInput = '';
	let showPasswordError = false;
	
	const ADMIN_PASSWORD = '054864081';
	
	onMount(async () => {
		// Check if already authenticated (sessionStorage)
		if (typeof window !== 'undefined') {
			const savedAuth = sessionStorage.getItem('admin_authenticated');
			if (savedAuth === 'true') {
				isAuthenticated = true;
				loadExistingArtworks();
			}
		}
	});
	
	function checkPassword() {
		if (passwordInput === ADMIN_PASSWORD) {
			isAuthenticated = true;
			showPasswordError = false;
			if (typeof window !== 'undefined') {
				sessionStorage.setItem('admin_authenticated', 'true');
			}
			loadExistingArtworks();
		} else {
			showPasswordError = true;
			passwordInput = '';
		}
	}
	
	function handlePasswordKeyPress(event) {
		if (event.key === 'Enter') {
			checkPassword();
		}
	}
	
	function logout() {
		isAuthenticated = false;
		if (typeof window !== 'undefined') {
			sessionStorage.removeItem('admin_authenticated');
		}
	}
	
	async function loadExistingArtworks() {
		const { data, error } = await supabase
			.from('artworks')
			.select('*')
			.order('created_at', { ascending: false });
		
		if (!error && data) {
			existingArtworks = data;
		}
	}
	
	function handleFileSelect(event) {
		const file = event.target.files[0];
		if (file) {
			formData.image_file = file;
			// Auto-generate filename suggestion
			if (!formData.title_en) {
				const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
				formData.title_en = nameWithoutExt.replace(/[_-]/g, ' ');
			}
		}
	}
	
	function handleDrop(event) {
		event.preventDefault();
		dragActive = false;
		
		const files = event.dataTransfer.files;
		if (files.length > 0) {
			formData.image_file = files[0];
		}
	}
	
	function handleDragOver(event) {
		event.preventDefault();
		dragActive = true;
	}
	
	function handleDragLeave(event) {
		event.preventDefault();
		dragActive = false;
	}
	
	async function submitArtwork() {
		if (!formData.image_file || !formData.title_en || !formData.artist_name_en) {
			message = '❌ Please fill all required fields and select an image';
			return;
		}
		
		uploading = true;
		message = 'Uploading artwork...';
		
		try {
			// 1. Upload image to Supabase storage
			const difficultyFolder = getDifficultyFolder(formData.difficulty_level);
			const timestamp = Date.now();
			// Clean filename by removing special characters and accents
			const cleanArtist = formData.artist_name_en.toLowerCase()
				.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
				.replace(/[^a-z0-9\s]/g, '') // Remove special chars
				.replace(/\s+/g, '_'); // Replace spaces with underscores
			const cleanTitle = formData.title_en.toLowerCase()
				.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
				.replace(/[^a-z0-9\s]/g, '') // Remove special chars
				.replace(/\s+/g, '_'); // Replace spaces with underscores
			const fileName = `${cleanArtist}_${cleanTitle}_${timestamp}.jpg`;
			const imagePath = `${difficultyFolder}/${fileName}`;
			
			console.log('Attempting to upload:', imagePath);
			const uploadResult = await uploadImage(formData.image_file, imagePath);
			
			// 2. Insert artwork data into database (force new ID)
			// First get the highest ID and add 1
			const { data: maxIdData } = await supabase
				.from('artworks')
				.select('id')
				.order('id', { ascending: false })
				.limit(1);
			
			const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;
			console.log('Using ID:', nextId);
			
			const { data, error } = await supabase
				.from('artworks')
				.insert([{
					id: nextId,
					title_en: formData.title_en,
					title_ru: formData.title_ru || formData.title_en,
					artist_name_en: formData.artist_name_en,
					artist_name_ru: formData.artist_name_ru || formData.artist_name_en,
					year_created: parseInt(formData.year_created) || null,
					image_path: imagePath,
					difficulty_level: formData.difficulty_level
				}])
				.select();
			
			if (error) {
				throw new Error(error.message);
			}
			
			message = '✅ Artwork added successfully!';
			
			// Reset form
			formData = {
				title_en: '',
				title_ru: '',
				artist_name_en: '',
				artist_name_ru: '',
				year_created: '',
				difficulty_level: 1,
				image_file: null
			};
			
			// Reload existing artworks
			loadExistingArtworks();
			
		} catch (error) {
			message = `❌ Error: ${error.message}`;
		} finally {
			uploading = false;
		}
	}
	
	function getDifficultyFolder(level) {
		switch(parseInt(level)) {
			case 1: return 'neophyte';
			case 2: return 'artisan';
			case 3: return 'master';
			default: return 'neophyte';
		}
	}
	
	function editArtwork(artwork) {
		editingArtwork = { ...artwork };
		
		// Populate form with artwork data
		formData = {
			title_en: artwork.title_en,
			title_ru: artwork.title_ru,
			artist_name_en: artwork.artist_name_en,
			artist_name_ru: artwork.artist_name_ru,
			year_created: artwork.year_created,
			difficulty_level: artwork.difficulty_level,
			image_file: null
		};
		
		// Scroll to top
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
	
	function cancelEdit() {
		editingArtwork = null;
		// Reset form
		formData = {
			title_en: '',
			title_ru: '',
			artist_name_en: '',
			artist_name_ru: '',
			year_created: '',
			difficulty_level: 1,
			image_file: null
		};
	}
	
	async function updateArtwork() {
		if (!editingArtwork) return;
		
		uploading = true;
		message = 'Updating artwork...';
		
		try {
			let imagePath = editingArtwork.image_path;
			
			// If new image is uploaded, handle the upload
			if (formData.image_file) {
				const difficultyFolder = getDifficultyFolder(formData.difficulty_level);
				// Clean filename by removing special characters and accents
				const cleanArtist = formData.artist_name_en.toLowerCase()
					.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
					.replace(/[^a-z0-9\s]/g, '') // Remove special chars
					.replace(/\s+/g, '_'); // Replace spaces with underscores
				const cleanTitle = formData.title_en.toLowerCase()
					.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
					.replace(/[^a-z0-9\s]/g, '') // Remove special chars
					.replace(/\s+/g, '_'); // Replace spaces with underscores
				const fileName = `${cleanArtist}_${cleanTitle}.jpg`;
				imagePath = `${difficultyFolder}/${fileName}`;
				
				const uploadResult = await uploadImage(formData.image_file, imagePath);
				if (!uploadResult) {
					throw new Error('Failed to upload new image');
				}
			}
			
			const { error } = await supabase
				.from('artworks')
				.update({
					title_en: formData.title_en,
					title_ru: formData.title_ru,
					artist_name_en: formData.artist_name_en,
					artist_name_ru: formData.artist_name_ru,
					year_created: parseInt(formData.year_created) || null,
					image_path: imagePath,
					difficulty_level: formData.difficulty_level
				})
				.eq('id', editingArtwork.id);
			
			if (error) {
				throw new Error(error.message);
			}
			
			message = '✅ Artwork updated successfully!';
			editingArtwork = null;
			loadExistingArtworks();
			
			// Reset form
			formData = {
				title_en: '',
				title_ru: '',
				artist_name_en: '',
				artist_name_ru: '',
				year_created: '',
				difficulty_level: 1,
				image_file: null
			};
			
		} catch (error) {
			message = `❌ Error updating: ${error.message}`;
		} finally {
			uploading = false;
		}
	}
	
	async function deleteArtwork(artwork) {
		if (!confirm(`Delete "${artwork.title_en}"?`)) return;
		
		const { error } = await supabase
			.from('artworks')
			.delete()
			.eq('id', artwork.id);
		
		if (!error) {
			loadExistingArtworks();
			message = '✅ Artwork deleted';
		} else {
			message = `❌ Error deleting: ${error.message}`;
		}
	}
	
	function handleCSVSelect(event) {
		csvFile = event.target.files[0];
	}
	
	async function importFromCSV() {
		if (!csvFile) {
			message = '❌ Please select a CSV file';
			return;
		}
		
		csvUploading = true;
		message = 'Processing CSV file...';
		
		try {
			const text = await csvFile.text();
			const lines = text.split('\n').filter(line => line.trim());
			const headers = lines[0].split(',').map(h => h.trim());
			
			// Expected headers: title_en,title_ru,artist_name_en,artist_name_ru,year_created,image_filename,difficulty_level
			const requiredHeaders = ['title_en', 'artist_name_en', 'image_filename', 'difficulty_level'];
			const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
			
			if (missingHeaders.length > 0) {
				throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
			}
			
			let successCount = 0;
			let errorCount = 0;
			
			for (let i = 1; i < lines.length; i++) {
				const values = lines[i].split(',').map(v => v.trim());
				const row = {};
				
				headers.forEach((header, index) => {
					row[header] = values[index] || '';
				});
				
				try {
					const difficultyFolder = getDifficultyFolder(parseInt(row.difficulty_level));
					const imagePath = `${difficultyFolder}/${row.image_filename}`;
					
					const { error } = await supabase
						.from('artworks')
						.insert([{
							title_en: row.title_en,
							title_ru: row.title_ru || row.title_en,
							artist_name_en: row.artist_name_en,
							artist_name_ru: row.artist_name_ru || row.artist_name_en,
							year_created: parseInt(row.year_created) || null,
							image_path: imagePath,
							difficulty_level: parseInt(row.difficulty_level)
						}]);
					
					if (error) {
						console.error(`Row ${i} error:`, error);
						errorCount++;
					} else {
						successCount++;
					}
				} catch (err) {
					console.error(`Row ${i} error:`, err);
					errorCount++;
				}
			}
			
			message = `✅ CSV Import complete: ${successCount} success, ${errorCount} errors`;
			loadExistingArtworks();
			csvFile = null;
			
		} catch (error) {
			message = `❌ CSV Error: ${error.message}`;
		} finally {
			csvUploading = false;
		}
	}
</script>

<svelte:head>
	<title>Admin - Artwork Management</title>
</svelte:head>

<div class="min-h-screen p-4 bg-background">
	{#if !isAuthenticated}
		<!-- Password Protection Screen -->
		<div class="min-h-screen flex items-center justify-center">
			<div class="w-full max-w-md mx-auto">
				<div class="card text-center">
					<div class="mb-6">
						<h1 class="text-3xl font-bold text-text-primary mb-2">🔒 Admin Access</h1>
						<p class="text-gray-600">Enter password to access artwork management</p>
					</div>
					
					{#if showPasswordError}
						<div class="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
							❌ Incorrect password. Please try again.
						</div>
					{/if}
					
					<div class="mb-6">
						<input 
							type="password" 
							bind:value={passwordInput}
							on:keypress={handlePasswordKeyPress}
							placeholder="Enter admin password"
							class="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-primary-orange focus:outline-none transition-colors"
							autofocus
						/>
					</div>
					
					<button 
						class="inline-flex items-center justify-center space-x-2 w-full px-6 py-4 bg-primary-orange hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 font-semibold"
						on:click={checkPassword}
					>
						<span>🔓</span>
						<span>Access Admin Panel</span>
					</button>
					
					<div class="mt-6">
						<a href="/" class="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
							<span>←</span>
							<span>Back to Quiz</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Admin Panel Content -->
		<div class="max-w-6xl mx-auto">
			<div class="flex items-center justify-between mb-8">
				<h1 class="text-3xl font-bold text-text-primary">Artwork Management</h1>
				<div class="flex space-x-3">
					<button 
						class="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 font-medium"
						on:click={logout}
					>
						<span>🚪</span>
						<span>Logout</span>
					</button>
					<a href="/" class="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium">
						<span>←</span>
						<span>Back to Quiz</span>
					</a>
				</div>
			</div>

		<!-- Add/Edit New Artwork Form (Main Focus) -->
		<div class="max-w-4xl mx-auto mb-8">
			<div class="card">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-semibold">
						{editingArtwork ? `Edit: ${editingArtwork.title_en}` : 'Add New Artwork'}
					</h2>
					
					<div class="flex space-x-3">
						{#if editingArtwork}
							<button 
								class="inline-flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 font-medium text-sm"
								on:click={cancelEdit}
							>
								<span>✕</span>
								<span>Cancel Edit</span>
							</button>
						{/if}
						<button 
							class="inline-flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 font-medium text-sm"
							on:click={() => showBulkImport = !showBulkImport}
						>
							<span>{showBulkImport ? '📤' : '📁'}</span>
							<span>{showBulkImport ? 'Hide' : 'Show'} Bulk Import</span>
						</button>
					</div>
				</div>
				
				{#if message}
					<div class="mb-6 p-4 rounded-lg {message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
						{message}
					</div>
				{/if}
				
				<!-- Image Upload -->
				<div class="mb-6">
					<label class="block text-sm font-semibold text-text-primary mb-2">
						Artwork Image *
					</label>
					
					<div 
						class="border-2 border-dashed rounded-xl p-8 text-center transition-colors {dragActive ? 'border-primary-orange bg-orange-50' : 'border-gray-300'}"
						on:drop={handleDrop}
						on:dragover={handleDragOver}
						on:dragleave={handleDragLeave}
					>
						{#if formData.image_file}
							<div class="text-green-600 mb-2">✅ {formData.image_file.name}</div>
							<button 
								class="text-sm text-blue-600 hover:underline"
								on:click={() => formData.image_file = null}
							>
								Remove file
							</button>
						{:else}
							<div class="text-gray-500 mb-4">
								<p class="text-lg">📸 Drag & drop image here</p>
								<p class="text-sm">or click to browse</p>
							</div>
							<input 
								type="file" 
								accept="image/*" 
								on:change={handleFileSelect}
								class="hidden"
								id="imageUpload"
							/>
							<label for="imageUpload" class="inline-flex items-center space-x-2 px-6 py-3 bg-primary-orange hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer">
								<span>🖼️</span>
								<span>Choose Image</span>
							</label>
						{/if}
					</div>
				</div>
				
				<!-- Artwork Details -->
				<div class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-semibold text-text-primary mb-1">
								Artwork Title (English) *
							</label>
							<input 
								type="text" 
								bind:value={formData.title_en}
								placeholder="The Starry Night"
								class="w-full p-3 border rounded-lg"
							/>
						</div>
						
						<div>
							<label class="block text-sm font-semibold text-text-primary mb-1">
								Artwork Title (Russian)
							</label>
							<input 
								type="text" 
								bind:value={formData.title_ru}
								placeholder="Звёздная ночь"
								class="w-full p-3 border rounded-lg"
							/>
						</div>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-semibold text-text-primary mb-1">
								Artist Name (English) *
							</label>
							<input 
								type="text" 
								bind:value={formData.artist_name_en}
								placeholder="Vincent van Gogh"
								class="w-full p-3 border rounded-lg"
							/>
						</div>
						
						<div>
							<label class="block text-sm font-semibold text-text-primary mb-1">
								Artist Name (Russian)
							</label>
							<input 
								type="text" 
								bind:value={formData.artist_name_ru}
								placeholder="Винсент ван Гог"
								class="w-full p-3 border rounded-lg"
							/>
						</div>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-semibold text-text-primary mb-1">
								Year Created
							</label>
							<input 
								type="number" 
								bind:value={formData.year_created}
								placeholder="1889"
								class="w-full p-3 border rounded-lg"
							/>
						</div>
						
						<div>
							<label class="block text-sm font-semibold text-text-primary mb-1">
								Difficulty Level *
							</label>
							<select bind:value={formData.difficulty_level} class="w-full p-3 border rounded-lg">
								<option value={1}>🌱 Neophyte (Easy)</option>
								<option value={2}>🎨 Artisan (Medium)</option>
								<option value={3}>👑 Master (Hard)</option>
							</select>
						</div>
					</div>
				</div>
				
				<button 
					class="inline-flex items-center justify-center space-x-2 w-full mt-6 px-6 py-4 bg-primary-orange hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-semibold text-lg"
					on:click={editingArtwork ? updateArtwork : submitArtwork}
					disabled={uploading}
				>
					{#if uploading}
						<span class="animate-spin">⏳</span>
						<span>{editingArtwork ? 'Updating...' : 'Uploading...'}</span>
					{:else}
						<span>{editingArtwork ? '✏️' : '➕'}</span>
						<span>{editingArtwork ? 'Update Artwork' : 'Add Artwork'}</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Bulk Import (Collapsible) -->
		{#if showBulkImport}
			<div class="max-w-2xl mx-auto mb-8">
				<div class="card">
					<h2 class="text-xl font-semibold mb-6">Bulk Import (CSV)</h2>
					
					<div class="mb-4">
						<label class="block text-sm font-semibold text-text-primary mb-2">
							CSV File
						</label>
						<input 
							type="file" 
							accept=".csv" 
							on:change={handleCSVSelect}
							class="w-full p-3 border rounded-lg"
						/>
						{#if csvFile}
							<div class="text-sm text-green-600 mt-1">✅ {csvFile.name}</div>
						{/if}
					</div>
					
					<button 
						class="inline-flex items-center justify-center space-x-2 w-full mb-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
						on:click={importFromCSV}
						disabled={csvUploading || !csvFile}
					>
						{#if csvUploading}
							<span class="animate-spin">⏳</span>
							<span>Importing...</span>
						{:else}
							<span>📊</span>
							<span>Import CSV</span>
						{/if}
					</button>
					
					<div class="bg-gray-50 rounded-lg p-4">
						<h4 class="font-semibold text-sm mb-2">CSV Format Required:</h4>
						<pre class="text-xs bg-white p-2 rounded border overflow-x-auto">title_en,title_ru,artist_name_en,artist_name_ru,year_created,image_filename,difficulty_level
The Starry Night,Звёздная ночь,Vincent van Gogh,Винсент ван Гог,1889,starry_night.jpg,1</pre>
						
						<div class="mt-3">
							<h5 class="font-semibold text-xs mb-1">Instructions:</h5>
							<ul class="text-xs text-gray-600 space-y-1">
								<li>• Upload images to Supabase storage first</li>
								<li>• image_filename should match uploaded file</li>
								<li>• difficulty_level: 1=Neophyte, 2=Artisan, 3=Master</li>
								<li>• Russian fields optional (will use English)</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Existing Artworks (Bottom of page) -->
		<div class="max-w-6xl mx-auto">
			<div class="card">
				<h2 class="text-xl font-semibold mb-6">Existing Artworks ({existingArtworks.length})</h2>
				
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each existingArtworks as artwork}
						<div class="bg-gray-50 rounded-lg p-4 {editingArtwork && editingArtwork.id === artwork.id ? 'ring-2 ring-primary-orange' : ''}">
							<img 
								src={getImageUrl(artwork.image_path)} 
								alt={artwork.title_en}
								class="w-full h-32 object-cover rounded mb-3"
							/>
							<div class="mb-3">
								<div class="font-semibold text-sm">{artwork.title_en}</div>
								<div class="text-xs text-gray-600">{artwork.artist_name_en}</div>
								<div class="text-xs text-gray-500">
									{artwork.year_created} • Level {artwork.difficulty_level}
								</div>
							</div>
							<div class="flex space-x-2">
								<button 
									class="inline-flex items-center justify-center space-x-1 flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 font-medium text-xs"
									on:click={() => editArtwork(artwork)}
								>
									<span>✏️</span>
									<span>Edit</span>
								</button>
								<button 
									class="inline-flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 font-medium text-xs"
									on:click={() => deleteArtwork(artwork)}
								>
									<span>🗑️</span>
									<span>Delete</span>
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
		
		<!-- Quick Tips -->
		<div class="mt-8 bg-blue-50 rounded-xl p-6">
			<h3 class="font-semibold text-blue-900 mb-3">📝 Quick Tips:</h3>
			<ul class="text-blue-800 text-sm space-y-1">
				<li>• <strong>Image formats:</strong> JPG, PNG preferred</li>
				<li>• <strong>Image size:</strong> 800x1200px (portrait) or 1200x800px (landscape)</li>
				<li>• <strong>File size:</strong> Keep under 500KB for fast loading</li>
				<li>• <strong>Russian names:</strong> Optional, will use English if not provided</li>
				<li>• <strong>Difficulty levels:</strong> Neophyte = Famous works, Master = Lesser known</li>
			</ul>
		</div>
		</div>
	{/if}
</div>