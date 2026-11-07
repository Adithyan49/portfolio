import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const HeroIcons3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeIcon, setActiveIcon] = useState<string>('AI Core');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Probe for software WebGL renderer to tune performance appropriately
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x7c5cfc, 2.5);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    const cyanLight = new THREE.DirectionalLight(0x00d4ff, 2.8);
    cyanLight.position.set(-6, -4, 4);
    scene.add(cyanLight);

    const rimLight = new THREE.PointLight(0xffffff, 1.8, 15);
    rimLight.position.set(0, 4, 2);
    scene.add(rimLight);

    // Group to hold all 5 tech icons
    const iconsGroup = new THREE.Group();
    scene.add(iconsGroup);

    // Materials
    const metalMat = (color: number, roughness = 0.25, metalness = 0.85) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
      });

    const glowMat = (color: number) =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.4,
      });

    // 1. Central Hero Icon: AI & Neural Network Hub
    const aiGroup = new THREE.Group();
    aiGroup.position.set(0, 0.1, 0);

    const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const coreMesh = new THREE.Mesh(coreGeo, metalMat(0x7c5cfc, 0.2, 0.9));
    aiGroup.add(coreMesh);

    const innerCoreGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const innerCore = new THREE.Mesh(innerCoreGeo, glowMat(0x00d4ff));
    aiGroup.add(innerCore);

    // Orbital ring
    const ringGeo = new THREE.TorusGeometry(1.3, 0.035, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, metalMat(0xa78bfa, 0.3, 0.7));
    ringMesh.rotation.x = Math.PI / 3;
    aiGroup.add(ringMesh);

    // Neural satellite nodes
    const satelliteNodes: THREE.Mesh[] = [];
    const satGeo = new THREE.SphereGeometry(0.12, 12, 12);
    for (let i = 0; i < 4; i++) {
      const sat = new THREE.Mesh(satGeo, glowMat(0x00d4ff));
      aiGroup.add(sat);
      satelliteNodes.push(sat);
    }
    iconsGroup.add(aiGroup);

    // 2. Python Symbol (Top-Right)
    const pythonGroup = new THREE.Group();
    pythonGroup.position.set(2.4, 1.8, -0.6);

    const pyTorus1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.14, 16, 32, Math.PI * 1.3),
      metalMat(0x3874a9, 0.3, 0.8)
    );
    pyTorus1.rotation.z = 0.3;
    pythonGroup.add(pyTorus1);

    const pyTorus2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.14, 16, 32, Math.PI * 1.3),
      metalMat(0xf7c93e, 0.3, 0.8)
    );
    pyTorus2.rotation.z = Math.PI + 0.3;
    pyTorus2.position.set(0.15, -0.15, 0);
    pythonGroup.add(pyTorus2);

    const pyEye1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), glowMat(0xffffff));
    pyEye1.position.set(0.3, 0.35, 0.15);
    pythonGroup.add(pyEye1);

    iconsGroup.add(pythonGroup);

    // 3. C++ Symbol (Top-Left)
    const cppGroup = new THREE.Group();
    cppGroup.position.set(-2.5, 1.6, -0.5);

    const cppHexGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.22, 6);
    const cppHex = new THREE.Mesh(cppHexGeo, metalMat(0x00599c, 0.3, 0.8));
    cppHex.rotation.x = Math.PI / 2;
    cppGroup.add(cppHex);

    // Plus signs (Cross bars)
    const crossBar1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.35, 0.08),
      glowMat(0x00d4ff)
    );
    crossBar1.position.set(0.45, 0.1, 0.15);
    const crossBar2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.1, 0.08),
      glowMat(0x00d4ff)
    );
    crossBar2.position.set(0.45, 0.1, 0.15);
    cppGroup.add(crossBar1, crossBar2);

    const crossBar3 = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.35, 0.08),
      glowMat(0x7c5cfc)
    );
    crossBar3.position.set(0.78, -0.1, 0.15);
    const crossBar4 = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.1, 0.08),
      glowMat(0x7c5cfc)
    );
    crossBar4.position.set(0.78, -0.1, 0.15);
    cppGroup.add(crossBar3, crossBar4);

    iconsGroup.add(cppGroup);

    // 4. Code Symbol "< / >" (Bottom-Left)
    const codeGroup = new THREE.Group();
    codeGroup.position.set(-2.2, -1.8, -0.4);

    // Left bracket "<"
    const leftArm1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.08, 0.08),
      metalMat(0x00d4ff, 0.3, 0.8)
    );
    leftArm1.rotation.z = Math.PI / 4;
    leftArm1.position.set(-0.35, 0.18, 0);

    const leftArm2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.08, 0.08),
      metalMat(0x00d4ff, 0.3, 0.8)
    );
    leftArm2.rotation.z = -Math.PI / 4;
    leftArm2.position.set(-0.35, -0.18, 0);

    // Slash "/"
    const slash = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.08, 0.08),
      glowMat(0xa78bfa)
    );
    slash.rotation.z = Math.PI / 2.7;

    // Right bracket ">"
    const rightArm1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.08, 0.08),
      metalMat(0x7c5cfc, 0.3, 0.8)
    );
    rightArm1.rotation.z = -Math.PI / 4;
    rightArm1.position.set(0.35, 0.18, 0);

    const rightArm2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.08, 0.08),
      metalMat(0x7c5cfc, 0.3, 0.8)
    );
    rightArm2.rotation.z = Math.PI / 4;
    rightArm2.position.set(0.35, -0.18, 0);

    codeGroup.add(leftArm1, leftArm2, slash, rightArm1, rightArm2);
    iconsGroup.add(codeGroup);

    // 5. Database Symbol (Bottom-Right)
    const dbGroup = new THREE.Group();
    dbGroup.position.set(2.2, -1.7, -0.5);

    const diskGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.22, 28);
    const dbDisk1 = new THREE.Mesh(diskGeo, metalMat(0x475569, 0.25, 0.9));
    dbDisk1.position.y = 0.35;

    const dbDisk2 = new THREE.Mesh(diskGeo, metalMat(0x334155, 0.25, 0.9));
    dbDisk2.position.y = 0;

    const dbDisk3 = new THREE.Mesh(diskGeo, metalMat(0x1e293b, 0.25, 0.9));
    dbDisk3.position.y = -0.35;

    // LED stripe on disk 2
    const ledRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.66, 0.02, 12, 32),
      glowMat(0x00d4ff)
    );
    ledRing.rotation.x = Math.PI / 2;
    dbGroup.add(dbDisk1, dbDisk2, dbDisk3, ledRing);
    iconsGroup.add(dbGroup);

    // Interactive mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.45;
      targetY = y * 0.45;
    };

    container.addEventListener('mousemove', onPointerMove);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 480;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop using standard high-precision performance timer
    const startTime = performance.now();
    let frameId = 0;

    const tick = () => {
      const elapsed = (performance.now() - startTime) * 0.001;

      // Damped mouse follow
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      iconsGroup.rotation.y = mouseX * 0.5;
      iconsGroup.rotation.x = -mouseY * 0.5;

      // Gentle floating and rotational dynamics
      // 1. AI Core
      coreMesh.rotation.y = elapsed * 0.5;
      coreMesh.rotation.x = elapsed * 0.3;
      ringMesh.rotation.z = elapsed * 0.6;
      innerCore.scale.setScalar(0.9 + Math.sin(elapsed * 2.5) * 0.12);

      satelliteNodes.forEach((node, i) => {
        const angle = elapsed * 0.9 + (i * Math.PI) / 2;
        node.position.set(Math.cos(angle) * 1.3, Math.sin(elapsed + i) * 0.25, Math.sin(angle) * 1.3);
      });

      // 2. Python
      pythonGroup.position.y = 1.8 + Math.sin(elapsed * 1.2 + 1) * 0.12;
      pythonGroup.rotation.y = elapsed * 0.4;
      pythonGroup.rotation.z = Math.sin(elapsed * 0.8) * 0.1;

      // 3. C++
      cppGroup.position.y = 1.6 + Math.sin(elapsed * 1.1 + 2) * 0.12;
      cppGroup.rotation.y = -elapsed * 0.45;
      cppGroup.rotation.x = Math.PI / 2 + Math.cos(elapsed * 0.7) * 0.12;

      // 4. Code
      codeGroup.position.y = -1.8 + Math.sin(elapsed * 1.3 + 3) * 0.12;
      codeGroup.rotation.y = elapsed * 0.35;
      codeGroup.rotation.z = Math.sin(elapsed * 1.0) * 0.08;

      // 5. Database
      dbGroup.position.y = -1.7 + Math.sin(elapsed * 1.0 + 4) * 0.12;
      dbGroup.rotation.y = -elapsed * 0.3;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    tick();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onPointerMove);

      // Dispose Three.js resources
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-[480px] h-[300px] sm:h-[400px] lg:h-[440px] flex items-center justify-center overflow-hidden">
      <div
        ref={mountRef}
        style={{ touchAction: 'pan-y' }}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
      />

      {/* Futuristic caption indicator */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-wide pointer-events-none shadow-lg whitespace-nowrap">
        <span className="text-[#00D4FF]">3D Core</span>
        <span>·</span>
        <span className="text-slate-300">C++ · Python · AI · DB</span>
      </div>
    </div>
  );
};
