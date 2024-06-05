<template>
  <div id="app">
    <ThreeScene />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ThreeScene from './components/ThreeScene.vue'

export default defineComponent({
  name: 'App',
  components: {
    ThreeScene,
  },
})
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
