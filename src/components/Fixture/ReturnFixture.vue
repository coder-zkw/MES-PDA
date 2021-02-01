<template>
    <div class="ReturnFixture">
        <van-nav-bar fixed title="治具上库位" left-text="返回" left-arrow @click-left="$router.back()" />
        <switch-btn></switch-btn>
        <!-- 审核弹出框 -->
        <van-form class="scanarea">
            <van-field
                class="scaninput"
                v-model="scanVal"
                ref="scanInput"
                @keypress.enter.native="scaning"
                placeholder="扫描治具"
                />
            <div class="infos" v-if="mold != ''">
                <div>治具：{{mold}}</div>
                <div>储位：{{storage}}</div>
            </div>
        </van-form>
    </div>
</template>
<script>
import SwitchBtn from '../Switch'
import axios from 'axios'

export default {
    components: { SwitchBtn },
    data() {
        return {
            scanVal: '',
            mold: '',
            isOK: false,
            storage: ''
        }
    },
    created() {
        this.$nextTick(() => {
            this.$refs.scanInput.focus()
        })
    },
    methods: {
        // 获取品检完的工单列表
        SaveMouldMoveBack() {
            // axios.post('http://localhost:50814/MES/SaveFixtureMoveBack', {
            axios.post(this.httpUrl + 'MES/SaveFixtureMoveBack', {
                EM_POSITION: this.storage,
                EM_FIXTURE: this.mold,
                EM_USER: localStorage.getItem('userName')
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('上库位成功')
                    this.mold = ''
                    this.isOK = false
                }else{
                    this.$toast.fail('上库位失败')
                }
            }).catch(err => err)
        },
        scaning() {
            if(!this.isOK) {
                var currentMold = this.scanVal
                axios.get(this.httpUrl + 'MES/GetFixtureBack?md=' + currentMold).then(res => {
                // axios.get('http://localhost:50814/MES/GetFixtureBack?md=' + currentMold).then(res => {
                    // console.log(res) 
                    if(res.status === 200 && res.statusText === 'OK'){
                        if (res.data.length === 0) {
                            return this.$toast.fail('该编号不存在')
                        } else if(res.data[0].STATUS !== 14) {
                            return this.$toast.fail('该治具不在上库位列表')
                        } else {
                            this.mold = currentMold
                            this.isOK = true
                        }
                    }else{
                        this.$toast.fail('获取退治具信息失败')
                    }
                }).catch(err => err)
            } else {
                if (this.isOK && this.scanVal.substr(0,1) != 'M'){
                    // 判断库位是否占用，有重新选择库位扫码，无则保存信息
                    // 保留调接口判断
                    this.storage = this.scanVal
                    this.SaveMouldMoveBack()
                }else{
                    this.$toast.fail('无法上库位')
                }
            }
            this.scanVal = ''
        }
    }
}
</script>
<style scoped>
.scanarea{
    padding: 2rem;
}
.scaninput{
    margin-top: 1rem;
    height: 3rem;
    line-height: 1.6rem;
    border: 1px solid rgb(5, 172, 238);
    border-radius: 5px;
}
.infos{
    height: 50%;
    margin-top: 2rem;
    padding: 2rem;
    text-align: left;
    border: 1px solid #999;
}
</style>