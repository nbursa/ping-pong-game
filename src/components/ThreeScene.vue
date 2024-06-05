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

    onMounted(() => {
      if (threeContainer.value) {
        // Create the scene
        const scene = new THREE.Scene()

        // Create a camera
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.set(0, 3, 5)
        camera.lookAt(0, 0, 0)

        // Create a renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        threeContainer.value.appendChild(renderer.domElement)

        // Create the table
        const tableWidth = 8
        const tableHeight = 4
        const tableGeometry = new THREE.PlaneGeometry(tableWidth, tableHeight)
        const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x008000 })
        const table = new THREE.Mesh(tableGeometry, tableMaterial)
        table.rotation.x = -Math.PI / 2
        scene.add(table)

        // Create the net
        const netGeometry = new THREE.PlaneGeometry(tableWidth, 0.1)
        const netMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const net = new THREE.Mesh(netGeometry, netMaterial)
        net.position.y = 0.01
        net.position.z = 0
        scene.add(net)

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
}
</style>
