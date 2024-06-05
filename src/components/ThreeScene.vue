<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import * as THREE from 'three'

export default defineComponent({
  name: 'ThreeScene',
  setup() {
    const threeContainer = ref<HTMLDivElement | null>(null)
    const paddleSpeed = 0.02
    const tableWidth = 8
    const tableHeight = 4
    let paddle: THREE.Mesh

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
        const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        paddle = new THREE.Mesh(paddleGeometry, paddleMaterial)
        paddle.position.set(0, 2, 4) // Positioned in front of the user
        paddle.rotation.x = 0 // Ensure the paddle is parallel to the screen plane
        scene.add(paddle)

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
          }
        }
        document.addEventListener('mousemove', onPointerMove, false)

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate)
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
