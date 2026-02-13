<template>
  <div class="search-box">
    <input
      v-model="searchText"
      type="text"
      placeholder="搜索地点/输入经纬度"
      @keyup.enter="handleSearch"
      :disabled="isSearching"
    />
    <!-- 清除按钮 -->
    <button v-if="searchText" class="clear-btn" @click="handleClear" title="清除">
      <svg viewBox="0 0 24 24" width="18" height="18">
        <line x1="6" y1="6" x2="18" y2="18" stroke="#999" stroke-width="2" stroke-linecap="round"/>
        <line x1="18" y1="6" x2="6" y2="18" stroke="#999" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    <!-- 搜索按钮 -->
    <button class="search-btn" @click="handleSearch" :disabled="isSearching">
      <svg v-if="!isSearching" viewBox="0 0 24 24" width="20" height="20">
        <circle cx="11" cy="11" r="7" fill="none" stroke="#666" stroke-width="2"/>
        <line x1="16" y1="16" x2="22" y2="22" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span v-else class="loading-spinner"></span>
    </button>
  </div>
  <div v-if="searchError" class="search-error">{{ searchError }}</div>
  <div v-if="searchResult && !searchResult.isCoord" class="search-result">
    📍 {{ searchResult.name }}
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSearch } from '../composables/useSearch'

const emit = defineEmits(['locate', 'clear'])

const searchText = ref('')
const searchResult = ref(null)
const { isSearching, searchError, search } = useSearch()

const handleSearch = async () => {
  if (!searchText.value.trim() || isSearching.value) return
  
  const result = await search(searchText.value)
  searchResult.value = result
  
  if (result) {
    emit('locate', { lat: result.lat, lng: result.lng })
  }
}

// 清除搜索内容和坐标
const handleClear = () => {
  searchText.value = ''
  searchResult.value = null
  emit('clear')
}

// 清除错误提示
watch(searchText, () => {
  searchResult.value = null
})
</script>

<style scoped>
.search-box {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 25px;
  padding: 8px 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  z-index: 100;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 8px 10px;
  background: transparent;
  color: #333;
}

.search-box input::placeholder {
  color: #999;
}

.search-box input:disabled {
  opacity: 0.7;
}

.search-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  min-height: 30px;
}

.search-btn:hover:not(:disabled) {
  opacity: 0.7;
}

.search-btn:disabled {
  cursor: not-allowed;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.clear-btn:hover {
  opacity: 1;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-top-color: #00D4AA;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-error {
  position: absolute;
  top: 75px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff6b6b;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  z-index: 100;
}

.search-result {
  position: absolute;
  top: 75px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 100;
}

@media (max-width: 768px) {
  .search-box {
    width: 92%;
    top: 15px;
  }
  .search-error, .search-result {
    top: 70px;
    max-width: 85%;
  }
}
</style>
