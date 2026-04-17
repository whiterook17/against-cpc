// src/lib/three/shaders/spacetime.frag
// Colours the curvature grid from flat-space navy through teal to high-curvature gold.

precision mediump float;

varying float v_curvature;

void main() {
  // --navy  #0b1120 → vec3(0.043, 0.067, 0.125)
  // --teal  #00c8c8 → vec3(0.0, 0.784, 0.784)
  // --gold  #e8a020 → vec3(0.910, 0.627, 0.125)
  vec3 col_flat = vec3(0.043, 0.067, 0.125);
  vec3 mid      = vec3(0.0,   0.784, 0.784);
  vec3 peak     = vec3(0.910, 0.627, 0.125);

  vec3 col = mix(col_flat, mid,  clamp(v_curvature * 2.0,       0.0, 1.0));
  col      = mix(col,  peak, clamp(v_curvature * 2.0 - 1.0, 0.0, 1.0));

  gl_FragColor = vec4(col, 0.55);
}
