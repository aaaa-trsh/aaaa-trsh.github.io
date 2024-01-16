export default `
varying vec2 vUv;
varying vec2 frag_position;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    frag_position = cameraPosition.xy;
}
`;