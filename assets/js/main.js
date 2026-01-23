import { showToast } from "./toast.js";
const isDelete = document.getElementById("isDelete");
const isExport = document.getElementById("isExport");
const isImport = document.getElementById("isImport");
const isSearch = document.getElementById("isSearch");
let sortables = [];
let isDeleteMode = false;

// cek delete button
isDelete.addEventListener("click", () => {
    isDeleteMode = !isDeleteMode;

    document.body.classList.toggle("delete", isDeleteMode);

    isImport.disabled = isDeleteMode;
    isExport.disabled = isDeleteMode;
    isSearch.disabled = isDeleteMode;

    sortables.forEach(s =>
        s.option("disabled", isDeleteMode)
    );
    
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

// Import
isImport.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);

            if (!Array.isArray(data)) {
                showToast("Invalid file format", "error");
                return;
            }

            localStorage.setItem("animeList", JSON.stringify(data));
            loadAnime();

            showToast("Import successful!", "success");
        } catch {
            showToast("Invalid JSON file", "error");
        }
    };

    reader.readAsText(file);

    e.target.value = "";
});

// Export 
isExport.addEventListener("click", () => {
    const animeList = JSON.parse(localStorage.getItem("animeList")) || [];

    if (animeList.length === 0) {
        showToast("No data to export!", "error");
        return;
    }

    const blob = new Blob(
        [JSON.stringify(animeList, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "my-anime-tier-list.json";
    a.click();

    URL.revokeObjectURL(url);
    showToast("Export successful!", "success");
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
    sortables.forEach(s => s.destroy());
    sortables = [];
    document.querySelectorAll(".tier-content").forEach(tier => {
        const sortable = new Sortable(tier, {
            group: "tiers",
            animation: 150,
            ghostClass: "dragging",
            disabled: isDeleteMode,
            onEnd: saveOrder
        });
        sortables.push(sortable);
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
    showToast("Deleted!", "error");
}

window.deleteAnime = deleteAnime;

loadAnime();