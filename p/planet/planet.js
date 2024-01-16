import AtmosphereFragShader from './shaders/atmosphere.frag.js';
import AtmosphereVertShader from './shaders/atmosphere.vert.js';
import OceanFragShader from './shaders/ocean.frag.js';
import OceanVertShader from './shaders/ocean.vert.js';
import LandFragShader from './shaders/land.frag.js';
import LandVertShader from './shaders/land.vert.js';

let camera, scene, renderer, controls;
let postRenderTarget, imageRenderTarget;
let postScene, postCamera, postMaterial;
let supportsExtension = true;
let planet, oceanSphere;

window.onload = function() {
    init();
    update();
}

function init() {
    noise = new Perlin('rnd' + Date.now());
    let canvas = document.getElementById("canvas");
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

    if (renderer.capabilities.isWebGL2 === false && renderer.extensions.has('WEBGL_depth_texture') === false) {
        supportsExtension = false;
        return;
    }

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 50);
    camera.position.z = 2;

    /*
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enablePan = false;
    */

    setupRenderTarget();
    setupScene();
    setupPost();
    onWindowResize();

    window.addEventListener('resize', onWindowResize);
}

function setupRenderTarget() {
    if (postRenderTarget) postRenderTarget.dispose();
    if (imageRenderTarget) imageRenderTarget.dispose();

    const format = THREE.DepthFormat;
    const type = THREE.UnsignedShortType;

    postRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    postRenderTarget.texture.format = THREE.RGBFormat;
    postRenderTarget.texture.minFilter = THREE.NearestFilter;
    postRenderTarget.texture.magFilter = THREE.NearestFilter;
    postRenderTarget.texture.generateMipmaps = false;
    postRenderTarget.stencilBuffer = (format === THREE.DepthStencilFormat) ? true : false;
    postRenderTarget.depthBuffer = true;
    postRenderTarget.depthTexture = new THREE.DepthTexture();
    postRenderTarget.depthTexture.format = format;
    postRenderTarget.depthTexture.type = type;

    imageRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    imageRenderTarget.copy(postRenderTarget);
}

function deg2rad(deg) { return deg * Math.PI / 180; }
function setupPost() {
    // Setup post processing stage
    let camDir = camera.getWorldDirection(new THREE.Vector3());
    postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let camPos = new THREE.Vector3().copy(camera.position);

    let upperLeft = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(deg2rad(camera.fov/2), deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    let upperRight = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(deg2rad(camera.fov/2), -deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    let lowerLeft = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(-deg2rad(camera.fov/2), deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    let lowerRight = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(-deg2rad(camera.fov/2), -deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));

    postMaterial = new THREE.ShaderMaterial({
        vertexShader: AtmosphereVertShader,
        fragmentShader: AtmosphereFragShader,
        uniforms: {
            cameraNear: { value: camera.near },
            cameraFar: { value: camera.far },
            cameraFov: { value: camera.fov },
            cameraPos: { value: camera.position },
            cameraDistance: { value: camera.position.distanceTo(new THREE.Vector3()) },
            cameraAspect: { value: camera.aspect },
            cameraDirection: { value: camDir },
            upperLeft: { value: upperLeft },
            upperRight: { value: upperRight },
            lowerLeft: { value: lowerLeft },
            lowerRight: { value: lowerRight },
            projectionMatrixInverse: { value: camera.projectionMatrixInverse },
            matrixWorld: { value: camera.matrixWorld },
            viewportDimensions: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            tDiffuse: { value: null },
            tDepth: { value: null },
            startTime: { value: Date.now() }
        }
    });
    const postPlane = new THREE.PlaneGeometry(2, 2);
    const postQuad = new THREE.Mesh(postPlane, postMaterial);
    postScene = new THREE.Scene();
    postScene.add(postQuad);
}

function setupScene() {
    scene = new THREE.Scene();

    const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
    light.position.set(4, 10, 0);
    light.castShadow = true;
    scene.add(light);
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default
    
    let planetMaterial = new THREE.ShaderMaterial({
        vertexShader: LandVertShader,
        fragmentShader: LandFragShader,
    });
    let planetGeometry = new THREE.IcosahedronBufferGeometry(.6, 15);
    planet = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(planet);
    
    let oceanGeometry = new THREE.IcosahedronBufferGeometry(.72, 4);
    let oceanMaterial = new THREE.ShaderMaterial({
        vertexShader: OceanVertShader,
        fragmentShader: OceanFragShader,
        uniforms: {
            tDiffuse: { value: null },
        },
        transparent: true
    })
    oceanSphere = new THREE.Mesh(oceanGeometry, oceanMaterial);
    scene.add(oceanSphere);
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    const dpr = renderer.getPixelRatio();
    postRenderTarget.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
}

var step = 0;
function update() {
    if (!supportsExtension) return;

    requestAnimationFrame(update);

    //renderer.setRenderTarget(imageRenderTarget);
    //renderer.render(scene, camera);
    //oceanMaterial.uniforms.tDiffuse.value = imageRenderTarget.texture;
    oceanSphere.rotation.y = step/300;
    planet.rotation.y = step/300;

    oceanSphere.rotation.z = Math.sin(step/500)/2;
    planet.rotation.z = Math.sin(step/500)/2;

    renderer.setRenderTarget(postRenderTarget);
    renderer.render(scene, camera);

    let camDir = camera.getWorldDirection(new THREE.Vector3());
    let upperLeft = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(deg2rad(camera.fov/2), deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    let upperRight = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(deg2rad(camera.fov/2), -deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    let lowerLeft = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(-deg2rad(camera.fov/2), deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    let lowerRight = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(-deg2rad(camera.fov/2), -deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    //console.log(camDir);
    postMaterial.uniforms.cameraDirection.value = camDir;
    postMaterial.uniforms.cameraPos.value = camera.position;
    postMaterial.uniforms.cameraDistance.value = camera.position.distanceTo(new THREE.Vector3());
    postMaterial.uniforms.tDiffuse.value = postRenderTarget.texture;
    postMaterial.uniforms.tDepth.value = postRenderTarget.depthTexture;
    postMaterial.uniforms.upperLeft.value = upperLeft;    
    postMaterial.uniforms.upperRight.value = upperRight;    
    postMaterial.uniforms.lowerLeft.value = lowerLeft;    
    postMaterial.uniforms.lowerRight.value = lowerRight;
    postMaterial.uniforms.cameraAspect.value = camera.aspect;

    renderer.setRenderTarget(null);
    renderer.render(postScene, postCamera);

    // controls.update();
    step += 1;
}