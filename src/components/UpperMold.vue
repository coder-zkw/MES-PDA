<template>
    <div class="upperMold">
        <van-nav-bar fixed title="上模" left-text="返回" left-arrow @click-left="$router.back()" />
        <switch-btn></switch-btn>
        <!-- 审核弹出框 -->
        <van-form class="scanarea">
            <van-field
                class="scaninput"
                v-model="scanVal"
                ref="scanInput"
                @keypress.enter.native.prevent="scaning"
                placeholder="扫描模具、机台"
                />
            <div class="infos" v-if="mold != ''">
                <h3>工单：{{workerId}}</h3>
                <div>模具：{{mold}}</div>
                <div>机台：{{machine}}</div>
            </div>
            <van-button class="reset" v-show="mold != ''" round size="small" type="info" @click="resetScan">清空重扫</van-button>
        </van-form>
    </div>
</template>
<script>
import SwitchBtn from './Switch'
import axios from 'axios'

export default {
    components: { SwitchBtn },
    data() {
        return {
            scanVal: '',
            workerId: '',
            mold: '',
            machine: ''
        }
    },
    created() {
        this.$nextTick(() => {
            this.$refs.scanInput.focus()
        })
    },
    methods: {
        SaveMouldLoad() {
            // axios.post('http://localhost:50814/MES/SaveMouldLoad', {
            axios.post(this.httpUrl + 'MES/SaveMouldLoad', {
                EM_MOULD: this.mold,
                EM_USER: localStorage.getItem('userName')
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('上模成功')
                    this.resetScan()
                }else{
                    this.$toast.fail('上模失败')
                }
                this.scanVal = ''
            }).catch(err => err)
        },
        scaning() {
            // 扫描模具号后，填充模具信息
            if (this.mold === '') {
                var currenMold = this.scanVal
                axios.post(this.httpUrl + 'MES/getUpMould', {
                // axios.post('http://localhost:50814/MES/getUpMould', {
                    EM_MOULD: currenMold
                }).then(res => {
                    // console.log(res)
                    var result = res.data
                    if(result.code === 200){
                        if (result.data.length === 0) {
                            return this.$toast.fail('该模具不在上模列表')
                        }
                        var infos = result.data[0]
                        this.mold = currenMold
                        this.workerId = infos.M_WORKER
                        this.machine = infos.M_MACHINE
                        this.$toast('请继续扫码对应机台')
                    }else{
                        this.$toast.fail('扫码获取信息失败')
                    }
                }).catch(err => err)
            } else {
                if(this.scanVal === this.machine) {
                    this.SaveMouldLoad()
                }else {
                    this.$toast.fail('请扫码对应机台')
                }
            }
            this.scanVal = ''
        },
        resetScan() {
            this.workerId = ''
            this.mold = ''
            this.machine = ''
            this.$refs.scanInput.focus()
        }
    }
}
</script>
<style scoped>
.scanarea{
    padding: 2rem;
    position: relative;
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
    margin-top: 1rem;
    padding: 1rem 1.8rem;
    text-align: left;
    border: 1px solid #999;
}
.reset{
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}
.van-icon{
    font-size: 1.5rem;
    color: forestgreen;
    position: absolute;
    left: 2.5rem;
}
</style>