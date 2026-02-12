let names = [];
let theWheel = null;
let rankingOrder = [];

// Sınıf yönetimi değişkenleri
let classes = {};
let currentClassId = null;
let editingClassId = null;
let confirmCallback = null;

// İstatistik değişkenleri
let barChartInstance = null;
let pieChartInstance = null;

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
    const winnerName = indicatedSegment.text;
    alert("🎉 Kazanan: " + winnerName);

    // İstatistik kaydı
    recordSelection(winnerName, 'single');

    // Kazanan listeden silinmiyor, sadece istatistikler tutuluyor
    // Çarkı sıfırla (durağan konumda)
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
                    const selectedName = indicatedSegment.text;
                    rankingOrder.push(selectedName);

                    // İstatistik kaydı
                    recordSelection(selectedName, 'ranking');

                    tempNames = tempNames.filter(n => n !== selectedName);

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
            statistics: {},
            history: [],
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
window.onclick = function (event) {
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
document.addEventListener('DOMContentLoaded', function () {
    const classNameInput = document.getElementById('classNameInput');
    if (classNameInput) {
        classNameInput.addEventListener('keydown', function (event) {
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

// ========== İSTATİSTİK VE GRAFİKLER ==========

// Sekme Değiştirme
function switchTab(tabName) {
    // Sekme butonlarını güncelle
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Sekme içeriklerini güncelle
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabName === 'wheel') {
        document.getElementById('wheelTab').classList.add('active');
    } else if (tabName === 'stats') {
        document.getElementById('statsTab').classList.add('active');
        updateStatsDisplay();
        createCharts();
        displayHistory();
    }
}

// Seçilme Kaydı
function recordSelection(name, type) {
    if (!currentClassId || !classes[currentClassId]) return;

    const classData = classes[currentClassId];

    // İstatistik verisi oluştur veya güncelle
    if (!classData.statistics) classData.statistics = {};
    if (!classData.statistics[name]) {
        classData.statistics[name] = {
            count: 0,
            lastSelected: null
        };
    }

    classData.statistics[name].count++;
    classData.statistics[name].lastSelected = new Date().toISOString();

    // Geçmiş kaydı ekle
    if (!classData.history) classData.history = [];
    classData.history.unshift({
        name: name,
        type: type,
        timestamp: new Date().toISOString()
    });

    // Son 50 kaydı tut
    if (classData.history.length > 50) {
        classData.history = classData.history.slice(0, 50);
    }

    saveToLocalStorage();
}

// İstatistik Tablosu Güncelleme
function updateStatsDisplay() {
    if (!currentClassId || !classes[currentClassId]) {
        document.getElementById('statsTableBody').innerHTML =
            '<tr><td colspan="4" class="no-data">Önce bir sınıf seçin</td></tr>';
        return;
    }

    const classData = classes[currentClassId];
    const stats = classData.statistics || {};
    const participants = classData.participants || [];

    if (participants.length === 0) {
        document.getElementById('statsTableBody').innerHTML =
            '<tr><td colspan="4" class="no-data">Henüz öğrenci eklenmemiş</td></tr>';
        return;
    }

    // Toplam seçilme sayısı
    const totalSelections = Object.values(stats).reduce((sum, s) => sum + s.count, 0);

    // Tablo verilerini hazırla
    let tableData = participants.map(name => {
        const studentStats = stats[name] || { count: 0, lastSelected: null };
        const percent = totalSelections > 0 ? ((studentStats.count / totalSelections) * 100).toFixed(1) : 0;

        return {
            name: name,
            count: studentStats.count,
            percent: percent,
            lastSelected: studentStats.lastSelected
        };
    });

    // Sıralama uygula
    applySorting(tableData);

    // Tabloyu oluştur
    const tbody = document.getElementById('statsTableBody');
    tbody.innerHTML = '';

    tableData.forEach(data => {
        const tr = document.createElement('tr');
        const lastSelectedText = data.lastSelected
            ? new Date(data.lastSelected).toLocaleString('tr-TR')
            : '<span class="never-selected">Hiç seçilmedi</span>';

        tr.innerHTML = `
            <td>${data.name}</td>
            <td>${data.count}</td>
            <td>${data.percent}%</td>
            <td>${lastSelectedText}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Sıralama Uygulama
function applySorting(data) {
    const sortType = document.getElementById('sortSelect').value;

    switch (sortType) {
        case 'name':
            data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
            break;
        case 'count-desc':
            data.sort((a, b) => b.count - a.count);
            break;
        case 'count-asc':
            data.sort((a, b) => a.count - b.count);
            break;
        case 'percent-desc':
            data.sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent));
            break;
        case 'last-desc':
            data.sort((a, b) => {
                if (!a.lastSelected) return 1;
                if (!b.lastSelected) return -1;
                return new Date(b.lastSelected) - new Date(a.lastSelected);
            });
            break;
    }
}

// Sıralama Değiştiğinde
function sortStats() {
    updateStatsDisplay();
}

// Arama/Filtreleme
function filterStats() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#statsTableBody tr');

    rows.forEach(row => {
        const name = row.cells[0]?.textContent.toLowerCase() || '';
        if (name.includes(searchText)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Grafikleri Oluşturma
function createCharts() {
    if (!currentClassId || !classes[currentClassId]) return;

    const classData = classes[currentClassId];
    const stats = classData.statistics || {};
    const participants = classData.participants || [];

    if (participants.length === 0) return;

    // Veri hazırlama
    const labels = [];
    const data = [];
    const backgroundColors = [];

    participants.forEach((name, index) => {
        labels.push(name);
        data.push(stats[name]?.count || 0);
        backgroundColors.push(sweetColors[index % sweetColors.length]);
    });

    // Bar Chart
    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        if (barChartInstance) {
            barChartInstance.destroy();
        }

        barChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Seçilme Sayısı',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(c => c),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Pie Chart
    const pieCtx = document.getElementById('pieChart');
    if (pieCtx) {
        if (pieChartInstance) {
            pieChartInstance.destroy();
        }

        // Sadece seçilmiş olanları göster
        const selectedData = data.filter(d => d > 0);
        const selectedLabels = labels.filter((l, i) => data[i] > 0);
        const selectedColors = backgroundColors.filter((c, i) => data[i] > 0);

        if (selectedData.length > 0) {
            pieChartInstance = new Chart(pieCtx, {
                type: 'pie',
                data: {
                    labels: selectedLabels,
                    datasets: [{
                        data: selectedData,
                        backgroundColor: selectedColors,
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }
}

// Geçmişi Görüntüleme
function displayHistory() {
    if (!currentClassId || !classes[currentClassId]) {
        document.getElementById('historyList').innerHTML =
            '<p class="no-data">Önce bir sınıf seçin</p>';
        return;
    }

    const classData = classes[currentClassId];
    const history = classData.history || [];

    if (history.length === 0) {
        document.getElementById('historyList').innerHTML =
            '<p class="no-data">Henüz çekiliş yapılmadı</p>';
        return;
    }

    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    // Son 20 kaydı göster
    history.slice(0, 20).forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';

        const typeText = item.type === 'single' ? '🎯 Tek Çekiliş' : '📊 Sıralama';
        const date = new Date(item.timestamp).toLocaleString('tr-TR');
        const manualBadge = item.manual ? '<span class="manual-badge">✏️ Manuel</span>' : '';

        div.innerHTML = `
            <div class="history-item-header">
                <span class="history-item-name">${item.name}</span>
                <span class="history-item-date">${date}</span>
            </div>
            <div class="history-item-type">${typeText} ${manualBadge}</div>
        `;

        historyList.appendChild(div);
    });
}

// Geçmişte Arama
function filterHistory() {
    const searchText = document.getElementById('historySearch').value.toLowerCase();
    const items = document.querySelectorAll('.history-item');

    items.forEach(item => {
        const name = item.querySelector('.history-item-name')?.textContent.toLowerCase() || '';
        if (name.includes(searchText)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Geçmişi Temizleme
function clearHistory() {
    if (!currentClassId || !classes[currentClassId]) return;

    showConfirmModal(
        'Tüm istatistik ve çekiliş geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
        () => {
            classes[currentClassId].statistics = {};
            classes[currentClassId].history = [];
            saveToLocalStorage();
            updateStatsDisplay();
            createCharts();
            displayHistory();
            alert('Geçmiş başarıyla temizlendi!');
        }
    );
}

// ========== MANUEL VERİ GİRİŞİ ==========

// Manuel Kayıt Modal Açma
function openManualEntryModal() {
    if (!currentClassId || !classes[currentClassId]) {
        alert('Lütfen önce bir sınıf seçin!');
        return;
    }

    const classData = classes[currentClassId];
    const participants = classData.participants || [];

    if (participants.length === 0) {
        alert('Sınıfta henüz öğrenci yok. Önce öğrenci ekleyin!');
        return;
    }

    // Öğrenci listesini doldur
    const select = document.getElementById('manualStudentSelect');
    select.innerHTML = '<option value="">Öğrenci seçiniz...</option>';

    participants.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    // Varsayılan tarih olarak şimdiyi ayarla
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
    document.getElementById('manualDateInput').value = localISOTime;

    // Sayaç sıfırla
    document.getElementById('manualCountInput').value = 1;

    // Modal'ı aç
    document.getElementById('manualEntryModal').style.display = 'block';
}

// Manuel Kayıt Modal Kapama
function closeManualEntryModal() {
    document.getElementById('manualEntryModal').style.display = 'none';
}

// Manuel Kayıt Kaydetme
function saveManualEntry() {
    const studentName = document.getElementById('manualStudentSelect').value;
    const type = document.getElementById('manualTypeSelect').value;
    const dateTimeStr = document.getElementById('manualDateInput').value;
    const count = parseInt(document.getElementById('manualCountInput').value) || 1;

    if (!studentName) {
        alert('Lütfen bir öğrenci seçin!');
        return;
    }

    if (!dateTimeStr) {
        alert('Lütfen tarih ve saat girin!');
        return;
    }

    if (count < 1 || count > 100) {
        alert('Tekrar sayısı 1 ile 100 arasında olmalıdır!');
        return;
    }

    if (!currentClassId || !classes[currentClassId]) return;

    const classData = classes[currentClassId];
    const timestamp = new Date(dateTimeStr).toISOString();

    // İstatistik verisi oluştur veya güncelle
    if (!classData.statistics) classData.statistics = {};
    if (!classData.statistics[studentName]) {
        classData.statistics[studentName] = {
            count: 0,
            lastSelected: null
        };
    }

    // Belirtilen sayı kadar kayıt ekle
    for (let i = 0; i < count; i++) {
        classData.statistics[studentName].count++;

        // Geçmiş kaydı ekle
        if (!classData.history) classData.history = [];
        classData.history.unshift({
            name: studentName,
            type: type,
            timestamp: timestamp,
            manual: true // Manuel eklendi işareti
        });
    }

    classData.statistics[studentName].lastSelected = timestamp;

    // Geçmişi sınırla (son 50 kayıt)
    if (classData.history.length > 50) {
        classData.history = classData.history.slice(0, 50);
    }

    saveToLocalStorage();

    // Görünümü güncelle
    updateStatsDisplay();
    createCharts();
    displayHistory();

    closeManualEntryModal();

    const countText = count > 1 ? `${count} kayıt` : '1 kayıt';
    alert(`✅ ${studentName} için ${countText} başarıyla eklendi!`);
}

// Modal dışına tıklama ile kapatma güncellemesi
const originalWindowOnClick = window.onclick;
window.onclick = function (event) {
    const classModal = document.getElementById('classModal');
    const confirmModal = document.getElementById('confirmModal');
    const manualEntryModal = document.getElementById('manualEntryModal');

    if (event.target === classModal) {
        closeClassModal();
    }
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
    if (event.target === manualEntryModal) {
        closeManualEntryModal();
    }
}