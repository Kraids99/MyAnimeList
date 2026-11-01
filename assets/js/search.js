import { showToast } from "./toast.js";
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const result = document.getElementById("result");

// key enter
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

// search anime
// searchBtn.addEventListener("click", async () => {
//     const keyword = searchInput.value.trim();

//     if (!keyword) return;

//     result.innerHTML = "Loading...";

//     const res = await fetch(`https://api.jikan.moe/v4/anime?q=${keyword}`);
//     const data = await res.json();

//     result.innerHTML = "";

//     if (data.data.length === 0) {
//         result.innerHTML = `<p class="not-found">Anime not found 🥲</p>`;
//         return;
//     }

//     const animeList = JSON.parse(localStorage.getItem("animeList")) || [];

//     data.data.forEach(anime => {
//         const animeData = {
//             id: anime.mal_id,
//             title: anime.title,
//             poster: anime.images.jpg.image_url
//         };

//         const isAdded = animeList.some(a => a.id === animeData.id);

//         result.innerHTML += `
//             <div class="search-card">
//                 <img src="${animeData.poster}">
//                 <p>${animeData.title}</p>
//                 <div class="buttons">
//                     <button class="btn-add ${isAdded ? 'added' : ''}"
//                     ${isAdded ? 'disabled' : ''}
//                     onclick='addAnime(${JSON.stringify(animeData)})'>
//                     ${isAdded ? 'Added' : '+ Add'}
//                     </button>
//                 </div>
//             </div>
//             `;
//     });
// });

// search anime
searchBtn.addEventListener("click", async () => {
    const keyword = searchInput.value.trim();

    if (!keyword) return;

    result.innerHTML = "Loading...";

    // Query GraphQL untuk mencari anime di AniList
    const query = `
        query ($search: String) {
            Page (perPage: 21) {
                media (search: $search, type: ANIME) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    coverImage {
                        large
                    }
                }
            }
        }
    `;

    const variables = {
        search: keyword
    };

    try {
        const res = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });

        const json = await res.json();
        const animeListLocal = JSON.parse(localStorage.getItem("animeList")) || [];

        result.innerHTML = "";

        // Struktur data AniList ada di json.data.Page.media
        const animeDataList = json.data?.Page?.media || [];

        if (animeDataList.length === 0) {
            result.innerHTML = `<p class="not-found">Anime not found 🥲</p>`;
            return;
        }

        animeDataList.forEach(anime => {
            // Mengambil judul prioritas (bahasa Inggris atau Romaji)
            const title = anime.title.english || anime.title.romaji || anime.title.native;
            
            const animeData = {
                id: anime.id,
                title: title,
                poster: anime.coverImage.large
            };

            const isAdded = animeListLocal.some(a => a.id === animeData.id);

            result.innerHTML += `
                <div class="search-card">
                    <img src="${animeData.poster}">
                    <p>${animeData.title}</p>
                    <div class="buttons">
                        <button class="btn-add ${isAdded ? 'added' : ''}"
                        ${isAdded ? 'disabled' : ''}
                        onclick='addAnime(${JSON.stringify(animeData)})'>
                        ${isAdded ? 'Added' : '+ Add'}
                        </button>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        result.innerHTML = `<p class="not-found">Terjadi kesalahan saat mengambil data.</p>`;
        console.error(error);
    }
});

// add anime ke localStorage
function addAnime(anime) {
    const animeList = JSON.parse(localStorage.getItem("animeList")) || [];

    if (animeList.some(a => a.id === anime.id)) return;

    animeList.push({ ...anime, tier: "HAVENT_WATCHED" });

    localStorage.setItem("animeList", JSON.stringify(animeList));
    showToast("Added!", "success");

    // refesh
    searchBtn.click();
}

window.addAnime = addAnime;