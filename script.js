/**
 * MoutonPro PRO MAX - Core Logic
 */

// Sheep Data (Mini Database)
const sheepList = [
    {
        id: 1,
        name: "Bélier Ladoum Royal",
        price: 850000,
        image: "ladoum.png",
        weight: "115 kg",
        origin: "Sénégal (Mbour)",
        age: "24 mois",
        status: "Disponible",
        category: "Premium"
    },
    {
        id: 2,
        name: "Mouton Touabir Pro",
        price: 250000,
        image: "touabir.png",
        weight: "85 kg",
        origin: "Mali",
        age: "18 mois",
        status: "Disponible",
        category: "Standard"
    },
    {
        id: 3,
        name: "Agneau Peul-Peul",
        price: 120000,
        image: "hero.png", // Fallback to hero for variety
        weight: "45 kg",
        origin: "Sénégal (Dahra)",
        age: "8 mois",
        status: "En Stock",
        category: "Éco"
    }
];

let selectedSheep = null;

// Modal Elements
const modal = document.getElementById('order-modal');
const loader = document.getElementById('loader-overlay');

/**
 * Open Order Modal
 */
function openOrder(id) {
    selectedSheep = sheepList.find(s => s.id === id);
    if (!selectedSheep) return;

    document.getElementById('modal-sheep-name').innerText = selectedSheep.name;
    document.getElementById('modal-sheep-price').innerText = selectedSheep.price.toLocaleString() + ' FCFA';
    modal.style.display = 'flex';
}

/**
 * Close Modals
 */
function closeModal() {
    modal.style.display = 'none';
    const successModal = document.getElementById('success-modal');
    if (successModal) successModal.style.display = 'none';
}

/**
 * Simulate Payment Process
 */
function processPayment(method) {
    if (!selectedSheep) return;

    // Close order modal
    modal.style.display = 'none';
    
    // Show loader
    loader.style.display = 'flex';
    document.getElementById('loader-text').innerText = `Connexion sécurisée à ${method}...`;

    // Simulate delay
    setTimeout(() => {
        document.getElementById('loader-text').innerText = "Vérification de la transaction...";
        
        setTimeout(() => {
            loader.style.display = 'none';
            showSuccess(method);
        }, 2000);

    }, 2000);
}

/**
 * Show Success Screen
 */
function showSuccess(method) {
    const successModal = document.getElementById('success-modal');
    document.getElementById('success-method').innerText = method;
    document.getElementById('success-amount').innerText = selectedSheep.price.toLocaleString() + ' FCFA';
    document.getElementById('success-sheep').innerText = selectedSheep.name;
    
    successModal.style.display = 'flex';
}

/**
 * Initialize dynamic elements
 */
document.addEventListener('DOMContentLoaded', () => {
    // Populate sheep grid if on index or services
    const grid = document.getElementById('sheep-grid');
    if (grid) {
        grid.innerHTML = sheepList.map(sheep => `
            <div class="card animate-fade">
                <div class="card-img">
                    <img src="${sheep.image}" alt="${sheep.name}">
                    <div class="card-badge">${sheep.category}</div>
                </div>
                <div class="card-content">
                    <h3>${sheep.name}</h3>
                    <p class="card-price">${sheep.price.toLocaleString()} FCFA</p>
                    <ul class="card-features">
                        <li>📏 <strong>Poids :</strong> ${sheep.weight}</li>
                        <li>🌍 <strong>Origine :</strong> ${sheep.origin}</li>
                        <li>📅 <strong>Âge :</strong> ${sheep.age}</li>
                    </ul>
                    <button class="btn-full" onclick="openOrder(${sheep.id})">Commander Maintenant</button>
                </div>
            </div>
        `).join('');
    }

    // Modal click listeners
    window.onclick = (event) => {
        if (event.target == modal) closeModal();
    };
});
