<!-- src/lib/components/ParameterSlider.svelte -->
<!-- Physics slider with live GSAP-tweened readout. Svelte 5 runes. -->
<script lang="ts">
  import { params } from '$lib/stores/params.js';
  import { gsap }   from 'gsap';

  interface Props {
    key:         string;
    label:       string;
    min:         number;
    max:         number;
    step:        number;
    unit:        string;
    description: string;
  }

  let { key, label, min, max, step, unit, description }: Props = $props();

  // Display value tweens smoothly; actual param updates immediately.
  // Use 0 as initial state; $effect below will tween to the real value on first run.
  let displayValue = $state(0);

  $effect(() => {
    const target = $params[key as keyof typeof $params] as number;
    gsap.to({ v: displayValue }, {
      v: target,
      duration: 0.25,
      ease: 'power1.out',
      onUpdate() {
        // @ts-ignore
        displayValue = this.targets()[0].v;
      },
    });
  });

  function onInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    params.update((p) => ({ ...p, [key]: val }));
  }
</script>

<div class="slider-wrap">
  <div class="slider-header">
    <span class="slider-label">{label}</span>
    <span class="slider-value">{displayValue.toFixed(3)}<span class="unit">{unit}</span></span>
  </div>
  <input
    type="range"
    {min}
    {max}
    {step}
    value={$params[key as keyof typeof $params]}
    oninput={onInput}
    class="slider"
    aria-label={label}
  />
  <p class="slider-desc">{description}</p>
</div>

<style>
  .slider-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .slider-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .slider-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--sub);
  }
  .slider-value {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--teal);
  }
  .unit {
    font-size: 10px;
    color: var(--sub);
    margin-left: 3px;
  }
  .slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 3px;
    background: var(--dim);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--teal);
    cursor: pointer;
    border: 2px solid var(--navy);
  }
  .slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--teal);
    cursor: pointer;
    border: 2px solid var(--navy);
  }
  .slider-desc {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--sub);
    line-height: 1.4;
    margin: 0;
  }
</style>
