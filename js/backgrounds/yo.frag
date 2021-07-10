#include <packing>

varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform float cameraNear;
uniform float cameraFar;

float readDepth(sampler2D depthSampler, vec2 coord) {
    float fragCoordZ = texture2D(depthSampler, coord).x;
    float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
    return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

vec2 raySphere(vec3 origin, vec3 direction, vec3 center, float radius) {
    float a = dot(direction, direction);
    vec3 center_origin = origin - center;
    float b = 2.0 * dot(direction, center_origin);
    float c = dot(center_origin, center_origin) - (radius * radius);
    float disc = b * b - 4.0 * a* c;

    if (disc < 0.0) {
        return vec2(-1.0, -1.0);
    }else{
        return vec2(-b - sqrt(disc), -b + sqrt(disc)) / (2.0 * a);
    }
}

vec3[3] decomposeMatrix(mat4 mat) {
    vec3 translation = vec3(mat[3][0], mat[3][1], mat[3][2]);
    vec3 scale = vec3(mat[0][0], mat[1][1], mat[2][2]);
    // rotation matrix
    mat4 rotationMatrix = mat4(
        mat[0][0]/scale.x, mat[0][1]/scale.x, mat[0][2]/scale.x, 0,
        mat[1][0]/scale.y, mat[1][1]/scale.y, mat[1][2]/scale.y, 0,
        mat[2][0]/scale.z, mat[2][1]/scale.z, mat[2][2]/scale.z, 0,
        0, 0, 0, 1
    );
    float sy = sqrt(rotationMatrix[0][0] * rotationMatrix[0][0] + rotationMatrix[1][0] * rotationMatrix[1][0]);
    bool singular = sy < 1e-6;
    float x, y, z;
    if (!singular) {
        x = atan(rotationMatrix[2][1]/rotationMatrix[2][2]);
        y = atan(rotationMatrix[2][0]/sy);
        z = atan(rotationMatrix[1][0]/rotationMatrix[0][0]);
    } else {
        x = atan(rotationMatrix[1][2]/rotationMatrix[1][1]);
        y = atan(rotationMatrix[2][0]/sy);
        z = 0.0;
    }
    vec3 eulerAngles = vec3(x, y, z);
    return vec3[](translation, scale, eulerAngles);
}

vec3 multVecMatrix(mat4 mat, vec3 src) 
{ 
    float x = src[0] * mat[0][0] + src[1] * mat[1][0] + src[2] * mat[2][0] + mat[3][0]; 
    float y = src[0] * mat[0][1] + src[1] * mat[1][1] + src[2] * mat[2][1] + mat[3][1]; 
    float z = src[0] * mat[0][2] + src[1] * mat[1][2] + src[2] * mat[2][2] + mat[3][2]; 
    float w = src[0] * mat[0][3] + src[1] * mat[1][3] + src[2] * mat[2][3] + mat[3][3]; 
    return vec3(x / w, y / w, z / w);
}

void main() {
    vec3 diffuse = texture2D(tDiffuse, vUv).rgb;
    float depth = readDepth(tDepth, vUv);

    //vec3 rayOrigin = cameraPosition;
    //mat4 rayDir = normalize(viewMatrix);

    //vec2 hitInfo = raySphere(cameraPosition);
    gl_FragColor.rgb = vec3(depth);
    gl_FragColor.a = 1.0;
}
vec2 rsi(vec3 r0, vec3 rd, float sr) {
    float a = dot(rd, rd);
    float b = 2.0 * dot(rd, r0);
    float c = dot(r0, r0) - (sr * sr);
    float d = (b*b) - 4.0*a*c;
    if (d < 0.0) return vec2(1e5,-1e5);
    return vec2(
        (-b - sqrt(d))/(2.0*a),
        (-b + sqrt(d))/(2.0*a)
    );
}

vec3 pixelToDirection(vec2 coords) {
    vec3 camPos = vec3(
        (2.0 * coords.x - 1.0) * cameraAspect, 
        (1.0 - 2.0 * coords.y), 
        -1.0
    );
    return camPos;
}

vec3 pixToDir2(vec2 coords) {
    vec3 screenPos = vec3(coords.x, coords.y, 0.0);
    return mix(mix(upperRight, upperLeft, screenPos.x), mix(lowerRight, lowerLeft, screenPos.x), screenPos.y);
}

vec3 multDirMatrix(mat4 mat, vec3 src) 
{ 
    float x = src.x * mat[0][0] + src.y * mat[1][0] + src.z * mat[2][0]; 
    float y = src.x * mat[0][1] + src.y * mat[1][1] + src.z * mat[2][1]; 
    float z = src.x * mat[0][2] + src.y * mat[1][2] + src.z * mat[2][2]; 
    return vec3(x, y, z);
}
vec3 applyMatrix4(vec3 v, mat4 m) {
    float w = 1.0 / (m[0][3] * v.x + m[1][3] * v.y + m[2][3] * v.z + m[3][3]);
    float x = (m[0][0] * v.x + m[1][0] * v.y + m[2][0] * v.z + m[3][0]) * w;
    float y = (m[0][1] * v.x + m[1][1] * v.y + m[2][1] * v.z + m[3][1]) * w;
    float z = (m[0][2] * v.x + m[1][2] * v.y + m[2][2] * v.z + m[3][2]) * w;
    return vec3(x, y, z);
}