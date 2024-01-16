export default `
varying vec2 vUv;
//uniform sampler2D tDiffuse;
varying float noise;
varying float noise2;
varying vec3 pos;
varying vec3 ec_pos;

void main() {
    //vec3 diffuse = texture2D(tDiffuse, vUv).rgb;
    vec3 ec_normal = normalize(cross(dFdx(ec_pos), dFdy(ec_pos)));
    float normalBrightness = (clamp(ceil(dot(ec_normal, vec3(1, 1, 2)) - 0.3 *5.)/5. + 0.8, .7, 1.));

    gl_FragColor = mix(vec4(vec3(.1, .7, .9) * normalBrightness, 0.4),  vec4(1), pow(dot(ec_normal, vec3(1))/1.7, 60.));
}`;