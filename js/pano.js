(function(){
  const container = document.getElementById('video-container');
  const video = document.getElementById('pano-video');

  // Spustenie videa po prvom kliknutí
  document.body.addEventListener('click', function() {
     if(video.paused) video.play();
  }, {once: true});

  // ZMENA 1: Zmenili sme základný uhol FOV zo 60 na 30 (Kamera vás hodí priamo k obrazu)
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.set(0, 0, 0.1); 

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false; 
  controls.enablePan = false; 
  controls.enableDamping = true; 
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = -0.15; 

  // ZMENA 2: Rozšírenie uhlov, aby ste sa pri tomto zväčšení vedeli pozrieť až do rohov
  controls.minAzimuthAngle = -0.7; 
  controls.maxAzimuthAngle = 0.7;  
  controls.minPolarAngle = Math.PI / 2 - 0.4; 
  controls.maxPolarAngle = Math.PI / 2 + 0.4; 

  // ZAKRIVENÉ PLÁTNO (valcový segment) – ploché video pôsobí ako VR/IMAX
  const R = 1000;                                   // polomer zakrivenia
  const arcDeg = 100;                               // šírka oblúka v stupňoch
  const arc = arcDeg * Math.PI / 180;
  const screenH = R * arc * 9 / 16;                 // výška pre pomer 16:9
  const geometry = new THREE.CylinderGeometry(
    R, R, screenH,
    100, 1, true,                                   // openEnded
    Math.PI - arc / 2, arc                          // oblúk vycentrovaný pred kameru (-Z)
  );

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;                            // korekcia zrkadlenia z vnútra valca
  texture.offset.x = 1;                             // (ak by bol text v opačnom smere, zmažte tieto 2 riadky)

  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  const mesh = new THREE.Mesh(geometry, material);  // valec obklopuje kameru v strede
  scene.add(mesh);
  var gyroTargetY = 0, gyroTargetX = 0;             // ciele pre náklon z gyroskopu

  // ZMENA 3: Sprísnili sme oddialenie, aby sa video nedalo "zmenšiť" na maličké
  const maxFov = 50; // Najviac oddialené
  const minFov = 15; // Najviac priblížené

  // Zoom kolieskom myši (so stlačeným CTRL)
  container.addEventListener('wheel', function(e) {
    if (!e.ctrlKey) return; 
    e.preventDefault();
    camera.fov += e.deltaY * 0.05;
    camera.fov = Math.max(minFov, Math.min(camera.fov, maxFov)); 
    camera.updateProjectionMatrix();
  }, { passive: false });

  // Zoom na mobiloch (Pinch gestá)
  let touchDistance = 0;
  container.addEventListener('touchstart', function(e) {
    if(e.touches.length === 2) {
      touchDistance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
    }
  });
  container.addEventListener('touchmove', function(e) {
    if(e.touches.length === 2) {
      const newDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
      camera.fov += (touchDistance - newDist) * 0.2;
      camera.fov = Math.max(minFov, Math.min(camera.fov, maxFov));
      camera.updateProjectionMatrix();
      touchDistance = newDist;
    }
  }, { passive: false });

  // Zoom Tlačidlami
  const zoomInBtn = document.getElementById('vr-zoom-in');
  const zoomOutBtn = document.getElementById('vr-zoom-out');
  zoomInBtn.addEventListener('click', function(e) {
    e.preventDefault();
    camera.fov = Math.max(minFov, camera.fov - 15); camera.updateProjectionMatrix();
  });
  zoomOutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    camera.fov = Math.min(maxFov, camera.fov + 15); camera.updateProjectionMatrix();
  });

  // Udržiavanie správnych rozmerov pri zmene okna
  window.addEventListener('resize', function() {
    if(!document.getElementById('video-container').classList.contains('minimized')) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }, false);

  // Animačná slučka
  // pauza renderu, keď hero nie je na obrazovke (šetrí CPU/batériu)
  var heroVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries){
      heroVisible = entries[0].isIntersecting;
      if (heroVisible) { video.play().catch(function(){}); } else { video.pause(); }
    }, { threshold: 0.05 }).observe(container);
  }

  function animate() {
      requestAnimationFrame(animate);
      if (!heroVisible) return;
      mesh.rotation.y += (gyroTargetY - mesh.rotation.y) * 0.08;
      mesh.rotation.x += (gyroTargetX - mesh.rotation.x) * 0.08;
      controls.update();
      renderer.render(scene, camera);
  }
  animate();

  // ----- OVLÁDANIE VIDEA (Play, Slider, Minimalizácia) -----
  const playBtn = document.getElementById('vr-play');
  const slider = document.getElementById('vr-slider');
  const minBtn = document.getElementById('vr-minimize');
  const heroVid = document.getElementById('video-container');

  playBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (video.paused) { video.play(); playBtn.textContent = '⏸'; } 
    else { video.pause(); playBtn.textContent = '▶'; }
  });

  // čas + časová os
  const fmt = function(s){ return isNaN(s) ? '0:00' : Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'); };
  const curEl = document.getElementById('vr-cur');
  const durEl = document.getElementById('vr-dur');
  video.addEventListener('loadedmetadata', function(){ durEl.textContent = fmt(video.duration); });
  video.addEventListener('timeupdate', function() {
    if(video.duration) {
      slider.value = (video.currentTime / video.duration) * 100;
      curEl.textContent = fmt(video.currentTime);
    }
  });

  slider.addEventListener('input', function() {
    video.currentTime = (slider.value / 100) * video.duration;
  });

  // Minimalizovanie do rohu a návrat
  minBtn.addEventListener('click', function(e) {
    e.preventDefault();
    heroVid.classList.toggle('minimized');
    
    if(heroVid.classList.contains('minimized')) {
       camera.aspect = 320 / 180; 
       camera.updateProjectionMatrix();
       renderer.setSize(320, 180);
    } else {
       setTimeout(function() {
         camera.aspect = window.innerWidth / window.innerHeight; 
         camera.updateProjectionMatrix();
         renderer.setSize(window.innerWidth, window.innerHeight);
       }, 150);
    }
  });

  // Celá obrazovka
  const fsBtn = document.getElementById('vr-fs');
  fsBtn.addEventListener('click', function(){
    const el = document.querySelector('.hero');
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!document.fullscreenElement && req) { req.call(el); }
    else if (document.exitFullscreen) { document.exitFullscreen(); }
  });

  // Gyroskop na mobile – zakrivené plátno reaguje na náklon telefónu (VR pocit)
  function enableGyro(){
    window.addEventListener('deviceorientation', function(ev){
      if (ev.beta == null) return;
      var yaw   = THREE.MathUtils.degToRad(ev.gamma || 0) * 0.5;
      var pitch = THREE.MathUtils.degToRad((ev.beta || 0) - 45) * 0.4;
      gyroTargetY = THREE.MathUtils.clamp(-yaw, -0.6, 0.6);
      gyroTargetX = THREE.MathUtils.clamp(-pitch, -0.3, 0.3);
    });
  }
  container.addEventListener('click', function(){
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
      DeviceOrientationEvent.requestPermission().then(function(st){ if (st === 'granted') enableGyro(); }).catch(function(){});
    } else { enableGyro(); }
  }, { once: true });

  // ----- OVLÁDANIE KLÁVESNICOU -----
  window.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') {
      video.currentTime = Math.min(video.duration, video.currentTime + 5);
    } else if (e.key === 'ArrowLeft') {
      video.currentTime = Math.max(0, video.currentTime - 5);
    } else if (e.key === ' ') {
      if(document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault(); 
        if (video.paused) { video.play(); playBtn.textContent = '⏸'; } 
        else { video.pause(); playBtn.textContent = '▶'; }
      }
    }
  });

})();
(function(){
  var bar=document.getElementById('scrollProgress'),
      cue=document.querySelector('.scrollcue');
  function onScroll(){
    var h=document.documentElement,
        max=(h.scrollHeight-h.clientHeight)||1,
        p=Math.min(100,(h.scrollTop/max)*100);
    if(bar) bar.style.width=p+'%';
    if(cue){ if(h.scrollTop>120) cue.classList.add('hide'); else cue.classList.remove('hide'); }
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
})();