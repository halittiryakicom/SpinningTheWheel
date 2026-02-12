let names = [];
let theWheel = null;
let rankingOrder = [];

// Sınıf yönetimi değişkenleri
let classes = {};
let currentClassId = null;
let editingClassId = null;
let confirmCallback = null;

// Renk paleti
const sweetColors = [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9',
    '#BAE1FF', '#E2BAFF', '#FFD6E0', '#D6FFD6',
    '#FFF5BA', '#BAFFF5'
];

function createWheel() {
    let segments = names.map((name, i) => ({
        'fillStyle': sweetColors[i % sweetColors.length],
        'text': name
    }));

    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    theWheel = new Winwheel({
        'canvasId': 'canvas',
        'numSegments': segments.length,
        'segments': segments,
        'animation': {
            'type': 'spinToStop',
            'duration': 5,
            'spins': 8,
            'callbackFinished': alertWinner
        }
    });

    theWheel.draw();
    drawTriangleIndicator(canvas, ctx);

    if (theWheel) {
        const originalDraw = theWheel.draw;
        theWheel.draw = function () {
            originalDraw.call(theWheel);
            drawTriangleIndicator(canvas, ctx);
        };
    }
}

function drawTriangleIndicator(canvas, ctx) {
    const centerX = canvas.width / 2;
    const topY = 10;
    const triangleHeight = 30;
    const triangleWidth = 40;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, topY + triangleHeight);
    ctx.lineTo(centerX - triangleWidth / 2, topY);
    ctx.lineTo(centerX + triangleWidth / 2, topY);
    ctx.closePath();
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function updateParticipantsList() {
    const list = document.getElementById('participantsList');
    list.innerHTML = '';
    names.forEach(name => {
        const div = document.createElement('div');
        div.className = 'participant-item';
        div.innerHTML = `
            <span>${name}</span>
            <button onclick="removeName('${name}')">Sil</button>
        `;
        list.appendChild(div);
    });
}

function removeName(name) {
    names = names.filter(n => n !== name);
    updateParticipantsList();
    createWheel();
    
    // Sınıf verilerini güncelle
    if (currentClassId && classes[currentClassId]) {
        classes[currentClassId].participants = names;
        saveToLocalStorage();
    }
}

function addName() {
    let nameInput = document.getElementById("kisiEkleInput").value.trim();
    if (nameInput && !names.includes(nameInput)) {
        names.push(nameInput);
        document.getElementById("kisiEkleInput").value = "";
        updateParticipantsList();
        createWheel();
        
        // Sınıf verilerini güncelle
        if (currentClassId && classes[currentClassId]) {
            classes[currentClassId].participants = names;
            saveToLocalStorage();
        }
    }
}

document.getElementById("kisiEkleInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addName();
    }
});

function spinWheel() {
    if (theWheel) theWheel.startAnimation();
}

function alertWinner(indicatedSegment) {
    alert("Kazanan: " + indicatedSegment.text);
    names = names.filter(name => name !== indicatedSegment.text);
    createWheel();
}

function spinAll() {
    if (names.length === 0) return;

    rankingOrder = [];
    let tempNames = [...names];
    document.getElementById("downloadBtn").style.display = "none";
    document.getElementById("rankingResult").style.display = "none";

    function spinNext() {
        if (tempNames.length === 0) {
            showRankingResult();
            return;
        }

        let segments = tempNames.map(name => ({
            'fillStyle': '#ccc',
            'text': name
        }));

        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");

        theWheel = new Winwheel({
            'canvasId': 'canvas',
            'numSegments': segments.length,
            'segments': segments,
            'animation': {
                'type': 'spinToStop',
                'duration': 3,
                'spins': 5,
                'callbackFinished': function (indicatedSegment) {
                    rankingOrder.push(indicatedSegment.text);
                    tempNames = tempNames.filter(n => n !== indicatedSegment.text);

                    theWheel.draw();
                    drawTriangleIndicator(canvas, ctx);

                    setTimeout(spinNext, 800);
                }
            }
        });

        theWheel.draw();
        drawTriangleIndicator(canvas, ctx);
        theWheel.startAnimation();
    }

    spinNext();
}

function showRankingResult() {
    const resultDiv = document.getElementById("rankingResult");
    let html = '<h3>🏆 Sıralama Sonuçları</h3><ol>';

    rankingOrder.forEach((name, index) => {
        html += `<li><strong>${name}</strong> - ${index === 0 ? '🥇 1. Sıra' : index === 1 ? '🥈 2. Sıra' : index === 2 ? '🥉 3. Sıra' : index + 1 + '. Sıra'}</li>`;
    });

    html += '</ol>';
    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
    document.getElementById("downloadBtn").style.display = 'inline-block';
}

