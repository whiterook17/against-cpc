<!-- src/lib/three/SimulatorSceneObjects.svelte -->
<!-- All Three.js scene objects. Must be a child of <Canvas>. Svelte 5 runes. -->
<script lang="ts">
  import { useThrelte, useTask, T } from '@threlte/core';
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap';
  import * as THREE from 'three';
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
  import { RenderPass }      from 'three/examples/jsm/postprocessing/RenderPass.js';
  import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

  import spacetimeVert from './shaders/spacetime.vert?raw';
  import spacetimeFrag from './shaders/spacetime.frag?raw';
  import throatVert    from './shaders/throat.vert?raw';
  import throatFrag    from './shaders/throat.frag?raw';
  import ergosphereFrag from './shaders/ergosphere.frag?raw';

  import { computed } from '$lib/stores/computed.js';
  import { params }   from '$lib/stores/params.js';

  interface Props {
    geodesicWorker: Worker | null;
    setPerturbFn: (fn: () => void) => void;
  }
  let { geodesicWorker, setPerturbFn }: Props = $props();

  const { renderer, scene, camera, size, invalidate } = useThrelte();

  // --- Scene objects (created in onMount) ---
  let gridMesh:       THREE.Mesh | null         = null;
  let throatMesh:     THREE.Mesh | null         = null;
  let ergosphereMesh: THREE.Mesh | null         = null;
  let torusMesh:      THREE.Mesh | null         = null;
  let mouthMeshL:     THREE.Mesh | null         = null;
  let mouthMeshR:     THREE.Mesh | null         = null;
  let fieldLines:     THREE.LineSegments | null = null;
  let geodesicLines:  THREE.LineSegments | null = null;
  let echoRing:       THREE.Mesh | null         = null;
  let composer:       EffectComposer | null     = null;
  let simTime = 0;

  // Shader uniforms
  const gridUniforms = {
    u_M:    { value: 1.0 },
    u_a:    { value: 0.85 },
    u_time: { value: 0.0 },
  };
  const throatUniforms = {
    u_pulse: { value: 0.0 },
    u_time:  { value: 0.0 },
    u_a0:    { value: 1.2 },
  };
  const ergoUniforms = {
    u_time: { value: 0.0 },
  };

  onMount(() => {
    const ren = renderer;
    const scn = scene;
    // camera is a CurrentWritable<THREE.Camera> — use .current for the raw instance
    const cam = camera.current;
    if (!ren || !scn || !cam) return;

    // Crisp rendering on high-DPI screens
    ren.setPixelRatio(window.devicePixelRatio);

    // --- Spacetime grid ---
    const gridGeo = new THREE.PlaneGeometry(22, 22, 32, 32);
    gridGeo.rotateX(-Math.PI / 2);
    const gridMat = new THREE.ShaderMaterial({
      vertexShader:   spacetimeVert,
      fragmentShader: spacetimeFrag,
      uniforms:       gridUniforms,
      transparent:    true,
      wireframe:      true,
      depthWrite:     false,
    });
    gridMesh = new THREE.Mesh(gridGeo, gridMat);
    scn.add(gridMesh);

    // --- Ergosphere ---
    const ergoGeo = new THREE.SphereGeometry(1, 32, 32);
    const ergoMat = new THREE.ShaderMaterial({
      vertexShader:   'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: ergosphereFrag,
      uniforms:       ergoUniforms,
      transparent:    true,
      side:           THREE.BackSide,
      depthWrite:     false,
    });
    ergosphereMesh = new THREE.Mesh(ergoGeo, ergoMat);
    scn.add(ergosphereMesh);

    // --- Torus ---
    const torusGeo = new THREE.TorusGeometry(4, 0.6, 16, 64);
    const torusMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00c8c8),
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.rotation.x = Math.PI / 2;
    scn.add(torusMesh);

    // --- Throat ---
    const throatGeo = new THREE.SphereGeometry(1, 32, 32);
    const throatMat = new THREE.ShaderMaterial({
      vertexShader:   throatVert,
      fragmentShader: throatFrag,
      uniforms:       throatUniforms,
      transparent:    true,
      side:           THREE.DoubleSide,
    });
    throatMesh = new THREE.Mesh(throatGeo, throatMat);
    scn.add(throatMesh);

    // --- Wormhole mouths (two rings) ---
    const mouthGeo = new THREE.RingGeometry(0.8, 1.2, 64);
    const mouthMatL = new THREE.MeshBasicMaterial({ color: 0xa070e0, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const mouthMatR = new THREE.MeshBasicMaterial({ color: 0xa070e0, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    mouthMeshL = new THREE.Mesh(mouthGeo, mouthMatL);
    mouthMeshR = new THREE.Mesh(mouthGeo, mouthMatR);
    mouthMeshL.position.set(-5, 0, 0);
    mouthMeshR.position.set( 5, 0, 0);
    scn.add(mouthMeshL, mouthMeshR);

    // --- Frame-dragging field lines ---
    const flCount  = 20;
    const flPoints = 30;
    const flPosArr = new Float32Array(flCount * (flPoints - 1) * 2 * 3); // segments
    const flGeo    = new THREE.BufferGeometry();
    flGeo.setAttribute('position', new THREE.BufferAttribute(flPosArr, 3));
    const flMat = new THREE.LineBasicMaterial({ color: 0x00c8c8, transparent: true, opacity: 0.35 });
    fieldLines = new THREE.LineSegments(flGeo, flMat);
    scn.add(fieldLines);

    // --- Geodesic paths ---
    const geodPosArr = new Float32Array(12 * 499 * 2 * 3);
    const geodGeo    = new THREE.BufferGeometry();
    geodGeo.setAttribute('position', new THREE.BufferAttribute(geodPosArr, 3));
    const geodMat = new THREE.LineBasicMaterial({ color: 0xe8a020, transparent: true, opacity: 0.5 });
    geodesicLines = new THREE.LineSegments(geodGeo, geodMat);
    scn.add(geodesicLines);

    // --- Echo ring (hidden, revealed on perturb) ---
    const echoGeo = new THREE.TorusGeometry(1.2, 0.05, 8, 64);
    const echoMat = new THREE.MeshBasicMaterial({ color: 0xa070e0, transparent: true, opacity: 0 });
    echoRing = new THREE.Mesh(echoGeo, echoMat);
    echoRing.rotation.x = Math.PI / 2;
    scn.add(echoRing);

    // --- Bloom post-processing ---
    composer = new EffectComposer(ren);
    composer.addPass(new RenderPass(scn, cam as THREE.Camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2($size.width || 800, $size.height || 600),
      0.8, 0.4, 0.85
    );
    composer.addPass(bloomPass);

    // --- Geodesic worker response ---
    if (geodesicWorker) {
      geodesicWorker.onmessage = ({ data }) => {
        if (data.type !== 'GEODESIC_PATHS') return;
        const { paths, n, n_steps } = data.payload;
        if (!geodesicLines) return;
        const pos = (geodesicLines.geometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array;
        let idx = 0;
        for (let p = 0; p < n; p++) {
          for (let s = 0; s < n_steps - 1; s++) {
            const x0 = paths[(p * n_steps + s) * 2];
            const y0 = paths[(p * n_steps + s) * 2 + 1];
            const x1 = paths[(p * n_steps + s + 1) * 2];
            const y1 = paths[(p * n_steps + s + 1) * 2 + 1];
            if (!isFinite(x0) || !isFinite(y0) || !isFinite(x1) || !isFinite(y1)) {
              idx += 6; continue;
            }
            pos[idx++] = x0; pos[idx++] = 0; pos[idx++] = y0;
            pos[idx++] = x1; pos[idx++] = 0; pos[idx++] = y1;
          }
        }
        geodesicLines.geometry.getAttribute('position').needsUpdate = true;
      };
    }

    // Expose perturb function
    setPerturbFn(triggerPerturbation);

    return () => {
      // Cleanup geometries/materials
      gridMesh?.geometry.dispose();
      (gridMesh?.material as THREE.Material)?.dispose();
      throatMesh?.geometry.dispose();
      (throatMesh?.material as THREE.Material)?.dispose();
      ergosphereMesh?.geometry.dispose();
      (ergosphereMesh?.material as THREE.Material)?.dispose();
      torusMesh?.geometry.dispose();
      (torusMesh?.material as THREE.Material)?.dispose();
      fieldLines?.geometry.dispose();
      (fieldLines?.material as THREE.Material)?.dispose();
      geodesicLines?.geometry.dispose();
      (geodesicLines?.material as THREE.Material)?.dispose();
      echoRing?.geometry.dispose();
      (echoRing?.material as THREE.Material)?.dispose();
      composer?.dispose();
    };
  });

  // --- Per-frame update ---
  useTask((delta) => {
    simTime += delta;
    const c = $computed;
    const p = $params;

    if (!renderer || !scene) return;

    // Update shader uniforms from computed store
    const a = p.a_over_M * p.M;
    gridUniforms.u_M.value    = p.M;
    gridUniforms.u_a.value    = a;
    gridUniforms.u_time.value = simTime;

    throatUniforms.u_time.value  = simTime;
    throatUniforms.u_a0.value    = p.a0;
    throatUniforms.u_pulse.value = c.throat_displacement;

    ergoUniforms.u_time.value = simTime;

    // Scale ergosphere mesh to computed radius
    if (ergosphereMesh && c.ergosphere_radius > 0) {
      ergosphereMesh.scale.setScalar(c.ergosphere_radius);
    }

    // Slow torus rotation
    if (torusMesh) {
      torusMesh.rotation.z += delta * 0.08;
    }

    // Update field lines from Worker data
    if (fieldLines && c.field_lines) {
      const fl   = c.field_lines as Float32Array;
      const pos  = (fieldLines.geometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array;
      const count   = 20;
      const pts     = 30;
      let idx = 0;
      for (let l = 0; l < count; l++) {
        for (let pt = 0; pt < pts - 1; pt++) {
          const base0 = (l * pts + pt) * 2;
          const base1 = (l * pts + pt + 1) * 2;
          if (base1 * 2 + 1 >= fl.length) { idx += 6; continue; }
          pos[idx++] = fl[base0];     pos[idx++] = 0; pos[idx++] = fl[base0 + 1];
          pos[idx++] = fl[base1];     pos[idx++] = 0; pos[idx++] = fl[base1 + 1];
        }
      }
      fieldLines.geometry.getAttribute('position').needsUpdate = true;
    }

    // Render via bloom composer instead of Threlte's auto-render
    if (composer) {
      composer.render(delta);
    }
  }, { autoInvalidate: false });

  // --- Perturbation GSAP timeline ---
  function triggerPerturbation() {
    if (!throatMesh || !echoRing) return;

    const tl = gsap.timeline();

    // Perturb throat: scale up, then oscillate back
    tl.to(throatUniforms.u_pulse, {
      value: 0.4,
      duration: 0.12,
      ease: 'power4.out',
    })
    .to(throatUniforms.u_pulse, {
      value: 0.0,
      duration: 2.5,
      ease: 'elastic.out(1, 0.25)',
    });

    // Echo ring: expand outward from throat, fade out
    if (echoRing) {
      const mat = echoRing.material as THREE.MeshBasicMaterial;
      tl.set(echoRing, { 'scale.x': 1, 'scale.y': 1, 'scale.z': 1 }, '<0.15')
        .to(mat, { opacity: 0.7, duration: 0.1 }, '<')
        .to(echoRing.scale, { x: 5, y: 5, z: 5, duration: 1.8, ease: 'power2.out' }, '<')
        .to(mat, { opacity: 0, duration: 0.6, ease: 'power1.in' }, '<0.8');
    }
  }
</script>

<T.AmbientLight intensity={0.3} />
<T.DirectionalLight position={[10, 20, 10]} intensity={0.8} />
