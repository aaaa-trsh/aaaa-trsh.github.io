export default `
    varying vec2 vUv;
    varying float noise;
    varying float noise2;
    varying vec3 pos;
    varying vec3 ec_pos;

    void main() {
        float h = 0.2;
        float m = (noise*2.)+1.2;

        vec3 snow = vec3(1.0); // snow
        vec3 grass = vec3(0.12, (clamp(noise2, 0., 1.)*0.1)+0.3, ((ceil(m*10.-3.)/10.)-.4)); // grass
        vec3 sand = vec3(0.9, 0.9, 0.6); // snad
        vec3 oceanFloor = vec3(0.5, 0.6, .6) * ceil((m + .6)*15.)/4.5-2.2;
        
        if (noise2-1. < 0.13) {
            grass = vec3(ceil((m + .3)*10.)/10. -0.6, .5, 0.2);
            snow = grass;
        }
        
        if (abs(pos.y) > .5) {
            grass = vec3(1);
            sand = vec3(1);
        }

        vec3 c = vec3(0);
        if (h/m < 0.18) {
            c = snow;
        } else {
            if (h/m < 0.26) {
                c = grass;
            } else if (h/m < 0.28) {
                c = sand;
            } else {
                c = oceanFloor;
            }
        }
        vec3 ec_normal = normalize(cross(dFdx(ec_pos), dFdy(ec_pos)));
        float normalBrightness = (clamp(ceil(dot(ec_normal, vec3(1))*10.)/10., .7, 1.));
        gl_FragColor = vec4(c*(normalBrightness) + vec3(0.1, 0.1, 0.2)*(1.-normalBrightness), 1.);
    }`;