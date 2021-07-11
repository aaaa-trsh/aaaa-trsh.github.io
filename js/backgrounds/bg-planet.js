let camera, scene, renderer, controls, stats;
let target;
let postScene, postCamera, postMaterial, planetMaterial;
let supportsExtension = true;
let sphere, sphereGeometry;
let SHADER = 0 == 1;
let noise;
init();
update();

function init() {
    noise = new Perlin('rnd' + Date.now());
    canvas = document.getElementById("canvas");
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
    camera.position.z = 1.6;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    setupRenderTarget();
    setupScene();
    setupPost();
    onWindowResize();

    window.addEventListener('resize', onWindowResize);
}

function setupRenderTarget() {
    if (target) target.dispose();

    const format = THREE.DepthFormat;
    const type = THREE.UnsignedShortType;

    target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    target.texture.format = THREE.RGBFormat;
    target.texture.minFilter = THREE.NearestFilter;
    target.texture.magFilter = THREE.NearestFilter;
    target.texture.generateMipmaps = false;
    target.stencilBuffer = (format === THREE.DepthStencilFormat) ? true : false;
    target.depthBuffer = true;
    target.depthTexture = new THREE.DepthTexture();
    target.depthTexture.format = format;
    target.depthTexture.type = type;
}

function deg2rad(deg) { return deg * Math.PI / 180; }
function setupPost() {
    // Setup post processing stage
    let camDir = new THREE.Vector3();
    camDir = camera.getWorldDirection(camDir);
    postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let camPos = new THREE.Vector3().copy(camera.position);

    let upperLeft = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(deg2rad(camera.fov/2), deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    let upperRight = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(deg2rad(camera.fov/2), -deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    let lowerLeft = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(-deg2rad(camera.fov/2), deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    let lowerRight = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(-deg2rad(camera.fov/2), -deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));

    postMaterial = new THREE.ShaderMaterial({
        vertexShader: document.getElementById('atmosphereVertShader').textContent.trim(),
        fragmentShader: document.getElementById('atmosphereFragShader').textContent.trim(),
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
            tDepth: { value: null }
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
    
    planetMaterial = new THREE.ShaderMaterial({
        vertexShader: document.getElementById('sphereVertShader').textContent.trim(),
        fragmentShader: document.getElementById('sphereFragShader').textContent.trim(),
        uniforms: {
            tDiffuse: { value: null }
        }
    });//new THREE.MeshStandardMaterial({ color: 'white' });
    sphereGeometry = new THREE.SphereGeometry(.6, 64, 64);
    sphere = new THREE.Mesh(sphereGeometry, planetMaterial);
    scene.add(sphere);
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    const dpr = renderer.getPixelRatio();
    target.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
}

var step = 0;
function update() {
    if (!supportsExtension) return;

    requestAnimationFrame(update);

    renderer.setRenderTarget(target);
    renderer.render(scene, camera);

    let camDir = new THREE.Vector3();
    camDir = camera.getWorldDirection(camDir);
    upperLeft = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(deg2rad(camera.fov/2), deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    upperRight = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(deg2rad(camera.fov/2), -deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    lowerLeft = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(-deg2rad(camera.fov/2), deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    lowerRight = new THREE.Vector3().copy(camDir).applyEuler(new THREE.Euler(-deg2rad(camera.fov/2), -deg2rad((camera.fov * camera.aspect)/2), 0, "XYZ"));
    //console.log(camDir);
    postMaterial.uniforms.cameraDirection.value = camDir;
    postMaterial.uniforms.cameraPos.value = camera.position;
    postMaterial.uniforms.cameraDistance.value = camera.position.distanceTo(new THREE.Vector3());
    postMaterial.uniforms.tDiffuse.value = target.texture;
    planetMaterial.uniforms.tDiffuse.value = target.texture;
    postMaterial.uniforms.tDepth.value = target.depthTexture;
    postMaterial.uniforms.upperLeft.value = upperLeft;    
    postMaterial.uniforms.upperRight.value = upperRight;    
    postMaterial.uniforms.lowerLeft.value = lowerLeft;    
    postMaterial.uniforms.lowerRight.value = lowerRight;

    renderer.setRenderTarget(null);

    renderer.render(postScene, postCamera);

    controls.update();
    step += 1;
}