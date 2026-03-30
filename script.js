/**
 * MoutonPro PRO MAX - Real Dynamic Integration (Supabase)
 */

// --- CONFIGURATION SUPABASE ---
const SUPABASE_URL = "https://jbppivpwbsykzabeqnzi.supabase.co";
const SUPABASE_KEY = "sb_publishable_MxyDe092Qdu6b1-riK_afw_dg4jPSks";
const ADMIN_PASSWORD = "admin";

// Initialisation du client Supabase
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

let sheepList = [];
let orderHistory = [];

// --- CORE FUNCTIONS (DATA FETCHING) ---

async function fetchSheep() {
    if (!supabase) return;
    const { data, error } = await supabase
        .from('sheep')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erreur lors de la récupération des moutons:", error);
    } else {
        sheepList = data;
        renderSheepGrid();
        updateAdminTable();
        updateAdminStats();
    }
}

async function fetchOrders() {
    if (!supabase) return;
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
    } else {
        orderHistory = data;
        updateOrderTable();
        updateAdminStats();
    }
}

// --- PUBLIC SITE LOGIC ---
let selectedSheep = null;

function openOrder(id) {
    selectedSheep = sheepList.find(s => s.id === id);
    if (!selectedSheep) return;
    document.getElementById('modal-sheep-name').innerText = selectedSheep.name;
    document.getElementById('modal-sheep-price').innerText = selectedSheep.price.toLocaleString() + ' FCFA';
    document.getElementById('order-modal').style.display = 'flex';
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(m => m.style.display = 'none');
}

async function processPayment(method) {
    if (!selectedSheep) return;
    document.getElementById('order-modal').style.display = 'none';
    const loader = document.getElementById('loader-overlay');
    loader.style.display = 'flex';
    
    // Enregistrer la commande RÉELLE dans Supabase
    const { error } = await supabase
        .from('orders')
        .insert([{
            sheep_name: selectedSheep.name,
            amount: selectedSheep.price,
            payment_method: method,
            status: "Réussi"
        }]);

    setTimeout(() => {
        if (error) console.error("Erreur lors de l'enregistrement de la commande:", error);
        loader.style.display = 'none';
        showSuccess(method);
        fetchOrders(); // Rafraîchir les stats si admin ouvert
    }, 3000);
}

function showSuccess(method) {
    const successModal = document.getElementById('success-modal');
    document.getElementById('success-method').innerText = method;
    document.getElementById('success-amount').innerText = selectedSheep.price.toLocaleString() + ' FCFA';
    document.getElementById('success-sheep').innerText = selectedSheep.name;
    successModal.style.display = 'flex';
}

// --- ADMIN LOGIC ---
function checkLogin() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === ADMIN_PASSWORD) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'flex';
        initAdmin();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function initAdmin() {
    fetchSheep();
    fetchOrders();
}

function updateAdminStats() {
    if(!document.getElementById('stat-total-sheep')) return;
    document.getElementById('stat-total-sheep').innerText = sheepList.length;
    document.getElementById('stat-total-orders').innerText = orderHistory.length;
    const revenue = orderHistory.reduce((sum, o) => sum + o.amount, 0);
    document.getElementById('stat-revenue').innerText = revenue.toLocaleString() + ' FCFA';
}

function updateAdminTable() {
    const tbody = document.getElementById('admin-sheep-list');
    if (!tbody) return;
    tbody.innerHTML = sheepList.map(s => `
        <tr>
            <td><img src="${s.image}" style="width:50px; border-radius:8px; height:50px; object-fit:cover"></td>
            <td><strong>${s.name}</strong></td>
            <td>${s.price.toLocaleString()} FCFA</td>
            <td>${s.weight}</td>
            <td>${s.category}</td>
            <td>
                <button class="action-btn btn-edit">Modifier</button>
                <button class="action-btn btn-delete" onclick="deleteSheep(${s.id})">Supprimer</button>
            </td>
        </tr>
    `).join('');
}

function updateOrderTable() {
    const tbody = document.getElementById('admin-order-list');
    if (!tbody) return;
    tbody.innerHTML = orderHistory.map(o => `
        <tr>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td><strong>${o.sheep_name}</strong></td>
            <td>Client Anonyme</td>
            <td>${o.amount.toLocaleString()} FCFA</td>
            <td>${o.payment_method}</td>
            <td><span style="color:#10B981">● ${o.status}</span></td>
        </tr>
    `).join('');
}

async function deleteSheep(id) {
    if (confirm("Supprimer ce mouton définitivement ?")) {
        const { error } = await supabase
            .from('sheep')
            .delete()
            .eq('id', id);

        if (error) alert("Erreur lors de la suppression.");
        else fetchSheep();
    }
}

// Handle Form Submission (Add Sheep)
document.getElementById('sheep-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newSheep = {
        name: document.getElementById('sheep-name').value,
        price: parseInt(document.getElementById('sheep-price').value),
        weight: document.getElementById('sheep-weight').value || "Non spécifié",
        category: document.getElementById('sheep-category').value,
        image: document.getElementById('sheep-image').value || "hero.png",
        origin: "Élevage Local",
        age: "N/A"
    };

    const { error } = await supabase
        .from('sheep')
        .insert([newSheep]);

    if (error) {
        alert("Erreur lors de l'ajout.");
        console.error(error);
    } else {
        closeAddModal();
        fetchSheep();
        e.target.reset();
    }
});

function renderSheepGrid() {
    const grid = document.getElementById('sheep-grid');
    if (!grid) return;
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
                </ul>
                <button class="btn-full" onclick="openOrder(${sheep.id})">Commander Maintenant</button>
            </div>
        </div>
    `).join('');
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchSheep();
    if (document.getElementById('admin-dashboard')) {
        // We are on admin page, but don't show dashboard until login
    }
});
