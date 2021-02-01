<template>
  <div class="login">
    <div class="header">
      <img src="../assets/logo.png" alt="林全科技">
      <h3>林全MES系统</h3>
    </div>
    <div class="formLogin">
      <!-- 机台选择 -->
      <van-field
        readonly
        clickable
        name="picker"
        :value="machine"
        left-icon="desktop-o"
        placeholder="点击选择机台"
        @click="showPicker = true"
      />
      <van-popup v-model="showPicker" position="bottom">
        <van-picker
          show-toolbar
          :columns="machines"
          @confirm="onConfirm"
          @cancel="showPicker = false"
        />
      </van-popup>
      <!-- 操作选择 -->
      <van-field
        readonly
        clickable
        name="picker"
        :value="operator"
        left-icon="apps-o"
        placeholder="点击选择操作"
        @click="showOperator = true"
      />
      <van-popup v-model="showOperator" position="bottom">
        <van-picker
          show-toolbar
          :columns="operators"
          @confirm="operatorConfirm"
          @cancel="showOperator = false"
        />
      </van-popup>
      <van-field v-model="user" left-icon="user-o" ref="scanInput" autofocus @keyup.enter.native="loginScan" placeholder="请扫码登录" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      equipmentsOnline: [],
      machine: localStorage.getItem('machine') || '',
      user: '',
      machines: ['machine01', 'machine02', 'machine03'],
      // machines: [],
      showPicker: false,
      operator: localStorage.getItem('operator') || '',
      operators: [{text: '调机', value: '1'},{text: '品检', value: '2'},{text: 'IPQC', value: '3'}],
      showOperator: false,
      // 选择operator的value, 作为权限使用
      author: localStorage.getItem('author') || ''
    }
  },
  created() {
    this.getMachines()
    this.getEquipmentOnline()
  },
  methods: {
    onConfirm(value) {
      this.machine = value;
      this.showPicker = false;
      this.$refs.scanInput.focus()
    },
    operatorConfirm(item) {
      // console.log(item)
      this.operator = item.text;
      this.author = item.value
      this.showOperator = false;
      this.$refs.scanInput.focus()
    },
    getEquipmentOnline() {
      axios.get(this.killBrowserUrl + 'server/getOnline')
      .then((res) => {
          // console.log(res)
          if(res.data.code === 200) {
              this.equipmentsOnline = res.data.content
          } 
      }).catch(err => err)
      // 模拟有在线机台，用于测试
      // this.equipmentsOnline = [{name: 'machine02'},{name: 'machine03'}]
    },
    getMachines() {
        // 获取缓存中的设备名
        // const userName = localStorage.getItem('userName')
        // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetUser')
        axios.get(this.httpUrl + 'MES/GetUser')
        .then((res) => {
          // console.log(res)
          if(res.status === 200 && res.statusText === 'OK') {
            res.data.machine.map(item => {
              this.machines.push(item.BM_NAME)
            })
          }else{
            this.$toast.fail('获取设备名失败')
          }
        }).catch(err => err)
    },
    loginScan() {
      if(this.machine === '') {
        this.$toast.fail('未选择机台')
        return
      }
      if(this.operator === '') {
        this.$toast.fail('未选择操作')
        return
      }
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
            // 缓存操作员姓名
            localStorage.setItem('userName', this.user)
            this.submitForm()
          }else{
            this.$toast.fail('该用户不存在')
          }
        }else{
          this.$toast.fail('判断用户是否存在失败')
        }
      }).catch(err => err)
    },
    submitForm() {
      const index = this.equipmentsOnline.findIndex(item => item.name === this.machine)
      if(index === -1) {
        this.$toast.fail('当前机台未连接，请先上线')
        return
      }
      
      if(this.author === '3') {
        this.$router.push('/audit')
      }else{
        this.$router.push('/worklist')
      }
      localStorage.setItem('machine', this.machine)
      localStorage.setItem('operator', this.operator)
      localStorage.setItem('author', this.author)
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
  /* background: rgba(0, 0, 0, .1); */
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
