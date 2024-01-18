// Declare global variables
let myParam // User parameter
let currentPage = 1 // Current page number
let reposPerPage = 10 // Default repositories per page

// Function to display repositories
function displayRepos(repos) {
	// Get repository list container
	const repoListContainer = document.getElementById('repoList')
	repoListContainer.innerHTML = '' // Clear existing repo list

	// Check if repositories are available
	if (!repos || repos.length === 0) {
		console.warn('No repositories found for the user.')
		return
	}

	// Calculate start and end indices for pagination
	const startIndex = (currentPage - 1) * reposPerPage
	const endIndex = startIndex + reposPerPage
	const paginatedRepos = repos.slice(startIndex, endIndex)

	// Iterate through paginated repositories
	for (const repo of paginatedRepos) {
		// Create repository card element
		const repoCard = document.createElement('div')
		repoCard.className =
			'bg-gray-800 p-4 rounded shadow transition transform hover:scale-105'
		repoCard.innerHTML = `
            <h2 class="text-xl font-bold mb-2">${repo.name}</h2>
            <p class="text-gray-400 mb-2">${repo.description || 'No description'}</p>
            <div class="flex">
                <span class="bg-gray-300 text-gray-800 font-semibold px-2 py-1 rounded mr-2">
                    ${repo.language || 'Unknown'}
                </span>
            </div>
        `
		repoListContainer.appendChild(repoCard)
	}

	// Update pagination
	updatePagination(repos.length)
}

// Function to update pagination buttons
function updatePagination(totalRepos) {
	const totalPages = Math.ceil(totalRepos / reposPerPage)
	const paginationContainer = document.getElementById('paginationContainer')
	paginationContainer.innerHTML = ''

	// Create buttons for each page
	for (let i = 1; i <= totalPages; i++) {
		const pageButton = document.createElement('button')
		pageButton.className = `px-3 py-2 ${
			currentPage === i ? 'bg-gray-700' : 'bg-gray-500'
		} text-white rounded-full mx-1 focus:outline-none`
		pageButton.innerText = i

		// Add event listener to each page button
		pageButton.addEventListener('click', () => {
			currentPage = i
			const githubReposData = JSON.parse(localStorage.getItem(`${myParam}Repos`))
			displayRepos(githubReposData)
		})

		paginationContainer.appendChild(pageButton)
	}
}

// Function to change repositories per page
function changeReposPerPage(value) {
	reposPerPage = parseInt(value, 10)
	const githubReposData = JSON.parse(localStorage.getItem(`${myParam}Repos`))
	displayRepos(githubReposData)
}

// Function to filter repositories by name
function filterReposByName(name, repos) {
	const filteredRepos = repos.filter(repo =>
		repo.name.toLowerCase().includes(name.toLowerCase())
	)
	displayRepos(filteredRepos)
}

// Function to fetch user data from GitHub API
function fetchUserData(username) {
	const apiUrl = `https://api.github.com/users/${username}`
	return fetch(apiUrl)
		.then(response => response.json())
		.catch(error => {
			console.error('Error fetching user data:', error)
			return null
		})
}

// Event listener when DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
	// Get username parameter from URL
	const urlParams = new URLSearchParams(window.location.search)
	myParam = urlParams.get('user') // Assign value to myParam

	// Check if username is available
	if (!myParam) {
		console.error('Username not found in the URL.')
		return
	}

	// Show loading indicators
	document.getElementById('followers').innerText = 'Loading...'
	document.getElementById('following').innerText = 'Loading...'
	document.getElementById('publicRepos').innerText = 'Loading...'

	// Fetch user data and repositories
	Promise.all([fetchUserData(myParam), fetchUserData(`${myParam}/repos`)])
		.then(([userData, reposData]) => {
			// Populate user information
			document.getElementById('userProfilePicture').src =
				userData?.avatar_url || 'placeholder_image_url'
			document.getElementById('username').innerText = userData?.login || 'Username'
			document.getElementById('userBio').innerText = userData?.bio || 'No bio available'
			document.getElementById('githubProfileLink').href = userData?.html_url || '#'

			// Fetch and display additional user information
			document.getElementById('followers').innerText = userData?.followers || 'Loading...'
			document.getElementById('following').innerText = userData?.following || 'Loading...'
			document.getElementById('publicRepos').innerText =
				userData?.public_repos || 'Loading...'

			// Save repositories data to local storage
			localStorage.setItem(`${myParam}Repos`, JSON.stringify(reposData))

			// Display repos based on the default repos per page value
			displayRepos(reposData)
		})
		.catch(error => {
			console.error('Error fetching user data:', error)
		})
})
// Function to handle input changes in the repository name field
function handleRepoNameInput(value) {
	const githubReposData = JSON.parse(localStorage.getItem(`${myParam}Repos`))
	filterReposByName(value, githubReposData)
}
