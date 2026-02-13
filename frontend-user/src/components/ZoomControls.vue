<template>
  <div class="zoom-controls">
    <button class="zoom-btn" @click="$emit('zoom-in')" title="放大">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <line x1="12" y1="6" x2="12" y2="18" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <line x1="6" y1="12" x2="18" y2="12" stroke="#333" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    <button class="zoom-btn" @click="$emit('zoom-out')" title="缩小">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <line x1="6" y1="12" x2="18" y2="12" stroke="#333" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineEmits(['zoom-in', 'zoom-out'])
</script>

<style scoped>
.zoom-controls {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
}

.zoom-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.zoom-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.zoom-btn:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .zoom-controls {
    left: 10px;
  }
  .zoom-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
