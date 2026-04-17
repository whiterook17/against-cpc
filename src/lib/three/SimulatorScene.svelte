<!-- src/lib/three/SimulatorScene.svelte -->
<!-- Threlte Canvas wrapping the full Kerr wormhole scene. Svelte 5 runes. -->
<!-- Workers are managed here; scene objects live in SimulatorSceneObjects.svelte. -->
<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import SimulatorSceneObjects from './SimulatorSceneObjects.svelte';
  import { params }   from '$lib/stores/params.js';
  import { computed } from '$lib/stores/computed.js';
  import { browser }  from '$app/environment';
  import { onDestroy } from 'svelte';

  // Perturbation trigger — passed in so the parent page can call it
  interface Props {
    perturbRef?: (fn: () => void) => void;
  }
  let { perturbRef }: Props = $props();

  // geodesicWorker as $state so it can be passed reactively as a prop.
  // Closures in the browser block use the local `gw` const, not this variable.
  let geodesicWorker: Worker | null = $state(null);

  // Expose a perturb callback to parent
  let _perturbFn: (() => void) | null = null;
  $effect(() => {
    if (perturbRef) perturbRef(() => _perturbFn?.());
  });

  function setPerturbFn(fn: () => void) {
    _perturbFn = fn;
  }

  if (browser) {
    // Capture workers as local consts so closures below reference stable values
    const pw = new Worker(
      new URL('../workers/physics.worker.js', import.meta.url),
      { type: 'module' }
    );
    const gw = new Worker(
      new URL('../workers/geodesic.worker.js', import.meta.url),
      { type: 'module' }
    );
    geodesicWorker = gw; // assign $state so prop update is reactive

    pw.onmessage = ({ data }) => {
      if (data.type === 'COMPUTED_STATE') {
        computed.set(data.payload);
      }
    };

    // Send params to workers whenever store changes
    const unsubParams = params.subscribe((p) => {
      pw.postMessage({ type: 'UPDATE_PARAMS', payload: p });
      gw.postMessage({
        type: 'INTEGRATE_GEODESICS',
        payload: { ...p, n_particles: 12, n_steps: 500, dt: 0.02, initial_conditions: null },
      });
    });

    // Pause physics tick when tab is hidden
    const handleVisibility = () => {
      pw.postMessage({
        type: document.visibilityState === 'hidden' ? 'PAUSE' : 'RESUME',
      });
    };
    document.addEventListener('visibilitychange', handleVisibility);

    onDestroy(() => {
      unsubParams();
      document.removeEventListener('visibilitychange', handleVisibility);
      pw.terminate();
      gw.terminate();
    });
  }
</script>

<div class="scene-wrap" role="img" aria-label="Real-time simulation of a rotating Kerr wormhole spacetime. Adjust sliders in the control panel to change the geometry.">
  <Canvas rendererParameters={{ antialias: true }} dpr={browser ? window.devicePixelRatio : 1}>
    <T.PerspectiveCamera makeDefault fov={60} near={0.1} far={200} position={[0, 8, 20]}>
      <OrbitControls enableDamping dampingFactor={0.08} minDistance={4} maxDistance={60} />
    </T.PerspectiveCamera>
    <SimulatorSceneObjects
      {geodesicWorker}
      {setPerturbFn}
    />
  </Canvas>
</div>

<style>
  .scene-wrap {
    width: 100%;
    height: 100%;
    background: var(--navy);
  }
</style>
