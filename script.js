// In-game economy state
let gameState = {
    coins: 500,
    tokens: 10,
    collection: []
};

// Generates an expansive roster of 105 total unique characters
const NAMES = ["Devon", "Levon", "John", "Denis", "Alex", "Hermes", "Vitaly", "Arsen", "Oleg", "Genadi", "Dave", "Michael", "Todd", "Travis", "Kydyrgali", "Georgy", "Morozov", "Zaur", "Silaev", "Prudnik", "Laletin", "Gasparini", "Saginashvili", "Brzenk", "Cyplenkov", "Kurdecha", "Chaffee", "Toddzilla", "Bagent", "Ongarbaev"];
const SURNAMES = ["Larratt", "Saginashvili", "Brzenk", "Cyplenkov", "Kurdecha", "Chaffee", "Hutchings", "Bagent", "Ongarbaev", "Dzeranov", "Morozov", "Silaev", "Prudnik", "Laletin", "Gasparini", "Petrenko", "Tupone", "Zoloev", "Matyushenko", "Kvikvinia"];
const TIERS = ["common", "rare", "epic", "legendary"];
const TECHNIQUES = ["Top Roll", "Hook", "Press", "King's Move"];

function generateFullRoster() {
    let list = [];
    // 1. Manually inject top historic anchors
    list.push({ id: 1, name: "John Brzenk", tier: "legendary", technique: "Hook", bicep: 99, wrist: 98, endurance: 95 });
    list.push({ id: 2, name: "Devon Larratt", tier: "legendary", technique: "Top Roll", bicep: 96, wrist: 99, endurance: 100 });
    list.push({ id: 3, name: "Levan Saginashvili", tier: "legendary", technique: "Press", bicep: 100, wrist: 100, endurance: 92 });
    list.push({ id: 4, name: "Denis Cyplenkov", tier: "legendary", technique: "Hook", bicep: 99, wrist: 97, endurance: 90 });
    
    // 2. Procedural loop execution crossing 100 distinct profiles
    let idCounter = 5;
    for (let i = 0; i < NAMES.length; i++) {
        for (let j = 0; j < SURNAMES.length; j++) {
            if (list.length >= 105) break;
            
            let name = `${NAMES[i]} ${SURNAMES[j]}`;
            if (["John Brzenk", "Devon Larratt", "Levan Saginashvili", "Denis Cyplenkov"].includes(name)) continue;

            let tierRand = Math.random();
            let tier = "common";
            let basePower = 50;
            
            if (tierRand > 0.95) { tier = "legendary"; basePower = 90; }
            else if (tierRand > 0.80) { tier = "epic"; basePower = 78; }
            else if (tierRand > 0.50) { tier = "rare"; basePower = 65; }

            list.push({
                id: idCounter++,
                name: name,
                tier: tier,
                technique: TECHNIQUES[Math.floor(Math.random() * TECHNIQUES.length)],
                bicep: basePower + Math.floor(Math.random() * 10),
                wrist: basePower + Math.floor(Math.random() * 10),
                endurance: basePower + Math.floor(Math.random() * 10)
            });
        }
    }
    return list;
}

const MASTER_ROSTER = generateFullRoster();

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    populateOpponents();
    setupShop();
    updateUI();
});

// Tab Navigation Logic
function setupTabs() {
    document.querySelectorAll(".nav-links li").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".nav-links li").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            tab.classList.add("active");
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add("active");
        });
    });
}

// Render Battle Opponents
function populateOpponents() {
    const grid = document.getElementById("opponent-grid");
    grid.innerHTML = "";
    
    // Pick 8 random fighters from the master pool of 105
    const shuffled = [...MASTER_ROSTER].sort(() => 0.5 - Math.random()).slice(0, 8);
    
    shuffled.forEach(wrestler => {
        const card = createCardElement(wrestler, true);
        grid.appendChild(card);
    });
}

