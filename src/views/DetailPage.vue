<template>
  <div class="app-container">
    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
      <p>정보를 불러오고 있습니다...</p>
    </div>

    <div v-else-if="reptile" class="detail-view">
      <section class="image-wrapper">
        <img 
          :src="reptile.imageUrl || reptile.mainImage || '/default-reptile.png'" 
          alt="개체 사진" 
          class="main-image" 
          @error="(e) => e.target.src = '/default-reptile.png'"
        />
        <div class="gender-badge" :class="getGenderClass(reptile.gender)">
          {{ formatGender(reptile.gender) }}
        </div>
      </section>

      <div class="content-padding">
        <section class="header-section">
          <h1 class="name">{{ reptile.name }}</h1>
          <div class="tag-container">
            <span v-for="tag in reptile.tags" :key="tag" class="tag-chip"># {{ tag }}</span>
            <span v-if="!reptile.tags || reptile.tags.length === 0" class="no-tag">설정된 태그가 없습니다.</span>
          </div>
        </section>

        <hr class="divider" />

        <section class="info-card">
          <h3 class="section-title">개체 정보</h3>
          <div class="grid-info">
            <div class="item">
              <span class="label">종 (Species)</span>
              <span class="value">{{ reptile.species }}</span>
            </div>
            <div class="item">
              <span class="label">모프 (Morph)</span>
              <span class="value morph-text">
                {{ Array.isArray(reptile.morphs) ? reptile.morphs.join(' / ') : (reptile.morphs || '정보 없음') }}
              </span>
            </div>
            <div class="item">
              <span class="label">해칭일 (Hatch Date)</span>
              <span class="value">{{ reptile.birthDate || '미등록' }}</span>
            </div>
            <div class="item">
              <span class="label">등록자</span>
              <span class="value">{{ reptile.breederName || '본인' }}</span>
            </div>
          </div>
        </section>

        <section class="lineage-section">
          <h3 class="section-title">부/모 정보</h3>
          <div class="family-tree">
            <div class="parent-node" @click="goToParent(reptile.fatherId)">
              <div class="photo-circle">
                <img :src="reptile.fatherPhoto || '/default-reptile.png'" @error="(e) => e.target.src = '/default-reptile.png'" />
              </div>
              <span class="parent-label">부 (Sire)</span>
              <p class="p-name">{{ reptile.fatherName || '정보 없음' }}</p>
            </div>
            
            <div class="tree-connector"></div>
            
            <div class="parent-node" @click="goToParent(reptile.motherId)">
              <div class="photo-circle">
                <img :src="reptile.motherPhoto || '/default-reptile.png'" @error="(e) => e.target.src = '/default-reptile.png'" />
              </div>
              <span class="parent-label">모 (Dam)</span>
              <p class="p-name">{{ reptile.motherName || '정보 없음' }}</p>
            </div>
          </div>
        </section>

        <section class="history-section">
          <h3 class="section-title">이력 기록</h3>
          <div class="history-list">
            <div class="history-item current">
              <span class="h-date">{{ formatDate(reptile.createdAt) }}</span>
              <span class="h-event">최초 등록됨</span>
            </div>
          </div>
        </section>
      </div>

      <footer class="bottom-action">
        <button class="action-btn edit" @click="handleEdit">
          <span class="btn-icon">✏️</span><span class="btn-text">수정</span>
        </button>
        <button class="action-btn group" @click="handleGroup">
          <span class="btn-icon">🏷️</span><span class="btn-text">그룹</span>
        </button>
        <button class="action-btn transfer" @click="handleTransfer">
          <span class="btn-icon">✈️</span><span class="btn-text">분양</span>
        </button>
        <button class="action-btn delete" @click="handleDelete">
          <span class="btn-icon">🗑️</span><span class="btn-text">삭제</span>
        </button>
      </footer>
    </div>

    <div v-else class="error-box">
      <p>개체 정보를 찾을 수 없습니다.</p>
      <button @click="router.push('/')" class="home-btn">홈으로 돌아가기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, storage } from '../firebase'; 
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, deleteObject } from 'firebase/storage';

const route = useRoute();
const router = useRouter();
const reptile = ref(null);
const loading = ref(true);

// 성별 포맷
const formatGender = (gender) => {
  if (gender === 'Male') return '♂ 남아';
  if (gender === 'Female') return '♀ 여아';
  return '? 미구분';
};

const getGenderClass = (gender) => gender ? gender.toLowerCase() : 'unknown';

