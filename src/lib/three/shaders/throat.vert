// src/lib/three/shaders/throat.vert
// Scales the throat sphere to a0 + δa(t) and adds a surface ripple.

uniform float u_pulse;   // δa(t) from Worker
uniform float u_time;
uniform float u_a0;      // equilibrium throat radius

varying vec3 vNormal;

void main() {
  vNormal = normalize(normalMatrix * normal);

  float radius  = u_a0 + u_pulse;
  vec3  pos     = normalize(position) * radius;

  // Subtle surface ripple
  float ripple = 0.015 * sin(position.x * 8.0 + u_time * 3.0)
                       * sin(position.y * 6.0 + u_time * 2.3);
  pos += normalize(position) * ripple;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