// Card UI Component Creation
function createCardElement(wrestler, isOpponent) {
    const card = document.createElement("div");
    card.className = `wrestler-card tier-${wrestler.tier}`;
    
    card.innerHTML = `
        <span class="card-tier">${wrestler.tier}</span>
        <div class="avatar">🤼‍♂️</div>
        <h3>${wrestler.name}</h3>
        <p style="margin-bottom:0; color:#ff9f43; font-weight:bold;">${wrestler.technique}</p>
        <div class="stats">
            <div><span>Bicep:</span> <span>${wrestler.bicep}</span></div>
            <div><span>Wrist:</span> <span>${wrestler.wrist}</span></div>
            <div><span>Endurance:</span> <span>${wrestler.endurance}</span></div>
        </div>
    `;
    
    if (isOpponent) {
        const btn = document.createElement("button");
        btn.className = "battle-btn";
        btn.innerText = "Match Pull";
        btn.onclick = () => handleBattle(wrestler);
        card.appendChild(btn);
    }
    
    return card;
}

// Battle simulation mechanics
function handleBattle(opponent) {
    let playerPower = 220; 
    if(gameState.collection.length > 0) {
        playerPower = gameState.collection.reduce((acc, curr) => acc + curr.bicep, 0) / gameState.collection.length + 150;
    }
    
    let opponentPower = opponent.bicep + opponent.wrist + opponent.endurance;
    
    if (playerPower >= opponentPower * 0.85) {
        gameState.tokens += 3;
        alert(`🏆 Victory! You pinned ${opponent.name} and earned 3 Battle Tokens!`);
    } else {
        gameState.tokens += 1;
        alert(`❌ Defeat! ${opponent.name} flashed you. Received 1 Token.`);
    }
    updateUI();
    populateOpponents();
}

// Shop Logic Counter
function setupShop() {
    document.querySelectorAll(".buy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const cost = parseInt(btn.dataset.cost);
            const packType = btn.dataset.pack;
            
            if (gameState.coins >= cost) {
                gameState.coins -= cost;
                openBoosterPack(packType);
            } else {
                alert("🚫 Not enough Coins!");
            }
        });
    });
    
    document.getElementById("exchange-btn").addEventListener("click", () => {
        if (gameState.tokens >= 5) {
            gameState.tokens -= 5;
            gameState.coins += 150;
            updateUI();
            alert("🤝 Traded 5 Tokens for 150 Coins!");
        } else {
            alert("🚫 Minimum 5 Tokens required!");
        }
    });

    document.getElementById("close-modal-btn").addEventListener("click", () => {
        document.getElementById("pack-modal").classList.remove("open");
    });
}

function openBoosterPack(type) {
    const numCards = type === "novice" ? 3 : 5;
    const unboxedContainer = document.getElementById("unboxed-cards");
    unboxedContainer.innerHTML = "";
    
    let unboxedList = [];
    for(let i = 0; i < numCards; i++) {
        let randomCard = MASTER_ROSTER[Math.floor(Math.random() * MASTER_ROSTER.length)];
        gameState.collection.push(randomCard);
        unboxedList.push(randomCard);
        
        const element = createCardElement(randomCard, false);
        unboxedContainer.appendChild(element);
    }
    
    updateUI();
    renderCollection();
    document.getElementById("pack-modal").classList.add("open");
}

function renderCollection() {
    const grid = document.getElementById("collection-grid");
    grid.innerHTML = "";
    
    if(gameState.collection.length === 0) {
        grid.innerHTML = `<p class="empty-msg">Your collection is empty. Go open some Booster Packs!</p>`;
        return;
    }
    
    gameState.collection.forEach(wrestler => {
        grid.appendChild(createCardElement(wrestler, false));
    });
}

function updateUI() {
    document.getElementById("coin-count").innerText = gameState.coins;
    document.getElementById("token-count").innerText = gameState.tokens;
    document.getElementById("collection-count").innerText = gameState.collection.length;
}
