const isDelete = document.getElementById("isDelete");
let isDeleteMode = false;

// cek delete button
isDelete.addEventListener("click", () => {
    isDeleteMode = !isDeleteMode;

    document.body.classList.toggle("delete", isDeleteMode);
    if (isDeleteMode) {
        isDelete.textContent = "Done";
        isDelete.classList.remove("btn-delete");
        isDelete.classList.add("btn-done");
    } else {
        isDelete.textContent = "Delete";
        isDelete.classList.remove("btn-done");
        isDelete.classList.add("btn-delete");
    }
});

// load anime dari localStorage
function loadAnime() {
    const animeList = JSON.parse(localStorage.getItem("animeList")) || [];

    document.querySelectorAll(".tier-content").forEach(t => t.innerHTML = "");

    animeList.forEach(anime => {
        const container = document.getElementById(`tier-${anime.tier}`);
        if (!container) return;

        container.innerHTML += `
            <div class="anime-card" draggable="true" data-id="${anime.id}">
                <img src="${anime.poster}">
                <button onclick="deleteAnime(${anime.id})">✕</button>
            </div>
            `;
    });

    enableDrag();
}

// drag anime
function enableDrag() {
    document.querySelectorAll(".tier-content").forEach(tier => {
        new Sortable(tier, {
            group: "tiers",         
            animation: 150,
            ghostClass: "dragging",
            filter: () => isDeleteMode, 
            onEnd: saveOrder
        });
    });
}

function saveOrder() {
    const oldList = JSON.parse(localStorage.getItem("animeList")) || [];
    const newList = [];

    document.querySelectorAll(".tier-content").forEach(tier => {
        const tierName = tier.id.replace("tier-", "");

        tier.querySelectorAll(".anime-card").forEach(card => {
            const anime = oldList.find(a => a.id == card.dataset.id);
            if (anime) {
                newList.push({ ...anime, tier: tierName });
            }
        });
    });

    localStorage.setItem("animeList", JSON.stringify(newList));
}

// delete anime
function deleteAnime(id) {
    let animeList = JSON.parse(localStorage.getItem("animeList")) || [];
    animeList = animeList.filter(a => a.id !== id);
    localStorage.setItem("animeList", JSON.stringify(animeList));
    loadAnime();
}

loadAnime();