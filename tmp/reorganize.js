const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Lenovo/basira-global/app/components';
const layoutDir = path.join(baseDir, 'layout');
const featuresDir = path.join(baseDir, 'features');
const uiDir = path.join(baseDir, 'ui');

[layoutDir, featuresDir, uiDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created: ${dir}`);
    }
});

const moves = [
    { from: 'TopNavbar.tsx', to: 'layout/TopNavbar.tsx' },
    { from: 'NetworkBackground.tsx', to: 'layout/NetworkBackground.tsx' },
    { from: 'HeroMap.tsx', to: 'layout/HeroMap.tsx' },
    { from: 'BasirRobot.tsx', to: 'features/BasirRobot.tsx' },
    { from: 'ClinicalReport.tsx', to: 'features/ClinicalReport.tsx' },
    { from: 'DailyDrillView.tsx', to: 'features/DailyDrillView.tsx' },
    { from: 'TestEngine.tsx', to: 'features/TestEngine.tsx' },
    { from: 'OnboardingTour.tsx', to: 'features/OnboardingTour.tsx' },
];

moves.forEach(m => {
    const fromPath = path.join(baseDir, m.from);
    const toPath = path.join(baseDir, m.to);
    if (fs.existsSync(fromPath)) {
        fs.renameSync(fromPath, toPath);
        console.log(`Moved: ${m.from} -> ${m.to}`);
    } else {
        console.warn(`File not found: ${fromPath}`);
    }
});
