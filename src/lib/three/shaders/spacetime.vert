// src/lib/three/shaders/spacetime.vert
// Displaces grid vertices to visualise Kerr metric spatial curvature (embedding diagram).
// Flamm paraboloid + frame-dragging azimuthal twist.

precision mediump float;

uniform float u_M;
uniform float u_a;
uniform float u_time;

varying float v_curvature;

void main() {
  vec3 pos = position;

  float r     = length(pos.xz);
  float r_safe = max(r, 0.15);

  // Flamm paraboloid depression: embed(r) = sqrt(6M/r)
  float embed = sqrt(max(0.0, 6.0 * u_M / r_safe)) * 0.38;
  pos.y -= embed;

  // Frame-dragging azimuthal twist
  float sigma = r_safe * r_safe + u_a * u_a;
  float omega = (2.0 * u_M * u_a * r_safe) / (sigma * sigma);
  float twist = omega * u_time * 0.08;
  float cosT  = cos(twist);
  float sinT  = sin(twist);
  float xNew  = cosT * pos.x - sinT * pos.z;
  float zNew  = sinT * pos.x + cosT * pos.z;
  pos.x = xNew;
  pos.z = zNew;

  // Curvature magnitude for fragment shader colouring
  v_curvature = clamp(u_M / r_safe, 0.0, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
