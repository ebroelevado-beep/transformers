import * as THREE from 'three';

// --- Background 3D Scene ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Create floating particles to represent "tokens" or "data"
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: '#7c3aed',
    transparent: true,
    opacity: 0.5
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

camera.position.z = 3;

// --- Transformer Visualization Elements ---
// A central "core" representing a layer
const coreGeometry = new THREE.IcosahedronGeometry(1, 2);
const coreMaterial = new THREE.MeshPhongMaterial({
    color: '#3b82f6',
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

function animate() {
    requestAnimationFrame(animate);
    
    particlesMesh.rotation.y += 0.001;
    particlesMesh.rotation.x += 0.0005;
    
    core.rotation.y -= 0.005;
    core.scale.set(1 + Math.sin(Date.now() * 0.001) * 0.05, 1 + Math.sin(Date.now() * 0.001) * 0.05, 1 + Math.sin(Date.now() * 0.001) * 0.05);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

// --- Interactive Attention Lab ---
const input = document.getElementById('input-text');
const mapContainer = document.getElementById('attention-map');

function updateAttention() {
    const text = input.value;
    const tokens = text.split(' ').filter(t => t.length > 0);
    mapContainer.innerHTML = '';
    
    if (tokens.length === 0) return;

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '2rem';
    wrapper.style.position = 'relative';

    const col1 = document.createElement('div');
    const col2 = document.createElement('div');
    
    tokens.forEach((token, i) => {
        const t1 = document.createElement('div');
        t1.innerText = token;
        t1.className = 'token-item';
        t1.style.padding = '5px 10px';
        t1.style.marginBottom = '10px';
        t1.style.borderRadius = '4px';
        t1.style.border = '1px solid var(--border-color)';
        t1.dataset.index = i;
        
        const t2 = t1.cloneNode(true);
        
        t1.onmouseover = () => highlightAttention(i);
        t1.onmouseout = clearAttention;

        col1.appendChild(t1);
        col2.appendChild(t2);
    });

    wrapper.appendChild(col1);
    wrapper.appendChild(col2);
    mapContainer.appendChild(wrapper);

    // SVG Layer for lines
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = 'absolute';
    svg.style.top = 0;
    svg.style.left = 0;
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.id = 'attention-svg';
    mapContainer.appendChild(svg);
}

function highlightAttention(index) {
    const svg = document.getElementById('attention-svg');
    svg.innerHTML = '';
    const col1Items = mapContainer.querySelectorAll('div:nth-child(1) > .token-item');
    const col2Items = mapContainer.querySelectorAll('div:nth-child(2) > .token-item');
    
    const source = col1Items[index];
    const rect1 = source.getBoundingClientRect();
    const containerRect = mapContainer.getBoundingClientRect();

    col2Items.forEach((target, i) => {
        const rect2 = target.getBoundingClientRect();
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const strength = Math.random(); // Simulate attention score
        
        line.setAttribute('x1', rect1.right - containerRect.left);
        line.setAttribute('y1', rect1.top + rect1.height/2 - containerRect.top);
        line.setAttribute('x2', rect2.left - containerRect.left);
        line.setAttribute('y2', rect2.top + rect2.height/2 - containerRect.top);
        line.setAttribute('stroke', `rgba(124, 58, 237, ${strength})`);
        line.setAttribute('stroke-width', strength * 4);
        line.style.transition = 'all 0.3s';
        
        svg.appendChild(line);
    });
}

function clearAttention() {
    const svg = document.getElementById('attention-svg');
    if (svg) svg.innerHTML = '';
}

input.addEventListener('input', updateAttention);
updateAttention();
