<template>
  <div id="app">
    <nav class="top-nav">
      <h1 @click="$router.push('/')" class="logo">REPLINK</h1>
    </nav>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style>
/* 1. 기본 마진 제거 */
body {
  margin: 0;
  padding: 0;
  background-color: #f5f5f5; /* 전체 배경은 연회색 */
}

/* 2. 메인 컨테이너 설정 */
.app-main {
  width: 100%;
  min-height: calc(100vh - 60px);
  display: flex;
  justify-content: center; /* 가로 가운데 정렬 */
}

.top-nav {
  height: 60px;
  background: white;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  color: #42b883;
  font-weight: 800;
  cursor: pointer;
  font-size: 22px;
}
</style>