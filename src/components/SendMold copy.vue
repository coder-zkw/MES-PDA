<template>
    <div class="sendMold">
        <van-nav-bar fixed title="送模" left-text="返回" left-arrow @click-left="$router.back()" />
        <switch-btn></switch-btn>
        <!-- 审核弹出框 -->
        <van-form class="scanarea">
            <van-field
                class="scaninput"
                v-model="scanVal"
                ref="scanInput"
                @keypress.enter.native.prevent="scaning"
                placeholder="扫描模具条码"
                />
            <div class="infos">
                <h3>工单：{{resultScan.EM_MW2}}</h3>
                <div>模具：{{resultScan.EM_B2}} <i class="van-icon van-icon-success" v-show="isMold"></i></div>
                <!-- <div>库位：{{resultScan.EM_S3}}</div>
                <div>区域：{{resultScan.F_ITEMNAME}}</div> -->
                <div>储位：{{resultScan.EM_B15}} <i class="van-icon van-icon-success" v-show="isStorage"></i></div>
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
            resultScan: {},
            moldNum: '',
            storageNum: '',
            isMold: false,
            isStorage: false
        }
    },
    created() {
        // this.getExamineWorks()
        this.$nextTick(() => {
            this.$refs.scanInput.focus()
        })
    },
    methods: {
        // 获取品检完的工单列表
        saveMold() {
         axios.post(this.httpUrl + 'MES/SaveMouldDeliver', {
            EM_WORKER: this.resultScan.EM_MW2,
            EM_MOULD: this.moldNum
         }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('信息保存成功')
                    this.resetScan()
                }else{
                    this.$toast.fail('保存送模信息失败')
                }
                this.scanVal = ''
            }).catch(err => err)
        },
        scaning() {
            // 模具信息和储位信息都为空，是第一次扫码
            // if (this.moldNum === '' && this.storageNum === '') {
                axios.get(this.httpUrl + 'MES/GetMouldDeliver?md=' + this.scanVal).then(res => {
                    // console.log(res)
                    if(res.status === 200 && res.statusText === 'OK'){
                        if (res.data.length === 0) {
                            return this.$toast.fail('该编号不存在')
                        }
                        this.resultScan = res.data[0]
                        this.moldNum = this.resultScan.EM_B2
                        this.storageNum = this.resultScan.EM_B15
                        if (this.resultScan.SP === '0') {
                            this.isStorage = true
                            // this.$toast('请继续扫描模具')
                        } else {
                            this.isMold = true
                            // this.$toast('请继续扫描储位')
                        }
                        if(this.isMold && this.isStorage) {
                            this.saveMold()
                        } else if (this.isMold || this.isStorage){
                            this.$toast.fail('两次扫码信息不匹配')
                        }
                    }else{
                        this.$toast.fail('查询送模信息失败')
                    }
                }).catch(err => err)
            // } else {
            //     if (this.resultScan.SP === '0') {
            //         // 第一次扫描的储位信息，第二次比较模具是否正确
            //         if(this.scanVal === this.moldNum) {
            //             return this.saveMold()
            //         }
            //     } else if (this.resultScan.SP === '1') {
            //         // 第一次扫描的模具信息，第二次比较储位是否正确
            //         if(this.scanVal === this.storageNum) {
            //             return this.saveMold()
            //         }
            //     }
            //     this.$toast.fail('两次扫码信息不匹配')
            // }
            this.scanVal = ''
        },
        resetScan() {
            this.moldNum = ''
            this.storageNum = ''
            this.resultScan = {}
            this.isMold = false
            this.isStorage = false
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