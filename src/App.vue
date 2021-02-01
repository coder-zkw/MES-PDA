<template>
  <div id="app">
    <router-view></router-view>
    <!-- <keep-alive>
      <router-view v-if="$route.path === '/worklist'"></router-view>
    </keep-alive> -->
  </div>
</template>
<script>
// 设置应用全屏显示！
// plus.navigator.setFullscreen(true)

export default {
  name: 'App'
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-top: 66px;
}
#app .van-nav-bar{
  padding-top: 20px;
  background: rgb(225, 240, 247);
}
#app .van-nav-bar .van-nav-bar__left, #app .van-nav-bar .van-nav-bar__right{
  top: 20px;
}
</style>
