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
            <div class="infos">
                <h3>工单：{{moldInfo.EM_MW2}}</h3>
                <div>模具：{{moldInfo.EM_B2}} <i class="van-icon van-icon-success" v-show="isMold"></i></div>
                <div>机台：{{moldInfo.EM_POS13}} <i class="van-icon van-icon-success" v-show="isMachine"></i></div>
            </div>
            <van-button class="reset" v-show="moldNum != ''" round size="small" type="info" @click="resetScan">清空重扫</van-button>
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
            moldInfo: {},
            moldNum: '',
            machine: '',
            isMold: false,
            isMachine: false
        }
    },
    created() {
        // this.SaveMouldTake()
        this.$nextTick(() => {
            this.$refs.scanInput.focus()
        })
    },
    methods: {
        SaveMouldTake() {
            axios.post(this.httpUrl + 'MES/SaveMouldTake', {
                EM_WORKER: this.moldInfo.EM_MW2,
                EM_MOULD: this.moldNum,
                EM_MACHINE: this.moldInfo.EM_POS13
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.isOk = true
                    this.moldNum = ''
                    this.$toast.success('取模成功,扫描对应机台')
                }else{
                    this.$toast.fail('取模失败')
                }
                this.scanVal = ''
            }).catch(err => err)
        },
        SaveMouldLoad() {
            axios.post(this.httpUrl + 'MES/SaveMouldLoad', {
                EM_WORKER: this.moldInfo.EM_MW2,
                EM_MOULD: this.moldNum
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('上模保存信息成功')
                    this.resetScan()
                }else{
                    this.$toast.fail('上模保存信息失败')
                }
                this.scanVal = ''
            }).catch(err => err)
        },
        scaning() {
            // 扫描模具号后，填充模具信息
            if (this.moldNum === '') {
                axios.get(this.httpUrl + 'MES/GetMouldLoad?md=' + this.scanVal).then(res => {
                    // console.log(res)
                    if(res.status === 200 && res.statusText === 'OK'){
                        if (res.data.length === 0) {
                            return this.$toast.fail('该上模编号不存在')
                        }
                        this.moldInfo = res.data[0]
                        this.moldNum = this.moldInfo.EM_B2
                        this.machine = this.moldInfo.EM_POS13  
                        if (this.scanVal === this.machine) {
                            this.isMachine = true
                        } else if (this.scanVal === this.moldNum) {
                            this.isMold = true
                        } 
                    }else{
                        this.$toast.fail('扫码获取信息失败')
                    }
                }).catch(err => err)
            }else{
                if (this.scanVal === this.machine) {
                    this.isMachine = true
                } else if (this.scanVal === this.moldNum) {
                    this.isMold = true
                } else {
                    this.$toast.fail('该码与上模信息不匹配')
                }
            }
            
            if(this.isMold && this.isMachine) {
                this.SaveMouldLoad()
            }
            this.scanVal = ''
        },
        resetScan() {
            this.moldNum = ''
            this.machine = ''
            this.moldInfo = {},
            this.isMold = false,
            this.isMachine = false,
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