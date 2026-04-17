// src/lib/three/shaders/throat.frag
// Purple glow, bloom-ready. Brightens with pulse amplitude, rim glow at edges.

precision mediump float;

uniform float u_pulse;
uniform float u_a0;
uniform float u_time;

varying vec3 vNormal;

void main() {
  // --purple #a070e0 → vec3(0.627, 0.439, 0.878)
  vec3 base = vec3(0.627, 0.439, 0.878);

  // Fresnel-like rim glow
  float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.5);

  // Pulse brightness
  float pb = 1.0 + abs(u_pulse / max(u_a0, 0.01)) * 2.5;

  vec3 col   = base * pb + vec3(0.3, 0.1, 0.6) * rim;
  float alpha = 0.35 + rim * 0.55;

  gl_FragColor = vec4(col, alpha);
}
