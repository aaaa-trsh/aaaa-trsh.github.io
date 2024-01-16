export default `
#include <packing>

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform float cameraNear;
uniform float cameraFar;
uniform float cameraDistance;
uniform float cameraAspect;
uniform vec3 cameraPos;
uniform float startTime;

int numScatterPoints = 15;
int numOpticalDepthPoints = 15;
float atmosphereRad;
float planetRad;//?? idk
float densityFalloff = -0.5;
vec3 dirToSun = vec3(1, 1, 0);

vec2 readDepth(sampler2D depthSampler, vec2 coord) {
    float fragCoordZ = texture2D(depthSampler, coord).x;
    float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar * 3.);
    float depth = viewZToOrthographicDepth(viewZ, cameraNear, (cameraFar / 1000.));
    return vec2(depth, viewZ); 
}

vec2 rsi(vec3 r0, vec3 rd, vec3 s0, float sr) {
    float a = dot(rd, rd);
    vec3 s0_r0 = r0 - s0;
    float b = 2.0 * dot(rd, s0_r0);
    float c = dot(s0_r0, s0_r0) - (sr * sr);
    float disc = b * b - 4.0 * a* c;
    if (disc < 0.0) {
        return vec2(-1.0, -1.0);
    }else{
        return vec2(-b - sqrt(disc), -b + sqrt(disc)) / (2.0 * a);
    }
}

float distance_euler(vec3 p) {
    vec3 power = p * p;
    return sqrt(power.x + power.y + power.z);
}

float densityAtPoint(vec3 p) {
    float heightAboveSurface = distance_euler(vec3(0, 0, 0)-p) - planetRad;
    float clampedHeight = heightAboveSurface / (atmosphereRad - planetRad); 
    return exp(-clampedHeight * densityFalloff) * (1.-clampedHeight);
}

float opticalDepth(vec3 r0, vec3 rd, float rl) {
    vec3 densitySamplePoint = r0;
    float step = rl / (float(numOpticalDepthPoints) - 1.);
    float opticalDepth = 0.0;

    for (int i = 0; i < numOpticalDepthPoints; i++) {
        float localDensity = densityAtPoint(densitySamplePoint);
        opticalDepth += localDensity * step;
        densitySamplePoint += rd * step;
    }
    return opticalDepth;
}

float calcLight(vec3 r0, vec3 rd, float rl) {
    vec3 scatterPoint = r0;
    float step = rl / (float(numScatterPoints) - 1.);
    float scatteredLight = 0.;
    for (int i = 0; i < numScatterPoints; i++) {
        vec2 sunRay = rsi(r0, rd, vec3(0, 0, 0), atmosphereRad);
        float sunRayLength = sunRay.x;
        float sunRayOpticalDepth = opticalDepth(scatterPoint, dirToSun, sunRayLength);
        float viewRayOpticalDepth = opticalDepth(scatterPoint, -rd, step * float(i));
        float transmittance = exp(-(sunRayOpticalDepth + viewRayOpticalDepth));
        float localDensity = densityAtPoint(scatterPoint);

        scatteredLight += localDensity * transmittance * step;
        scatterPoint += rd * step;
    }
    return scatteredLight;
}

float random(vec2 ab) 
{
	float f = (cos(dot(ab ,vec2(21.9898,78.233))) * 43758.5453);
	return fract(f);
}

float noise(in vec2 xy) 
{
	vec2 ij = floor(xy);
	vec2 uv = xy-ij;
	uv = uv*uv*(3.0-2.0*uv);
	

	float a = random(vec2(ij.x, ij.y ));
	float b = random(vec2(ij.x+1., ij.y));
	float c = random(vec2(ij.x, ij.y+1.));
	float d = random(vec2(ij.x+1., ij.y+1.));
	float k0 = a;
	float k1 = b-a;
	float k2 = c-a;
	float k3 = a-b-c+d;
	return (k0 + k1*uv.x + k2*uv.y + k3*uv.x*uv.y);
}

void main() {
    vec3 diffuse = texture2D(tDiffuse, vUv).rgb;
    vec2 depth = readDepth(tDepth, vUv);

    planetRad = .6/cameraDistance * 186.; 
    atmosphereRad = 120.; 

    vec2 uv = (-1.0 + 2.0*vUv) * vec2(cameraAspect, 1.0);
    vec3 r0 = cameraPos;
    vec3 rd = normalize(vec3(uv, 1.0));

    vec2 atmosphereIntersection = rsi(r0, rd, vec3(0, 0, -100. * cameraDistance), atmosphereRad);
    float dstToAtmosphere = atmosphereIntersection.y;
    float dstThroughAtmosphere = min(atmosphereIntersection.y - atmosphereIntersection.x, depth.x);

    gl_FragColor.a = 1.0;
    if (dstThroughAtmosphere > 0.) {
        vec3 pointInAtmosphere = r0 + rd * dstToAtmosphere;
        float light = calcLight(pointInAtmosphere, rd, dstThroughAtmosphere);
        gl_FragColor.rgb = diffuse; //* (1.-light) + (light);
    }
    else
    {
        gl_FragColor.rgb = diffuse;// + clamp(vec3(dstThroughAtmosphere)/atmosphereRad, 0., 1.) * vec3(r0-rd * 0.5 + 0.6);
    }

    float light = clamp(dot(rd, dirToSun)+0.8, 0., 1.);

	float color = pow(noise(vUv.xy * 100.), 400.0) * 20.0;
	float r1 = noise(vUv.xy*100.*noise(vec2(sin(0.01))));
	float r2 = noise(vUv.xy*222.*noise(vec2(cos(0.01), sin(0.01))));
	float r3 = noise(vUv.xy*943.*noise(vec2(sin(0.05), cos(0.05))));
		
    
    gl_FragColor.rgb = (diffuse * (light)) + ((clamp(vec3(dstThroughAtmosphere)/atmosphereRad, 0., 1.) * light)) * vec3(0, 0.3, .5);//vec3((r0-rd)*0.2 + 0.5);
    if (dstThroughAtmosphere == 0.) {
        gl_FragColor += vec4(vec3(r1, r2, r3) * color, 1.0);
    }
}`;