function downloadRanking() {
    let content = "ÇEKÜLIŞ ÇARKI SIRALAMASI\n";
    content += "========================\n\n";

    rankingOrder.forEach((name, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[index] || '•';
        content += `${index + 1}. ${medal} ${name}\n`;
    });

    content += "\n\nTarih: " + new Date().toLocaleString('tr-TR');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'siralamasi_' + new Date().getTime() + '.txt');
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// ========== SINIF YÖNETİMİ ==========

// LocalStorage İşlemleri
function saveToLocalStorage() {
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('currentClassId', currentClassId);
}

function loadFromLocalStorage() {
    const savedClasses = localStorage.getItem('classes');
    const savedCurrentClassId = localStorage.getItem('currentClassId');
    
    if (savedClasses) {
        classes = JSON.parse(savedClasses);
    }
    
    if (savedCurrentClassId && classes[savedCurrentClassId]) {
        currentClassId = savedCurrentClassId;
        loadClassData(currentClassId);
    }
    
    updateClassDropdown();
}

// Sınıf Dropdown Güncelleme
function updateClassDropdown() {
    const dropdown = document.getElementById('classDropdown');
    dropdown.innerHTML = '<option value="">Sınıf Seçiniz</option>';
    
    Object.keys(classes).forEach(classId => {
        const option = document.createElement('option');
        option.value = classId;
        option.textContent = classes[classId].name;
        if (classId === currentClassId) {
            option.selected = true;
        }
        dropdown.appendChild(option);
    });
}

// Sınıf Değiştirme
function switchClass() {
    const dropdown = document.getElementById('classDropdown');
    const selectedClassId = dropdown.value;
    
    if (selectedClassId) {
        currentClassId = selectedClassId;
        loadClassData(selectedClassId);
        saveToLocalStorage();
    } else {
        currentClassId = null;
        names = [];
        updateParticipantsList();
        createWheel();
        document.getElementById('classInfo').style.display = 'none';
    }
}

// Sınıf Verilerini Yükleme
function loadClassData(classId) {
    if (classes[classId]) {
        names = classes[classId].participants || [];
        document.getElementById('currentClassName').textContent = classes[classId].name;
        document.getElementById('classInfo').style.display = 'block';
        updateParticipantsList();
        createWheel();
    }
}

// Sınıf Modal Açma/Kapama
function openClassModal() {
    editingClassId = null;
    document.getElementById('modalTitle').textContent = 'Yeni Sınıf Oluştur';
    document.getElementById('classNameInput').value = '';
    document.getElementById('classModal').style.display = 'block';
    setTimeout(() => document.getElementById('classNameInput').focus(), 100);
}

function closeClassModal() {
    document.getElementById('classModal').style.display = 'none';
    editingClassId = null;
}

// Sınıf Kaydetme
function saveClass() {
    const className = document.getElementById('classNameInput').value.trim();
    
    if (!className) {
        alert('Lütfen sınıf adı girin!');
        return;
    }
    
    if (editingClassId) {
        // Düzenleme
        classes[editingClassId].name = className;
        if (currentClassId === editingClassId) {
            document.getElementById('currentClassName').textContent = className;
        }
    } else {
        // Yeni sınıf
        const classId = 'class_' + Date.now();
        classes[classId] = {
            name: className,
            participants: [],
            createdAt: new Date().toISOString()
        };
        currentClassId = classId;
        loadClassData(classId);
    }
    
    updateClassDropdown();
    saveToLocalStorage();
    closeClassModal();
}

// Sınıf Düzenleme
function editClass() {
    if (!currentClassId) return;
    
    editingClassId = currentClassId;
    document.getElementById('modalTitle').textContent = 'Sınıf Düzenle';
    document.getElementById('classNameInput').value = classes[currentClassId].name;
    document.getElementById('classModal').style.display = 'block';
    setTimeout(() => document.getElementById('classNameInput').focus(), 100);
}

// Sınıf Silme
function deleteClass() {
    if (!currentClassId) return;
    
    const className = classes[currentClassId].name;
    showConfirmModal(
        `"${className}" sınıfını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
        () => {
            delete classes[currentClassId];
            currentClassId = null;
            names = [];
            document.getElementById('classInfo').style.display = 'none';
            updateClassDropdown();
            updateParticipantsList();
            createWheel();
            saveToLocalStorage();
        }
    );
}

// Onay Modal
function showConfirmModal(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').style.display = 'block';
    confirmCallback = callback;
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
    confirmCallback = null;
}

function confirmAction() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeConfirmModal();
}

// Modal dışına tıklayınca kapanma
window.onclick = function(event) {
    const classModal = document.getElementById('classModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (event.target === classModal) {
        closeClassModal();
    }
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
}

// Enter tuşu ile modal kaydetme
document.addEventListener('DOMContentLoaded', function() {
    const classNameInput = document.getElementById('classNameInput');
    if (classNameInput) {
        classNameInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                saveClass();
            }
        });
    }
});

window.onload = function () {
    loadFromLocalStorage();
    createWheel();
    updateParticipantsList();
}