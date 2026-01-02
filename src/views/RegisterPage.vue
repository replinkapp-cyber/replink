<template>
  <div class="reg-container">
    <header class="reg-header">
      <button @click="$router.back()" class="back-btn">〈</button>
      <h2 class="header-title">개체 등록</h2>
    </header>

    <div class="reg-content">
      <div class="section">
        <label class="section-title">사진 *</label>
        <p class="section-desc">사진을 클릭하여 등록해 주세요 (최대 3장)</p>
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

      <div class="section-row flex-nowrap">
        <div class="row-item">
          <label class="section-title">해칭일</label>
          <input v-model="form.hatchDate" type="date" class="main-input date-input" />
        </div>
        <div class="row-item">
          <label class="section-title">체중</label>
          <div class="input-with-unit">
            <input v-model="form.weight" type="number" placeholder="0" class="main-input p-right" />
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
        <div class="parent-grid flex-nowrap">
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
              <div class="chip-grid">
                <button v-for="s in species" :key="s" class="chip-btn" @click="selectSpeciesStep(s)">{{ s }}</button>
              </div>
            </div>
          </div>

          <div v-else class="morph-step-area">
            <div class="selected-banner">
              <div class="banner-info">선택된 종: <b>{{ tempSpecies }}</b></div>
              <button class="change-btn-styled" @click="tempSpecies = ''">변경</button>
            </div>
            <div class="morph-selection-content">
              <div class="morph-header">
                <span class="morph-label">모프 선택 (최대 3개)</span>
              </div>
              <div class="chip-grid">
                <button v-for="m in filteredMorphs" :key="m" 
                  class="chip-btn" :class="{ selected: tempMorphs.includes(m) }" @click="toggleTempMorph(m)">{{ m }}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="m-btn reset" @click="resetModalSelection">초기화</button>
          <button class="m-btn apply" @click="applySpeciesMorph">적용하기</button>
        </div>
      </div>
    </div>

    <div v-if="showParentModal" class="modal-overlay" @click.self="showParentModal = false">
      <div class="modal-content full-modal">
        <div class="modal-header border-none">
          <button class="close-x" @click="showParentModal = false">✕</button>
          <div class="parent-tabs-styled">
            <button class="tab-btn-styled" :class="{ active: parentMode === 'select' }" @click="parentMode = 'select'">내 개체 선택</button>
            <button class="tab-btn-styled" :class="{ active: parentMode === 'manual' }" @click="parentMode = 'manual'">직접 등록</button>
          </div>
        </div>
        <div class="modal-body-scroll">
          <div v-if="parentMode === 'select'">
            <div class="search-container-styled">
              <input type="text" v-model="parentSearchQuery" placeholder="이름 검색" class="search-input-styled" />
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
            <div class="manual-input-group">
              <label class="section-title">개체 이름</label>
              <input v-model="manualParent.name" type="text" placeholder="부모 개체 이름을 입력해 주세요" class="main-input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="m-btn reset" @click="showParentModal = false">취소</button>
          <button v-if="parentMode === 'manual'" class="m-btn apply" @click="applyManualParent">등록하기</button>
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

// --- 폼 데이터 상태 ---
const form = reactive({
  name: '', species: '', morphs: [], gender: '미구분', size: '베이비',
  fatherId: '', fatherName: '', fatherPhoto: '', fatherPhotoFile: null,
  motherId: '', motherName: '', motherPhoto: '', motherPhotoFile: null,
  hatchDate: '', weight: '', description: ''
});

// --- 모달 및 검색 관련 상태 ---
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

// 데이터 로드
onMounted(async () => {
  const snap = await getDocs(collection(db, "reptiles"));
  allMyReptiles.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

// --- 종 & 모프 로직 ---
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
    if (tempMorphs.value.length >= 3) return alert("모프는 최대 3개까지만 선택 가능합니다.");
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

// --- 부모 모달 로직 ---
const openParentModal = (gender) => {
  if (!form.species) return alert("종을 먼저 선택해 주세요.");
  targetGender.value = gender;
  parentMode.value = 'select';
  parentSearchQuery.value = '';
  manualParent.name = ''; manualParent.photoFile = null; manualParent.photoUrl = '';
  showParentModal.value = true;
};
const onParentPhotoChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    manualParent.photoFile = file;
    manualParent.photoUrl = URL.createObjectURL(file);
  }
};
const applyManualParent = () => {
  if (!manualParent.name) return alert("개체 이름을 입력해 주세요.");
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
  return allMyReptiles.value.filter(r => 
    r.species === form.species && 
    r.gender === targetGender.value && 
    r.name.toLowerCase().includes(parentSearchQuery.value.toLowerCase())
  );
});