// 날짜 포맷
const formatDate = (val) => {
  if (!val) return '';
  const date = val.toDate ? val.toDate() : new Date(val);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(async () => {
  const docId = route.params.id;
  try {
    const docRef = doc(db, "reptiles", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      reptile.value = docSnap.data();
    }
  } catch (e) {
    console.error("데이터 로드 실패:", e);
  } finally {
    loading.value = false;
  }
});

const handleDelete = async () => {
  if (!confirm("정말로 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.")) return;
  
  try {
    loading.value = true;
    const docId = route.params.id;
    const imgPath = reptile.value.imageUrl || reptile.value.mainImage;
    
    if (imgPath && imgPath.includes('firebasestorage')) {
      const imgRef = storageRef(storage, imgPath);
      await deleteObject(imgRef).catch(() => {});
    }
    
    await deleteDoc(doc(db, "reptiles", docId));
    alert("삭제되었습니다.");
    router.push('/');
  } catch (error) {
    alert("삭제 중 문제가 발생했습니다.");
  } finally {
    loading.value = false;
  }
};

const handleEdit = () => router.push(`/edit/${route.params.id}`);
const handleGroup = () => alert("그룹 설정 기능 준비 중");
const handleTransfer = () => alert("분양 프로세스 준비 중");
const goToParent = (id) => id && router.push(`/detail/${id}`);
</script>

<style scoped>
/* 이전 스타일 동일 유지 */
.app-container { width: 100%; max-width: 600px; margin: 0 auto; min-height: 100vh; background: #fff; box-sizing: border-box; }
.image-wrapper { position: relative; width: 100%; height: 350px; background: #f0f0f0; }
.main-image { width: 100%; height: 100%; object-fit: cover; }
.gender-badge { position: absolute; bottom: 15px; right: 15px; padding: 5px 12px; border-radius: 20px; color: #fff; font-weight: bold; font-size: 0.85rem; }
.gender-badge.male { background: #2196f3; }
.gender-badge.female { background: #f44336; }
.gender-badge.unknown { background: #9e9e9e; }

.content-padding { padding: 20px; padding-bottom: 110px; }
.name { font-size: 1.6rem; font-weight: 800; margin-bottom: 10px; color: #333; }
.tag-container { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-chip { background: #f1f5f9; padding: 5px 12px; border-radius: 15px; font-size: 0.8rem; color: #475569; border: 1px solid #e2e8f0; }

.divider { border: 0; height: 1px; background: #f1f1f1; margin: 25px 0; }
.section-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 15px; color: #111; }
.grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #fbfbfb; padding: 18px; border-radius: 12px; border: 1px solid #f3f3f3; }
.label { font-size: 0.75rem; color: #888; margin-bottom: 4px; display: block; }
.value { font-weight: 600; font-size: 0.95rem; color: #333; }
.morph-text { color: #16a34a; }

.family-tree { display: flex; justify-content: space-around; align-items: center; padding: 15px; border: 1px solid #f1f1f1; border-radius: 12px; background: #fff; }
.parent-node { text-align: center; cursor: pointer; }
.photo-circle { width: 70px; height: 70px; border-radius: 50%; overflow: hidden; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 8px; background: #f8f8f8; }
.photo-circle img { width: 100%; height: 100%; object-fit: cover; }
.parent-label { font-size: 0.7rem; color: #999; }
.p-name { font-size: 0.85rem; font-weight: 700; color: #333; }

.history-list { border-left: 2px solid #f1f1f1; padding-left: 18px; margin-left: 10px; }
.history-item { position: relative; margin-bottom: 15px; }
.history-item::before { content: ''; position: absolute; left: -25px; top: 4px; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; border: 2px solid #fff; }
.h-date { display: block; color: #94a3b8; font-size: 0.75rem; }
.h-event { font-size: 0.85rem; color: #475569; }

.bottom-action { position: fixed; bottom: 0; width: 600px; background: #fff; display: grid; grid-template-columns: repeat(4, 1fr); padding: 12px; border-top: 1px solid #eee; gap: 8px; box-sizing: border-box; z-index: 100; }
.action-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; border: none; border-radius: 10px; padding: 10px 0; background: #f9f9f9; cursor: pointer; color: #555; transition: 0.2s; }
.action-btn:active { background: #f1f1f1; }
.btn-icon { font-size: 1.2rem; margin-bottom: 2px; }
.btn-text { font-size: 0.75rem; font-weight: 700; }

.error-box { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 15px; }
.home-btn { padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 8px; cursor: pointer; }

.loading-box { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.spinner { width: 32px; height: 32px; border: 3px solid #f3f3f3; border-top: 3px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>