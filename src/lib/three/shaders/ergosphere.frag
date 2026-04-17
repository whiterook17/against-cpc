// src/lib/three/shaders/ergosphere.frag
// Soft green fill for the ergosphere volume. Applied to BackSide sphere.

precision mediump float;

uniform float u_time;

void main() {
  // --green #40d080 → vec3(0.251, 0.816, 0.502)
  float shimmer = 0.04 * sin(u_time * 1.2);
  float alpha   = 0.06 + shimmer;
  vec3  col     = vec3(0.063, 0.408, 0.188);

  gl_FragColor = vec4(col, alpha);
}
