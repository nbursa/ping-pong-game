import * as THREE from 'three';
import { World, Body, Box, Sphere, Vec3, Plane, Material, ContactMaterial } from 'cannon-es';

interface GameConfig {
  container: HTMLDivElement;
  paddleSpeed: number;
  tableWidth: number;
  tableHeight: number;
  onSpacePress: (event: KeyboardEvent) => void;
  onPointerMove: (event: MouseEvent) => void;
}

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  public paddle: THREE.Mesh;
  public ball: THREE.Mesh;
  public paddleBody: Body;
  public ballBody: Body;
  private world: World;
  public ballStuckToPaddle: boolean;
  private readonly config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
    this.ballStuckToPaddle = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.paddle = new THREE.Mesh();
    this.ball = new THREE.Mesh();
    this.paddleBody = new Body();
    this.ballBody = new Body();
    this.world = new World();

    this.initThreeJS();
    this.initCannonJS();
    this.initEventListeners();
    this.animate();
  }

  private initThreeJS() {
    const { container, tableWidth, tableHeight } = this.config;

    // Create the scene
    this.scene = new THREE.Scene();

    // Create a camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 6, 8);
    this.camera.lookAt(0, 0, 0);

    // Create a renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    // Create the table
    const tableGeometry = new THREE.PlaneGeometry(tableWidth, tableHeight);
    const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x008000 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.rotation.x = -Math.PI / 2;
    this.scene.add(table);

    // Create the net
    const netGeometry = new THREE.PlaneGeometry(tableWidth, 0.5);
    const netMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const net = new THREE.Mesh(netGeometry, netMaterial);
    net.position.y = 0.3;
    net.position.z = 0;
    net.rotation.x = -Math.PI / 6;
    this.scene.add(net);

    // Create the paddle
    const paddleRadius = 0.4;
    const paddleSegments = 32;
    const paddleGeometry = new THREE.CircleGeometry(paddleRadius, paddleSegments);
    const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    this.paddle.position.set(0, 2, 4);
    this.paddle.rotation.x = 0;
    this.scene.add(this.paddle);

    // Create the ball
    const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    this.ball.position.set(this.paddle.position.x, this.paddle.position.y, this.paddle.position.z - 0.5);
    this.scene.add(this.ball);

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  private initCannonJS() {
    // Set up the physics world
    this.world = new World();
    this.world.gravity.set(0, -9.82, 0);

    // Create physics materials
    const groundMaterial = new Material('groundMaterial');
    const paddleMaterial = new Material('paddleMaterial');
    const ballMaterial = new Material('ballMaterial');
    const contactMaterial = new ContactMaterial(ballMaterial, groundMaterial, {
      friction: 0.0,
      restitution: 0.7,
    });
    this.world.addContactMaterial(contactMaterial);

    // Create the paddle physics body
    const paddleRadius = 0.4;
    this.paddleBody = new Body({
      mass: 0,
      position: new Vec3(this.paddle.position.x, this.paddle.position.y, this.paddle.position.z),
      shape: new Box(new Vec3(paddleRadius, 0.1, paddleRadius)),
      material: paddleMaterial,
    });
    this.world.addBody(this.paddleBody);

    // Create the ball physics body
    this.ballBody = new Body({
      mass: 0.1,
      position: new Vec3(this.ball.position.x, this.ball.position.y, this.ball.position.z),
      shape: new Sphere(0.1),
      material: ballMaterial,
    });
    this.world.addBody(this.ballBody);

    // Create the table physics body
    const tableBody = new Body({
      mass: 0,
      shape: new Plane(),
      material: groundMaterial,
    });
    tableBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(tableBody);
  }

  private initEventListeners() {
    this.config.container.addEventListener('click', () => {
      document.body.requestPointerLock();
    });

    document.addEventListener('mousemove', this.config.onPointerMove, false);
    document.addEventListener('keydown', this.config.onSpacePress, false);
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Step the physics world
    this.world.step(1 / 60);

    // Update the ball position based on physics simulation
    if (!this.ballStuckToPaddle) {
      this.ball.position.set(this.ballBody.position.x, this.ballBody.position.y, this.ballBody.position.z);
      this.ball.quaternion.set(this.ballBody.quaternion.x, this.ballBody.quaternion.y, this.ballBody.quaternion.z, this.ballBody.quaternion.w);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
