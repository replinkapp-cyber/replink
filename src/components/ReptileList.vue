<template>
  <div class="list-wrapper">
    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
    </div>

    <div v-else class="content-area">
      <div v-if="reptiles.length === 0" class="empty">
        <p>등록된 개체가 없어요. 🦎</p>
      </div>

      <div class="grid">
        <div 
          v-for="reptile in reptiles" 
          :key="reptile.id" 
          class="card"
          @click="goToDetail(reptile.id)"
        >
          <div class="image-box">
            <img v-if="reptile.photos?.length" :src="reptile.photos[0]" alt="reptile" />
            <div v-else class="no-img">No Image</div>
          </div>
          <div class="info">
            <div class="name-row">
              <span class="name">{{ reptile.name }}</span>
              <span class="gender" :class="reptile.gender">{{ reptile.gender === '수컷' ? '♂' : reptile.gender === '암컷' ? '♀' : '?' }}</span>
            </div>
            <p class="species">{{ reptile.species }}</p>
            <div class="tags">
              <span v-if="reptile.morph" class="tag">{{ reptile.morph }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="add-btn" @click="$router.push('/register')">+</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

const router = useRouter();
const reptiles = ref([]);
const loading = ref(true);

const goToDetail = (id) => {
  router.push(`/detail/${id}`);
};

onMounted(() => {
  // 색인 생성이 완료되기 전까지는 orderBy 없이 사용하세요
  const q = query(collection(db, "reptiles"));
  
  onSnapshot(q, (snapshot) => {
    reptiles.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loading.value = false;
  });
});
</script>

<style scoped>
.list-wrapper {
  max-width: 1000px; /* PC에서 너무 넓어지지 않게 가둠 */
  margin: 0 auto;
  padding: 20px 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 모바일 2열 */
  gap: 12px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
}

.card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  cursor: pointer;
}

.image-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f1f1f1;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info { padding: 12px; }

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.name { font-weight: 700; font-size: 15px; }

.gender.수컷 { color: #007bff; }
.gender.암컷 { color: #ff4d4f; }

.species { font-size: 12px; color: #888; margin-bottom: 8px; }

.tag {
  font-size: 10px;
  background: #f1f3f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.add-btn {
  position: fixed;
  bottom: 30px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #42b883;
  color: white;
  font-size: 30px;
  border: none;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-box { text-align: center; padding-top: 100px; }
.spinner {
  width: 40px; height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>