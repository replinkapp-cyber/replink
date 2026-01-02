<template>
  <div v-if="reptile" class="detail-wrapper">
    <header class="detail-header">
      <button @click="$router.back()" class="back-btn">←</button>
      <h2 class="title">{{ reptile.name }} 정보</h2>
      <button @click="handleDelete" class="delete-icon-btn">
        <span class="trash-icon">🗑️</span>
      </button>
    </header>

    <div class="photo-slider">
      <div v-for="(photo, index) in reptile.photos" :key="index" class="photo-item">
        <img :src="photo" alt="reptile" />
      </div>
    </div>

    <div class="info-content">
      <div class="main-info">
        <div class="top-row">
          <span class="species-label">{{ reptile.species }}</span>
          <span class="gender-label" :class="reptile.gender">{{ reptile.gender }}</span>
        </div>
        <h1 class="reptile-name">{{ reptile.name }}</h1>
      </div>

      <div class="details-grid">
        <div class="detail-row">
          <span class="label">모프</span>
          <span class="value">{{ reptile.morph || '정보 없음' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">생년월일</span>
          <span class="value">{{ reptile.birthDate || '정보 없음' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">무게</span>
          <span class="value">{{ reptile.weight ? reptile.weight + 'g' : '정보 없음' }}</span>
        </div>
      </div>

      <div class="memo-section">
        <h3>메모</h3>
        <p class="memo-text">{{ reptile.memo || '작성된 메모가 없습니다.' }}</p>
      </div>
    </div>
  </div>
  <div v-else class="loading-state">
    <div class="spinner"></div>
    <p>정보를 불러오고 있습니다...</p>
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

// 데이터 불러오기
onMounted(async () => {
  try {
    const docRef = doc(db, "reptiles", route.params.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      reptile.value = docSnap.data();
    } else {
      alert("존재하지 않는 개체입니다.");
      router.push('/');
    }
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  }
});

// 삭제 로직
const handleDelete = async () => {
  if (!confirm("정말 이 개체를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.")) return;

  try {
    // 1. Storage 사진 삭제 (사진 주소가 있는 경우만)
    if (reptile.value.photos && reptile.value.photos.length > 0) {
      for (const url of reptile.value.photos) {
        // URL에서 파일 경로 추출하여 storage reference 생성
        const fileRef = storageRef(storage, url);
        try {
          await deleteObject(fileRef);
        } catch (err) {
          console.warn("이미지 삭제 중 오류(이미 삭제되었을 수 있음):", err);
        }
      }
    }

    // 2. Firestore 문서 삭제
    await deleteDoc(doc(db, "reptiles", route.params.id));

    alert("삭제되었습니다.");
    router.push('/'); // 메인 리스트로 이동
  } catch (error) {
    console.error("삭제 실패:", error);
    alert("삭제 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.detail-wrapper { max-width: 600px; margin: 0 auto; background: #fff; min-height: 100vh; position: relative; }
.detail-header { position: sticky; top: 0; background: #fff; padding: 15px; display: flex; align-items: center; border-bottom: 1px solid #f0f0f0; z-index: 10; justify-content: space-between; }
.back-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
.title { font-size: 16px; font-weight: 700; flex-grow: 1; text-align: center; margin-right: 40px; }

.delete-icon-btn { background: none; border: none; cursor: pointer; padding: 5px; }
.trash-icon { font-size: 20px; }

/* 사진 슬라이드 및 기타 스타일 기존 유지 */
.photo-slider { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; background: #f8f8f8; }
.photo-item { flex: 0 0 100%; scroll-snap-align: start; aspect-ratio: 1/1; }
.photo-item img { width: 100%; height: 100%; object-fit: cover; }
.info-content { padding: 20px; }
.top-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
.species-label { color: #888; font-size: 14px; }
.gender-label { font-size: 12px; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
.gender-label.수컷 { background: #e6f0ff; color: #007bff; }
.gender-label.암컷 { background: #fff0f0; color: #ff4d4f; }
.reptile-name { font-size: 24px; font-weight: 800; margin-bottom: 25px; }
.details-grid { background: #fdfdfd; border: 1px solid #f0f0f0; border-radius: 12px; padding: 15px; }
.detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f8f8f8; }
.detail-row:last-child { border-bottom: none; }
.label { color: #666; font-size: 14px; }
.value { font-weight: 600; color: #333; }
.memo-section { margin-top: 30px; }
.memo-section h3 { font-size: 16px; color: #222; margin-bottom: 10px; }
.memo-text { color: #555; line-height: 1.6; font-size: 15px; white-space: pre-wrap; }
.loading-state { text-align: center; margin-top: 100px; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #42b883; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>