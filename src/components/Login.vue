<template>
  <div class="login">
    <div class="header">
      <img src="../assets/logo.png" alt="林全科技">
      <h3>林全MES系统</h3>
    </div>
    <div class="formLogin">
      <van-field v-model="user" left-icon="user-o" ref="scanInput" autofocus @keyup.enter.native="loginScan" placeholder="请扫码登录" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      user: ''
    }
  },
  mounted() {
    this.$refs.scanInput.focus()
  },
  methods: {
    loginScan() {
      const value = this.user.trim()
      if(this.user.trim() === '') {
        this.$toast.fail('扫描结果为空')
        return
      }
      // 发送扫码结果到后台验证是否通过，并返回工号和姓名
      axios.get(this.httpUrl + 'MES/GetLogin?uid='+value)
      .then(res => {
        // console.log(res)
        if(res.data.code === 200) {
          const result = res.data.data[0]
          if(result.STATUS === '0') {
            this.user = result.EMP_NAME
            // 缓存操作员姓名和工号
            localStorage.setItem('userName', this.user)
            localStorage.setItem('jobNum', result.EMP_NO)
            this.$router.push('/home')
          }else{
            this.$toast.fail('该用户不存在')
          }
        }else{
          this.$toast.fail('判断用户是否存在失败')
        }
      }).catch(err => err)
    }
  }
}
</script>
<style scoped>
.login{
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  /* padding-top: 60px; */
  background: url(../assets/bg.jpg) no-repeat center center;
  background-size: 100% 100%;
}
.header img{
  width: 25%;
}
.formLogin{
  width: 80%;
  margin: 0 auto;
}
.van-cell{
  margin-top: 10px;
  font-size: 12px;
  color:rgb(38, 181, 238);
  border-radius: 22px;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.2);
}
/deep/ .van-field__left-icon .van-icon{
  font-size: 20px;
  font-weight: 700;
}
</style>
