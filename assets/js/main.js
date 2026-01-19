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
    const cards = document.querySelectorAll(".anime-card");
    const tiers = document.querySelectorAll(".tier-content");

    cards.forEach(card => {
        card.addEventListener("dragstart", e => {
            e.dataTransfer.setData("id", card.dataset.id);
        });
    });

    tiers.forEach(tier => {
        tier.addEventListener("dragover", e => e.preventDefault());

        tier.addEventListener("drop", e => {
            const id = e.dataTransfer.getData("id");
            const newTier = tier.id.replace("tier-", "");

            let animeList = JSON.parse(localStorage.getItem("animeList")) || [];
            animeList = animeList.map(a =>
                a.id == id ? { ...a, tier: newTier } : a
            );

            localStorage.setItem("animeList", JSON.stringify(animeList));
            loadAnime();
        });
    });
}

// delete anime
function deleteAnime(id) {
    let animeList = JSON.parse(localStorage.getItem("animeList")) || [];
    animeList = animeList.filter(a => a.id !== id);
    localStorage.setItem("animeList", JSON.stringify(animeList));
    loadAnime();
}

loadAnime();