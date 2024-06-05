<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { Game } from '../game/game';

export default defineComponent({
  name: 'ThreeScene',
  setup() {
    const threeContainer = ref<HTMLDivElement | null>(null);
    const paddleSpeed = 0.02;
    const tableWidth = 8;
    const tableHeight = 4;
    let game: Game;

    const onPointerMove = (event: MouseEvent) => {
      if (document.pointerLockElement === document.body) {
        // Calculate movement
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        if (!game) return;

        // Adjust paddle position with sensitivity control
        game.paddle.position.x += movementX * paddleSpeed;
        game.paddle.position.y -= movementY * paddleSpeed;

        // Limit paddle movement within the screen plane
        game.paddle.position.x = Math.max(-tableWidth / 2, Math.min(tableWidth / 2, game.paddle.position.x));
        game.paddle.position.y = Math.max(1, Math.min(3, game.paddle.position.y)); // Limit to a range in front of the table

        // Update paddle physics body position
        game.paddleBody.position.set(game.paddle.position.x, game.paddle.position.y, game.paddle.position.z);

        // If the ball is stuck to the paddle, update its position as well
        if (game.ballStuckToPaddle) {
          game.ball.position.set(game.paddle.position.x, game.paddle.position.y, game.paddle.position.z - 0.5);
          game.ballBody.position.set(game.ball.position.x, game.ball.position.y, game.ball.position.z);
        }
      }
    };

    const onSpacePress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && game.ballStuckToPaddle) {
        game.ballStuckToPaddle = false;
        game.ballBody.velocity.set(0, 0, -5); // Serve the ball towards the opponent
      }
    };

    onMounted(() => {
      if (threeContainer.value) {
        game = new Game({
          container: threeContainer.value,
          paddleSpeed,
          tableWidth,
          tableHeight,
          onPointerMove,
          onSpacePress,
        });
      }
    });

    return {
      threeContainer,
    };
  },
});
</script>

<style scoped>
.three-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  cursor: crosshair;
}
</style>
