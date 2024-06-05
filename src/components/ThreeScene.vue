<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { World, Body, Box, Sphere, Vec3, Plane, Material, ContactMaterial } from 'cannon-es'

export default defineComponent({
  name: 'ThreeScene',
  setup() {
    const threeContainer = ref<HTMLDivElement | null>(null)
    const paddleSpeed = 0.02
    const tableWidth = 8
    const tableHeight = 4
    let paddle: THREE.Mesh
    let ball: THREE.Mesh
    let paddleBody: Body
    let ballBody: Body
    let world: World
    let ballStuckToPaddle = true

    onMounted(() => {
      if (threeContainer.value) {
        // Create the scene
        const scene = new THREE.Scene()

        // Create a camera
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
        camera.position.set(0, 6, 8)
        camera.lookAt(0, 0, 0)

        // Create a renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        threeContainer.value.appendChild(renderer.domElement)

        // Create the table
        const tableGeometry = new THREE.PlaneGeometry(tableWidth, tableHeight)
        const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x008000 })
        const table = new THREE.Mesh(tableGeometry, tableMaterial)
        table.rotation.x = -Math.PI / 2
        scene.add(table)

        // Create the net
        const netGeometry = new THREE.PlaneGeometry(tableWidth, 0.5)
        const netMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const net = new THREE.Mesh(netGeometry, netMaterial)
        net.position.y = 0.3
        net.position.z = 0
        net.rotation.x = -Math.PI / 6
        scene.add(net)

        // Create the paddle
        const paddleRadius = 0.4
        const paddleSegments = 32
        const paddleGeometry = new THREE.CircleGeometry(paddleRadius, paddleSegments)
        const paddleMaterialThree = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        paddle = new THREE.Mesh(paddleGeometry, paddleMaterialThree)
        paddle.position.set(0, 2, 4) // Positioned in front of the user
        paddle.rotation.x = 0 // Ensure the paddle is parallel to the screen plane
        scene.add(paddle)

        // Create the ball
        const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32)
        const ballMaterialThree = new THREE.MeshBasicMaterial({ color: 0xffffff })
        ball = new THREE.Mesh(ballGeometry, ballMaterialThree)
        ball.position.set(paddle.position.x, paddle.position.y, paddle.position.z - 0.5) // Initially on the paddle facing the table
        scene.add(ball)

        // Set up the physics world
        world = new World()
        world.gravity.set(0, -9.82, 0) // Earth gravity in m/s^2

        // Create physics materials
        const groundPhysicsMaterial = new Material('groundMaterial')
        const paddlePhysicsMaterial = new Material('paddleMaterial')
        const ballPhysicsMaterial = new Material('ballMaterial')
        const contactMaterial = new ContactMaterial(ballPhysicsMaterial, groundPhysicsMaterial, {
          friction: 0.0,
          restitution: 0.7, // Bounciness
        })
        world.addContactMaterial(contactMaterial)

        // Create the paddle physics body
        paddleBody = new Body({
          mass: 0, // Static body
          position: new Vec3(paddle.position.x, paddle.position.y, paddle.position.z),
          shape: new Box(new Vec3(paddleRadius, 0.1, paddleRadius)),
          material: paddlePhysicsMaterial,
        })
        world.addBody(paddleBody)

        // Create the ball physics body
        ballBody = new Body({
          mass: 0.1, // Make it dynamic
          position: new Vec3(ball.position.x, ball.position.y, ball.position.z),
          shape: new Sphere(0.1),
          material: ballPhysicsMaterial,
        })
        world.addBody(ballBody)

        // Create the table physics body
        const tableBody = new Body({
          mass: 0, // Static body
          shape: new Plane(),
          material: groundPhysicsMaterial,
        })
        tableBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        world.addBody(tableBody)

        // Add event listener for locking the pointer
        threeContainer.value.addEventListener('click', () => {
          document.body.requestPointerLock()
        })

        // Update paddle position based on pointer movement
        const onPointerMove = (event: MouseEvent) => {
          if (document.pointerLockElement === document.body) {
            // Calculate movement
            const movementX = event.movementX || 0
            const movementY = event.movementY || 0

            // Adjust paddle position with sensitivity control
            paddle.position.x += movementX * paddleSpeed
            paddle.position.y -= movementY * paddleSpeed

            // Limit paddle movement within the screen plane
            paddle.position.x = Math.max(-tableWidth / 2, Math.min(tableWidth / 2, paddle.position.x))
            paddle.position.y = Math.max(1, Math.min(3, paddle.position.y)) // Limit to a range in front of the table

            // Update paddle physics body position
            paddleBody.position.set(paddle.position.x, paddle.position.y, paddle.position.z)

            // If the ball is stuck to the paddle, update its position as well
            if (ballStuckToPaddle) {
              ball.position.set(paddle.position.x, paddle.position.y, paddle.position.z - 0.5)
              ballBody.position.set(ball.position.x, ball.position.y, ball.position.z)
            }
          }
        }
        document.addEventListener('mousemove', onPointerMove, false)

        // Serve the ball on space key press
        const onSpacePress = (event: KeyboardEvent) => {
          if (event.code === 'Space' && ballStuckToPaddle) {
            ballStuckToPaddle = false
            ballBody.velocity.set(0, 0, -5) // Serve the ball towards the opponent
          }
        }
        document.addEventListener('keydown', onSpacePress, false)

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate)

          // Step the physics world
          world.step(1 / 60)

          // Update the ball position based on physics simulation
          if (!ballStuckToPaddle) {
            ball.position.copy(ballBody.position as THREE.Vector3)
            ball.quaternion.copy(ballBody.quaternion as THREE.Quaternion)
          }

          renderer.render(scene, camera)
        }

        // Handle window resize
        const onWindowResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', onWindowResize, false)

        // Start the animation
        animate()
      }
    })

    return {
      threeContainer,
    }
  },
})
</script>

<style scoped>
.three-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  cursor: crosshair;
}
</style>
