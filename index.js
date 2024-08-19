document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quizForm');
  let excelData;

  // Fetch the Excel file
  fetch('Base de datos - TPO CAS.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => readExcelData(data))
    .then(data => {
      excelData = data;
    })
    .catch(error => {
      console.error('Error fetching Excel file:', error);
    });

  form.addEventListener('submit', handleFormSubmit);

  const recommendedMoviesHistory = {};

  function readExcelData(data) {
    return new Promise((resolve, reject) => {
      try {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    });
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const genre = document.getElementById('genre').value;

    getRecommendedMovie(age, genre)
      .then(recommendedMovie => {
        if (recommendedMovie) {
          updateRecommendationCard(recommendedMovie);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  async function getRecommendedMovie(age, genre) {
    try {
      if (!excelData) {
        throw new Error('Excel data is not loaded.');
      }

      const movies = excelData.slice(1).map(row => ({
        title: row[0],
        director: row[1],
        releaseYear: row[2],
        genre: row[3],
        rating: row[4],
        age: row[5],
        duration: row[6],
        summary: row[7]
      }));

      const filteredMovies = movies.filter(movie => movie.age == age && movie.genre.toLowerCase() === genre.toLowerCase());

      if (!recommendedMoviesHistory[`${age}-${genre}`]) {
        recommendedMoviesHistory[`${age}-${genre}`] = [];
      }

      const newRecommendation = filteredMovies.find(movie => !recommendedMoviesHistory[`${age}-${genre}`].includes(movie.title));

      if (newRecommendation) {
        recommendedMoviesHistory[`${age}-${genre}`].push(newRecommendation.title);
      }

      return newRecommendation;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  function updateRecommendationCard(movie) {
    const recommendationCard = document.getElementById('recommendation');
    recommendationCard.style.display = 'block';
    recommendationCard.innerHTML = `
      <div class="container text-center">
        <div class="row justify-content-center">
          <div class="col">
            <div class="card movie" style="width: 100%;">
              <img src="${movie.posterUrl || 'default-poster.png'}" class="card-image" alt="${movie.title}" style="height: 230px;">
              <div class="card-body">
                <p class="card-rating">IMDb: ${movie.rating}/10</p>
                <p class="card-age">${movie.age}</p>
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-director">Directed by ${movie.director}</p>
                <p class="card-duration">${movie.duration}</p>
                <p class="card-summary">${movie.summary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById('recommendation').style.display = 'none';
});
