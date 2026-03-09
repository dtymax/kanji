const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const bgDir = path.join(publicDir, 'images', 'backgrounds');
const enemyDir = path.join(publicDir, 'images', 'enemies');

[bgDir, enemyDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const regions = [
    { id: 'hokkaido', name: '北海道', color: '#8ecae6', path: 'M 400,100 L 600,200 L 700,400 L 600,450 L 450,450 L 250,550 L 200,450 L 300,400 L 200,300 Z' },
    { id: 'tohoku', name: '東北', color: '#219ebc', path: 'M 350,50 L 450,50 L 500,200 L 550,400 L 500,550 L 350,550 L 300,400 L 350,200 Z' },
    { id: 'kanto', name: '関東', color: '#ffb703', path: 'M 300,100 L 500,100 L 600,300 L 700,450 L 650,550 L 550,500 L 400,550 L 350,450 L 150,300 Z' },
    { id: 'chubu', name: '中部', color: '#fb8500', path: 'M 300,100 L 650,80 L 700,400 L 600,550 L 300,550 L 200,300 Z' },
    { id: 'kansai', name: '関西', color: '#ffcdb2', path: 'M 100,100 L 650,250 L 600,450 L 450,550 L 300,550 L 350,350 L 100,350 Z' },
    { id: 'shikoku_chugoku', name: '四国中国', color: '#ffb4a2', path: 'M 100,200 L 300,150 L 500,150 L 700,200 L 650,400 L 450,450 L 250,450 L 100,400 Z' },
    { id: 'kyushu_okinawa', name: '九州沖縄', color: '#e5989b', path: 'M 300,100 L 600,100 L 650,300 L 500,500 L 250,450 L 150,250 Z', extra: '<circle cx="200" cy="450" r="15" fill="#e5989b" opacity="0.6" /><circle cx="150" cy="490" r="15" fill="#e5989b" opacity="0.6" /><circle cx="100" cy="530" r="15" fill="#e5989b" opacity="0.6" />' },
];

const types = ['normal', 'midboss', 'boss'];

regions.forEach(r => {
    // Background
    const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
        <rect width="100%" height="100%" fill="#f0f8ff" />
        <path d="${r.path}" fill="${r.color}" opacity="0.5" stroke="#fff" stroke-width="4" />
        ${r.extra || ''}
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="64" fill="rgba(255,255,255,0.7)" font-weight="bold">${r.name}</text>
    </svg>`;
    fs.writeFileSync(path.join(bgDir, `${r.id}.svg`), bgSvg);

    // Enemies (7 nodes)
    const nodeTypes = [
        'normal', 'normal', 'normal', 'midboss', 'normal', 'normal', 'boss'
    ];

    nodeTypes.forEach((type, index) => {
        const enemyImageName = `${r.id}_${type}_${index + 1}.svg`;
        let shape, color, size;
        if (type === 'normal') {
            shape = '<circle cx="100" cy="100" r="80" />';
            color = '#a8dadc';
            size = 200;
        } else if (type === 'midboss') {
            shape = '<polygon points="100,20 180,180 20,180" />';
            color = '#457b9d';
            size = 250;
        } else {
            shape = '<rect x="20" y="20" width="160" height="160" rx="20" />';
            color = '#e63946';
            size = 300;
        }

        const enemySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <g fill="${color}" stroke="#333" stroke-width="5">
                ${shape}
            </g>
            <text x="100" y="100" dominant-baseline="middle" text-anchor="middle" font-size="32" fill="#fff" font-weight="bold">${type}</text>
        </svg>`;
        fs.writeFileSync(path.join(enemyDir, enemyImageName), enemySvg);
    });
});

console.log('SVG placeholders generated!');