// --- 사진 업로드 및 등록 ---
const onFileChange = (e) => {
  const files = Array.from(e.target.files);
  files.forEach(f => {
    selectedFiles.value.push(f);
    previewUrls.value.push(URL.createObjectURL(f));
  });
};
const removePhoto = (i) => { selectedFiles.value.splice(i, 1); previewUrls.value.splice(i, 1); };

const handleRegister = async () => {
  if (!form.name || !form.species || form.morphs.length === 0) return alert("필수 항목(*)을 입력해 주세요.");
  loading.value = true;
  try {
    const photoUrls = [];
    for (const f of selectedFiles.value) {
      const sRef = storageRef(storage, `reptiles/${Date.now()}_${f.name}`);
      await uploadBytes(sRef, f);
      photoUrls.push(await getDownloadURL(sRef));
    }
    // 부모 사진이 로컬 파일인 경우 업로드
    if (form.fatherPhotoFile) {
      const fRef = storageRef(storage, `parents/${Date.now()}_father`);
      await uploadBytes(fRef, form.fatherPhotoFile);
      form.fatherPhoto = await getDownloadURL(fRef);
    }
    if (form.motherPhotoFile) {
      const mRef = storageRef(storage, `parents/${Date.now()}_mother`);
      await uploadBytes(mRef, form.motherPhotoFile);
      form.motherPhoto = await getDownloadURL(mRef);
    }
    const { fatherPhotoFile, motherPhotoFile, ...submitData } = form;
    await addDoc(collection(db, "reptiles"), {
      ...submitData,
      photos: photoUrls,
      createdAt: serverTimestamp()
    });
    alert("개체 등록이 완료되었습니다! 🦎");
    router.push('/');
  } catch (err) {
    console.error(err);
    alert("등록 중 오류가 발생했습니다.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* [핵심] 레이아웃 깨짐 방지 강제 설정 */
* { box-sizing: border-box !important; }

.reg-container { 
  width: 600px !important; 
  max-width: 100% !important; 
  margin: 0 auto !important; 
  background: #fff; 
  min-height: 100vh; 
  padding-bottom: 50px;
}

.reg-header { height: 60px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #f0f0f0; position: sticky; top: 0; background: #fff; z-index: 100; }
.header-title { font-size: 18px; font-weight: 700; color: #333; }
.back-btn { position: absolute; left: 15px; background: none; border: none; font-size: 20px; color: #555; cursor: pointer; }
.reg-content { padding: 24px; }

/* 섹션 공통 스타일 */
.section { margin-top: 20px;margin-bottom: 28px; width: 100%; }
.section-title { font-size: 14px; font-weight: 700; margin-bottom: 10px; display: block; color: #444; }
.section-desc { font-size: 12px; color: #999; margin-bottom: 12px; }

/* 가로 배치 고정 레이아웃 */
.section-row, .parent-grid { display: flex; gap: 15px; width: 100%; flex-wrap: nowrap !important; }
.row-item, .parent-column { flex: 1; min-width: 0; }

/* 인풋 및 박스 모델 보정 */
.main-input { width: 100%; height: 48px; padding: 0 16px; border: 1px solid #e1e1e1; border-radius: 12px; background: #f8f9fa; font-size: 15px; outline: none; transition: 0.2s; }
.main-input:focus { border-color: #3182f6; background: #fff; }
.input-with-unit { position: relative; width: 100%; }
.p-right { padding-right: 35px !important; }
.unit-text { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #adb5bd; font-weight: 600; }

/* 종 & 모프 메인 트리거 디자인 */
.morph-trigger-box { border: 1px solid #e1e1e1; border-radius: 12px; background: #f8f9fa; padding: 12px 14px; cursor: pointer; min-height: 58px; display: flex; align-items: center; }
.selected-display { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.species-badge { background: #333; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.chip-tag { background: #eef5ff; color: #3182f6; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid #d0e3ff; }
.placeholder { color: #bbb; font-size: 15px; }

/* 부모 정보 박스 디자인 복구 */
.parent-box-styled { 
  width: 100%; height: 100px; background-color: #f8f9fa; border-radius: 12px; border: 1px solid #f0f0f0; 
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  cursor: pointer; position: relative; overflow: hidden; box-sizing: border-box;
}
.p-empty { text-align: center; }
.empty-txt { font-size: 12px; color: #adb5bd; display: block; margin-bottom: 5px; }
.help-circle { width: 22px; height: 22px; border-radius: 50%; background: #dee2e6; color: #fff; font-size: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.p-label-overlay { position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.5); padding: 5px 0; text-align: center; }
.p-name-txt { color: #fff; font-weight: 700; font-size: 13px; }

/* 상세 설명 텍스트영역 */
.main-textarea-fixed { width: 100%; height: 120px; padding: 16px; border: 1px solid #e1e1e1; border-radius: 12px; background: #f8f9fa; font-size: 15px; outline: none; resize: none; box-sizing: border-box; }

/* 모달 및 칩 스타일 */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: flex-end; justify-content: center; z-index: 2000; }
.modal-content.full-modal { width: 100%; max-width: 600px; height: 90vh; border-radius: 24px 24px 0 0; background: #fff; display: flex; flex-direction: column; padding: 24px; box-sizing: border-box; }
.modal-body-scroll { flex: 1; overflow-y: auto; padding: 10px 0; }
.group-title { font-size: 14px; font-weight: 700; color: #999; margin: 15px 0 10px; }

.chip-btn { 
  padding: 10px 18px; border-radius: 25px; border: 1px solid #eee; background: #fff; 
  margin: 4px; font-size: 14px; cursor: pointer; color: #555; transition: 0.2s;
}
.chip-btn:hover { background: #f8f9fa; }
.chip-btn.selected { background: #eef5ff; color: #3182f6; border-color: #3182f6; font-weight: 700; }

/* 종 변경 및 배너 */
.selected-banner { background: #f8f9fa; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border: 1px solid #eee; }
.change-btn-styled { padding: 6px 14px; background: #fff; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; color: #666; cursor: pointer; }

/* 부모 모달 탭 및 검색 */
.parent-tabs-styled { display: flex; gap: 15px; border-bottom: 1px solid #eee; margin-top: 10px; }
.tab-btn-styled { background: none; border: none; padding: 10px 5px; color: #bbb; font-weight: 600; cursor: pointer; position: relative; font-size: 15px; }
.tab-btn-styled.active { color: #3182f6; }
.tab-btn-styled.active::after { content: ""; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #3182f6; }
.search-input-styled { width: 100%; height: 44px; background: #f1f3f5; border: 1px solid #eee; border-radius: 10px; padding: 0 15px; margin: 15px 0; outline: none; }

/* 직접 등록 수동 입력 */
.manual-photo-box { width: 110px; height: 110px; background: #f8f9fa; border: 2px dashed #eee; border-radius: 15px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; text-align: center; color: #aaa; font-size: 12px; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }

/* 세그먼트 컨트롤 */
.segmented-control { display: flex; gap: 6px; background: #f1f3f5; padding: 4px; border-radius: 12px; }
.segmented-control button { flex: 1; padding: 12px 0; border: none; border-radius: 10px; background: transparent; color: #888; font-weight: 600; cursor: pointer; font-size: 14px; }
.segmented-control button.active { background: #3182f6; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

/* 하단 푸터 버튼 */
.modal-footer { display: flex; gap: 10px; padding: 20px 0; border-top: 1px solid #eee; margin-top: auto; }
.m-btn { flex: 1; padding: 16px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; font-size: 15px; }
.m-btn.reset { background: #f1f3f5; color: #666; }
.m-btn.apply { background: #3182f6; color: #fff; flex: 2; }

.submit-btn { width: 100%; padding: 18px; background: #42b883; color: white; border: none; border-radius: 12px; font-size: 17px; font-weight: 700; cursor: pointer; margin-top: 10px; }
.submit-btn:disabled { background: #ccc; cursor: not-allowed; }

/* 사진 그리드 보정 */
.photo-grid { display: flex; gap: 10px; flex-wrap: wrap; }
.photo-box { width: 85px; height: 85px; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid #eee; }
.photo-box img { width: 100%; height: 100%; object-fit: cover; }
.remove-p { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; cursor: pointer; }
.upload-box { width: 85px; height: 85px; background: #f8f9fa; border: 1px solid #eee; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; text-align: center; }
.upload-icon { color: #bbb; font-size: 11px; }
.camera-emoji { font-size: 20px; display: block; margin-bottom: 2px; }

/* 부모 리스트 아이템 디자인 */
.p-list-item { display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #f8f9fa; cursor: pointer; transition: 0.2s; }
.p-list-item:hover { background: #f1f3f5; }
.p-img-mini { width: 44px; height: 44px; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 18px; overflow: hidden; flex-shrink: 0; }
.p-info-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.p-name { font-weight: 700; font-size: 15px; color: #333; }
.p-morphs { font-size: 12px; color: #999; }
.p-select-indicator { color: #3182f6; font-weight: 700; font-size: 13px; }
</style>