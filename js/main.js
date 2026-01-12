let names = [];
let theWheel = null;
let rankingOrder = [];

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
}

function addName() {
    let nameInput = document.getElementById("kisiEkleInput").value.trim();
    if (nameInput && !names.includes(nameInput)) {
        names.push(nameInput);
        document.getElementById("kisiEkleInput").value = "";
        updateParticipantsList();
        createWheel();
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

window.onload = function () {
    createWheel();
    updateParticipantsList();
}