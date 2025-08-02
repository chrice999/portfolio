document.addEventListener('DOMContentLoaded', () => {

    // --- ÉLÉMENTS DU DOM ---
    const mainContent = document.querySelector('main');

    // --- INITIALISATION DU FOND 3D AVEC UNE TERRE EN ROTATION ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 15;

    // Création de la Terre
    const earthGeometry = new THREE.SphereGeometry(5, 32, 32);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = '#224488'; // Océan
    context.fillRect(0, 0, 128, 64);
    context.fillStyle = '#44aa44'; // Continents
    context.fillRect(10, 20, 30, 20);
    context.fillRect(50, 35, 40, 25);
    context.fillRect(100, 10, 20, 15);
    const texture = new THREE.CanvasTexture(canvas);
    const earthMaterial = new THREE.MeshBasicMaterial({ map: texture, wireframe: true, transparent: true, opacity: 0.6 });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.originalOpacity = 0.6;
    earth.rotation.x = 0.4;
    scene.add(earth);
    
    // --- EFFET 3D SUR LA PHOTO DE PROFIL ---
    const profilePic = document.getElementById('profile-pic');
    if(profilePic) {
        profilePic.addEventListener('mousemove', e => {
            const rect = profilePic.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const rotateY = (x / (rect.width / 2)) * 10;
            const rotateX = -(y / (rect.height / 2)) * 10;
            profilePic.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.1, 1.1, 1.1)`;
        });
        profilePic.addEventListener('mouseleave', () => {
            profilePic.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    }
    
    // --- ANIMATION DE FRAPPE ---
    const typingTextElement = document.getElementById('typing-text');
    if (typingTextElement) {
        const textArray = ["Linaharison Chrice.", "un développeur web.", "un créateur d'automations.", "un passionné d'IA."];
        let textArrayIndex = 0, charIndex = 0;
        const type = () => {
            if (charIndex < textArray[textArrayIndex].length) {
                typingTextElement.textContent += textArray[textArrayIndex].charAt(charIndex++);
                setTimeout(type, 120);
            } else { setTimeout(erase, 2000); }
        };
        const erase = () => {
            if (charIndex > 0) {
                typingTextElement.textContent = textArray[textArrayIndex].substring(0, --charIndex);
                setTimeout(erase, 80);
            } else {
                textArrayIndex = (textArrayIndex + 1) % textArray.length;
                setTimeout(type, 500);
            }
        };
        type();
    }

    // --- AUTRES SCRIPTS (SCROLL, FADE-IN, ETC.) ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => scrollToTopBtn.classList.toggle('hidden', window.scrollY <= 300));
        scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-section').forEach(section => observer.observe(section));

    // --- BOUCLE D'ANIMATION & REDIMENSIONNEMENT ---
    const worldPosition = new THREE.Vector3();
    
    function animate() {
        requestAnimationFrame(animate);

        // Rotation de la Terre
        earth.rotation.y += 0.001;

        // Logique pour estomper la planète derrière le contenu
        const contentRect = mainContent.getBoundingClientRect();
        earth.getWorldPosition(worldPosition);
        const screenPosition = worldPosition.clone().project(camera);
        const screenX = (screenPosition.x + 1) / 2 * window.innerWidth;
        
        // On vérifie si le centre de la terre est derrière la zone de texte
        const isBehindContent = (screenX > contentRect.left && screenX < contentRect.right);

        const targetOpacity = isBehindContent ? 0.05 : earth.originalOpacity; // Opacité très faible derrière le texte
        earth.material.opacity += (targetOpacity - earth.material.opacity) * 0.1;
        
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
