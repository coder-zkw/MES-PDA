<template>
    <div class="RemoveMold">
        <van-nav-bar fixed title="下模" left-text="返回" left-arrow @click-left="$router.back()" />
        <switch-btn></switch-btn>
        <!-- 审核弹出框 -->
        <van-form class="scanarea">
            <van-field
                class="scaninput"
                v-model="scanVal"
                ref="scanInput"
                @keypress.enter.native.prevent="scaning"
                placeholder="请扫描模具"
                />
            <div class="infos">
                <div>机台：{{resultScan.EM_MW6}}</div>
                <div>模具：{{resultScan.EM_MW1}}</div>
            </div>
            <van-button class="reset" v-show="moldNum != ''" round size="small" type="info" @click="saveRemoveMold">确认下模</van-button>
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
            machine: '',
            moldNum: ''
        }
    },
    created() {
        this.$nextTick(() => {
            this.$refs.scanInput.focus()
        })
    },
    methods: {
        // 获取品检完的工单列表
        saveRemoveMold() {
            axios.post(this.httpUrl + 'MES/SaveMouldUnload', {
                EM_MACHINE: this.machine,
                EM_MOULD: this.moldNum
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('下模成功')
                    this.resultScan = {}
                    this.moldNum = ''
                    this.machine = ''
                }else{
                    this.$toast.fail('下模失败')
                }
            }).catch(err => err)
            this.$refs.scanInput.focus()
        },
        scaning() {
            axios.get(this.httpUrl + 'MES/GetMouldUnload?md=' + this.scanVal).then(res => {
                // console.log(res)
                if(res.status === 200){
                    if (res.data.length === 0) {
                        return this.$toast.fail('该编号不存在')
                    } else if (res.data[0].SP === '2') {
                        return this.$toast.fail('下模请扫描模具')
                    }
                    this.resultScan = res.data[0]
                    this.moldNum = this.resultScan.EM_MW1
                    this.machine = this.resultScan.EM_MW6
                }else{
                    this.$toast.fail('获取下模信息失败')
                }
            }).catch(err => err)
            this.scanVal = ''
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
</style>