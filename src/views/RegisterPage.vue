<template>
  <div class="reg-container">
    <header class="reg-header">
      <button @click="$router.back()" class="back-btn">〈</button>
      <h2 class="header-title">개체 등록</h2>
    </header>

    <div class="reg-content">
      <div class="section">
        <label class="section-title">사진 *</label>
        <div class="photo-grid">
          <div v-for="(img, i) in previewUrls" :key="i" class="photo-box">
            <img :src="img" />
            <button @click="removePhoto(i)" class="remove-p">×</button>
          </div>
          <label v-if="previewUrls.length < 3" class="upload-box">
            <input type="file" @change="onFileChange" accept="image/*" multiple hidden />
            <div class="upload-icon">
              <span class="camera-emoji">📷</span>
              <span class="count">{{ previewUrls.length }} / 3</span>
            </div>
          </label>
        </div>
      </div>

      <div class="section-row">
        <div class="row-item">
          <label class="section-title">해칭일</label>
          <input v-model="form.hatchDate" type="date" class="main-input date-input" />
        </div>
        <div class="row-item">
          <label class="section-title">체중</label>
          <div class="input-with-unit">
            <input v-model="form.weight" type="number" placeholder="0" class="main-input p-right-unit" />
            <span class="unit-text">g</span>
          </div>
        </div>
      </div>

      <div class="section">
        <label class="section-title">개체이름 또는 관리 번호 *</label>
        <input v-model="form.name" type="text" placeholder="예) 호랭이 또는 ABC1234" class="main-input" />
      </div>

      <div class="section">
        <label class="section-title">종 & 모프 선택 *</label>
        <div class="morph-trigger-box" @click="openSpeciesMorphModal">
          <div v-if="!form.species" class="placeholder">종과 모프를 선택해 주세요</div>
          <div v-else class="selected-display">
            <div class="species-badge">{{ form.species }}</div>
            <div class="selected-chips">
              <span v-for="m in form.morphs" :key="m" class="chip-tag">{{ m }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <label class="section-title">크기 *</label>
        <div class="segmented-control">
          <button type="button" v-for="sz in common.sizeList" :key="sz" 
            :class="{ active: form.size === sz }" @click="form.size = sz">{{ sz }}</button>
        </div>
      </div>
      <div class="section">
        <label class="section-title">성별 *</label>
        <div class="segmented-control">
          <button type="button" v-for="g in common.genderList" :key="g" 
            :class="{ active: form.gender === g }" @click="form.gender = g">{{ g }}</button>
        </div>
      </div>

      <div class="section">
        <div class="parent-grid">
          <div class="parent-column" @click="openParentModal('수컷')">
            <label class="section-title">부 (Father)</label>
            <div class="parent-box-styled" :style="form.fatherPhoto ? `background-image:url(${form.fatherPhoto}); background-size:cover; background-position:center;` : ''">
              <div v-if="!form.fatherPhoto && !form.fatherName" class="p-empty">
                <span class="empty-txt">등록된 개체가 없어요</span>
                <div class="help-circle">?</div>
              </div>
              <div v-else class="p-label-overlay">
                <span class="p-name-txt">{{ form.fatherName }}</span>
              </div>
            </div>
          </div>
          <div class="parent-column" @click="openParentModal('암컷')">
            <label class="section-title">모 (Mother)</label>
            <div class="parent-box-styled" :style="form.motherPhoto ? `background-image:url(${form.motherPhoto}); background-size:cover; background-position:center;` : ''">
              <div v-if="!form.motherPhoto && !form.motherName" class="p-empty">
                <span class="empty-txt">등록된 개체가 없어요</span>
                <div class="help-circle">?</div>
              </div>
              <div v-else class="p-label-overlay">
                <span class="p-name-txt">{{ form.motherName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="title-with-count">
          <label class="section-title">상세 설명</label>
          <span class="count-label">{{ form.description.length }}/600</span>
        </div>
        <textarea v-model="form.description" placeholder="특이사항을 입력해 주세요" class="main-textarea-fixed" maxlength="600"></textarea>
      </div>

      <button @click="handleRegister" class="submit-btn" :disabled="loading">
        {{ loading ? '등록 중...' : '등록 완료' }}
      </button>
    </div>

    <div v-if="showSpeciesMorphModal" class="modal-overlay" @click.self="showSpeciesMorphModal = false">
      <div class="modal-content full-modal">
        <div class="modal-header">
          <button class="close-x" @click="showSpeciesMorphModal = false">✕</button>
          <h3 class="modal-main-title">종 & 모프 선택</h3>
        </div>
        <div class="modal-body-scroll">
          <div v-if="!tempSpecies" class="species-step-area">
            <div v-for="(species, groupName) in common.speciesGroups" :key="groupName" class="group-section">
              <h4 class="group-title">{{ groupName }}</h4>
              <div class="species-chips">
                <button v-for="s in species" :key="s" @click="selectSpeciesStep(s)">{{ s }}</button>
              </div>
            </div>
          </div>
          <div v-else class="morph-step-area">
            <div class="selected-species-banner">
              <div class="banner-left">
                <span class="label">선택된 종</span>
                <span class="value">{{ tempSpecies }}</span>
              </div>
              <button class="change-btn" @click="tempSpecies = ''">변경</button>
            </div>
            <div class="morph-selection-content">
              <div class="morph-header">
                <span class="morph-label">모프 선택 (최대 3개)</span>
              </div>
              <div class="morph-chips">
                <button v-for="m in filteredMorphs" :key="m" 
                  :class="{ selected: tempMorphs.includes(m) }" @click="toggleTempMorph(m)">{{ m }}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="reset-btn" @click="resetModalSelection">초기화</button>
          <button class="apply-btn" @click="applySpeciesMorph">적용하기</button>
        </div>
      </div>
    </div>

    <div v-if="showParentModal" class="modal-overlay" @click.self="showParentModal = false">
      <div class="modal-content full-modal">
        <div class="modal-header border-none">
          <button class="close-x" @click="showParentModal = false">✕</button>
          <div class="parent-modal-tabs">
            <button class="tab-btn" :class="{ active: parentMode === 'select' }" @click="parentMode = 'select'">내 개체 선택</button>
            <button class="tab-btn" :class="{ active: parentMode === 'manual' }" @click="parentMode = 'manual'">직접 등록</button>
          </div>
        </div>
        <div class="modal-body-scroll">
          <div v-if="parentMode === 'select'">
            <div class="search-container">
              <input type="text" v-model="parentSearchQuery" placeholder="이름 검색" class="search-input" />
              <span class="search-icon">🔍</span>
            </div>
            <div class="parent-list">
              <div v-for="item in searchedParentList" :key="item.id" class="p-list-item" @click="selectParent(item)">
                <div class="p-img-mini" :style="item.photos?.length ? `background-image:url(${item.photos[0]}); background-size:cover;` : ''">
                  <span v-if="!item.photos?.length">🦎</span>
                </div>
                <div class="p-info-text">
                  <span class="p-name">{{ item.name }}</span>
                  <span class="p-morphs">{{ item.morphs?.join(', ') || '노말' }}</span>
                </div>
                <div class="p-select-indicator">선택</div>
              </div>
              <div v-if="searchedParentList.length === 0" class="no-parent-data">
                <p>{{ targetGender }} 개체를 등록하면 연결할 수 있어요</p>
              </div>
            </div>
          </div>
          <div v-else class="manual-entry-area">
            <div class="manual-photo-upload">
              <label class="manual-photo-box">
                <input type="file" @change="onParentPhotoChange" hidden />
                <img v-if="manualParent.photoUrl" :src="manualParent.photoUrl" class="preview-img" />
                <div v-else class="cam-guide">📷<br>사진 등록</div>
              </label>
            </div>
            <input v-model="manualParent.name" type="text" placeholder="부모 이름을 입력해 주세요" class="main-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="reset-btn" @click="showParentModal = false">취소</button>
          <button v-if="parentMode === 'manual'" class="apply-btn" @click="applyManualParent">등록하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCommonStore } from '../stores/common';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const common = useCommonStore();
const router = useRouter();
const loading = ref(false);

const form = reactive({
  name: '', species: '', morphs: [], gender: '미구분', size: '베이비',
  fatherId: '', fatherName: '', fatherPhoto: '', fatherPhotoFile: null,
  motherId: '', motherName: '', motherPhoto: '', motherPhotoFile: null,
  hatchDate: '', weight: '', description: ''
});

const showSpeciesMorphModal = ref(false);
const showParentModal = ref(false);
const targetGender = ref('');
const parentMode = ref('select');
const parentSearchQuery = ref('');
const allMyReptiles = ref([]);
const manualParent = reactive({ name: '', photoFile: null, photoUrl: '' });
const tempSpecies = ref('');
const tempMorphs = ref([]);
const previewUrls = ref([]);
const selectedFiles = ref([]);

onMounted(async () => {
  const snap = await getDocs(collection(db, "reptiles"));
  allMyReptiles.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

const openSpeciesMorphModal = () => {
  tempSpecies.value = form.species;
  tempMorphs.value = [...form.morphs];
  showSpeciesMorphModal.value = true;
};
const selectSpeciesStep = (s) => { tempSpecies.value = s; tempMorphs.value = []; };
const toggleTempMorph = (m) => {
  const idx = tempMorphs.value.indexOf(m);
  if (idx > -1) tempMorphs.value.splice(idx, 1);
  else {
    if (tempMorphs.value.length >= 3) return alert("최대 3개 선택 가능");
    tempMorphs.value.push(m);
  }
};
const applySpeciesMorph = () => {
  form.species = tempSpecies.value;
  form.morphs = [...tempMorphs.value];
  showSpeciesMorphModal.value = false;
};
const resetModalSelection = () => { tempSpecies.value = ''; tempMorphs.value = []; };
const filteredMorphs = computed(() => common.getMorphsBySpecies(tempSpecies.value));

const openParentModal = (gender) => {
  if (!form.species) return alert("종을 먼저 선택하세요.");
  targetGender.value = gender;
  parentMode.value = 'select';
  parentSearchQuery.value = '';
  manualParent.name = ''; manualParent.photoFile = null; manualParent.photoUrl = '';
  showParentModal.value = true;
};
const onParentPhotoChange = (e) => {
  const file = e.target.files[0];
  if (file) { manualParent.photoFile = file; manualParent.photoUrl = URL.createObjectURL(file); }
};
const applyManualParent = () => {
  if (!manualParent.name) return alert("이름 필수");
  if (targetGender.value === '수컷') {
    form.fatherName = manualParent.name; form.fatherId = 'manual';
    form.fatherPhoto = manualParent.photoUrl; form.fatherPhotoFile = manualParent.photoFile;
  } else {
    form.motherName = manualParent.name; form.motherId = 'manual';
    form.motherPhoto = manualParent.photoUrl; form.motherPhotoFile = manualParent.photoFile;
  }
  showParentModal.value = false;
};
const selectParent = (item) => {
  if (targetGender.value === '수컷') {
    form.fatherId = item.id; form.fatherName = item.name;
    form.fatherPhoto = item.photos?.[0] || '';
  } else {
    form.motherId = item.id; form.motherName = item.name;
    form.motherPhoto = item.photos?.[0] || '';
  }
  showParentModal.value = false;
};
const searchedParentList = computed(() => {
  return allMyReptiles.value.filter(r => r.species === form.species && r.gender === targetGender.value && r.name.includes(parentSearchQuery.value));
});

const onFileChange = (e) => {
  const files = Array.from(e.target.files);
  files.forEach(f => { selectedFiles.value.push(f); previewUrls.value.push(URL.createObjectURL(f)); });
};
const removePhoto = (i) => { selectedFiles.value.splice(i, 1); previewUrls.value.splice(i, 1); };

const handleRegister = async () => {
  if (!form.name || !form.species || form.morphs.length === 0) return alert("필수 항목 입력");
  loading.value = true;
  try {
    const photoUrls = [];
    for (const f of selectedFiles.value) {
      const sRef = storageRef(storage, `reptiles/${Date.now()}_${f.name}`);
      await uploadBytes(sRef, f);
      photoUrls.push(await getDownloadURL(sRef));
    }
    if (form.fatherPhotoFile) {
      const fRef = storageRef(storage, `parents/${Date.now()}_f`);
      await uploadBytes(fRef, form.fatherPhotoFile);
      form.fatherPhoto = await getDownloadURL(fRef);
    }
    if (form.motherPhotoFile) {
      const mRef = storageRef(storage, `parents/${Date.now()}_m`);
      await uploadBytes(mRef, form.motherPhotoFile);
      form.motherPhoto = await getDownloadURL(mRef);
    }
    const { fatherPhotoFile, motherPhotoFile, ...submitData } = form;
    await addDoc(collection(db, "reptiles"), { ...submitData, photos: photoUrls, createdAt: serverTimestamp() });
    router.push('/');
  } catch (e) { alert("오류 발생"); }
  finally { loading.value = false; }
};
</script>

<style scoped>
/* [핵심] 레이아웃 깨짐 방지 강제 설정 */
* { box-sizing: border-box !important; }
.reg-container { width: 600px !important; margin: 0 auto !important; background: #fff; }

/* 이미지에서 보신 둥근 버튼(칩) 스타일 전역 선언 */
button.chip-style, .species-chips button, .morph-chips button {
  padding: 10px 18px; border-radius: 25px; border: 1px solid #eee;
  background: #fff; font-size: 14px; cursor: pointer; transition: 0.2s;
}
/* 활성화 시 색상 고정 */
button.chip-style.active { border-color: #42b883; color: #42b883; font-weight: 700; }
button.chip-style.selected { background: #eef5ff; color: #3182f6; border-color: #3182f6; font-weight: 700; }



.reg-header { height: 60px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #f0f0f0; position: sticky; top: 0; background: #fff; z-index: 100; }
.header-title { font-size: 18px; font-weight: 700; color: #333; }
.back-btn { position: absolute; left: 15px; background: none; border: none; font-size: 20px; color: #555; cursor: pointer; }
.reg-content { padding: 24px; }
.section { margin-bottom: 28px; width: 100%; }
.section-title { font-size: 14px; font-weight: 700; margin-bottom: 10px; display: block; color: #444; }

/* 가로 배치 레이아웃 (해칭일/체중, 부모) */
.section-row, .parent-grid { display: flex; gap: 15px; width: 100%; flex-wrap: nowrap !important; }
.row-item, .parent-column { flex: 1; min-width: 0; }

/* 공통 입력창 스타일 */
.main-input { width: 100%; height: 48px; padding: 0 14px; border: 1px solid #e1e1e1; border-radius: 12px; background: #f8f9fa; font-size: 15px; outline: none; }
.input-with-unit { position: relative; width: 100%; }
.p-right-unit { padding-right: 35px !important; }
.unit-text { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #adb5bd; font-weight: 600; font-size: 14px; }

/* 종 & 모프 선택 트리거 박스 (메인) */
.morph-trigger-box { border: 1px solid #e1e1e1; border-radius: 12px; background: #f8f9fa; padding: 12px 14px; cursor: pointer; min-height: 58px; display: flex; align-items: center; }
.species-badge { background: #333; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-right: 8px; }
.chip-tag { background: #eef5ff; color: #3182f6; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid #d0e3ff; }

/* 부모 정보 박스 디자인 */
.parent-box-styled { 
  width: 100%; height: 100px; background-color: #f8f9fa; border-radius: 12px; border: 1px solid #f0f0f0; 
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  cursor: pointer; position: relative; overflow: hidden;
}
.help-circle { width: 22px; height: 22px; border-radius: 50%; background: #dee2e6; color: #fff; font-size: 12px; display: flex; align-items: center; justify-content: center; }
.p-label-overlay { position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.5); padding: 5px 0; text-align: center; }
.p-name-txt { color: #fff; font-weight: 700; font-size: 13px; }

/* [모달 스타일 보정] 이미지와 똑같은 버튼 스타일 복구 */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: flex-end; justify-content: center; z-index: 2000; }
.modal-content.full-modal { width: 100%; max-width: 600px; height: 90vh; border-radius: 24px 24px 0 0; background: #fff; display: flex; flex-direction: column; padding: 24px; }
.modal-body-scroll { flex: 1; overflow-y: auto; padding: 10px 0; }

/* 칩 스타일 버튼 (종/모프 공통) */
.species-chips button, .morph-chips button { 
  padding: 10px 18px; border-radius: 25px; border: 1px solid #eee; background: #fff; 
  margin: 4px; font-size: 14px; cursor: pointer; color: #555; transition: 0.2s;
}
/* 종 선택 시 (초록색 테두리 버전 이미지 참고) */
.species-chips button.active { border-color: #42b883; color: #42b883; font-weight: 700; }
/* 모프 선택 시 (파란색 버전) */
.morph-chips button.selected { background: #eef5ff; color: #3182f6; border-color: #3182f6; font-weight: 700; }

/* 모달 탭 (내 개체 선택 / 직접 등록) */
.parent-modal-tabs { display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; }
.tab-btn { 
  background: none; border: none; font-size: 16px; color: #bbb; cursor: pointer; 
  padding: 10px 5px; position: relative;
}
.tab-btn.active { color: #3182f6; font-weight: 700; }
.tab-btn.active::after { 
  content: ""; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #3182f6; 
}

/* 검색창 */
.search-container { position: relative; margin-bottom: 15px; }
.search-input { width: 100%; height: 44px; padding: 0 40px 0 15px; border: 1px solid #eee; border-radius: 10px; background: #f8f9fa; outline: none; }
.search-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #aaa; }

/* 모달 하단 초기화/적용하기 버튼 */
.modal-footer { padding: 20px 0; display: flex; gap: 10px; border-top: 1px solid #eee; margin-top: auto; }
.reset-btn { 
  flex: 1; padding: 16px; border: 1px solid #eee; border-radius: 12px; background: #f8f9fa; 
  color: #666; font-weight: 600; cursor: pointer; font-size: 15px;
}
.apply-btn { 
  flex: 2; padding: 16px; background: #3182f6; color: #fff; border: none; 
  border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 15px;
}

/* 성별/크기 세그먼트 컨트롤 */
.segmented-control { display: flex; gap: 6px; background: #f1f3f5; padding: 4px; border-radius: 12px; }
.segmented-control button { flex: 1; padding: 12px 0; border: none; border-radius: 10px; background: transparent; color: #888; font-weight: 600; cursor: pointer; font-size: 14px; }
.segmented-control button.active { background: #3182f6; color: white; }

/* 사진 업로드 영역 */
.photo-grid { display: flex; gap: 10px; flex-wrap: wrap; }
.photo-box { width: 85px; height: 85px; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid #eee; }
.photo-box img { width: 100%; height: 100%; object-fit: cover; }
.upload-box { width: 85px; height: 85px; background: #f8f9fa; border: 1px solid #eee; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; text-align: center; }

/* 직접 등록 수동 입력 영역 */
.manual-photo-box { width: 110px; height: 110px; background: #f8f9fa; border: 2px dashed #eee; border-radius: 15px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; text-align: center; color: #aaa; font-size: 12px; }

.submit-btn { width: 100%; padding: 18px; background: #42b883; color: #fff; border: none; border-radius: 12px; font-size: 17px; font-weight: 700; cursor: pointer; margin-top: 10px; }
</style>