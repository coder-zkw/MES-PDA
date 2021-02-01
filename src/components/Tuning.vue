<template>
    <div class="tuning">
        <van-nav-bar fixed title="扫码验证" left-text="返回" left-arrow @click-left="$router.back()"/>
        <switch-btn></switch-btn>
        <van-field class="saoma" ref="scanInput" v-model="inputVal" @keyup.enter.native="scaning"/>
        <van-grid :column-num="1" v-if="isCheck === '1'" class="tunInfo checkTun">
            <van-grid-item v-for="(item, i) in checkList" :key="i">
                <span>产品型号：{{item.PA_SIZE}}</span>
                <span>物料编号：{{item.PA_METRIAL}}</span>
                <span>物料名称：{{item.PA_NAME}}</span>
                <span>规格/型号：{{item.PA_SIZE}}</span>
                <span>扫码结果：{{item.scan_result}}
                    <van-icon name="checked" v-show="item.checked" color="#07c160" size="24" />
                </span>
            </van-grid-item>
        </van-grid>
        <div class="noChecklist" v-else v-show="noCheckList.length>0">
            <div class="btns">
                <van-button type="primary" @click="noChecksSubmit">确定</van-button>
                <van-button type="warning" @click="noChecksEmpty">清空</van-button>
            </div>
            <van-grid :column-num="1" direction="horizontal" class="tunInfo">
            <van-grid-item v-for="(item, i) in noCheckList" :key="i">
                <span>{{item.scan_result}}</span>
                <van-button icon="delete" type="danger" size="small" @click="deleteItem(i)"></van-button>
            </van-grid-item>
        </van-grid>
        </div>
    </div>
</template>
<script>
import SwitchBtn from './Switch'
import axios from 'axios'

export default {
    components: { SwitchBtn },
    data() {
        return {
            machine: localStorage.getItem('machine'),
            checkList: [],
            noCheckList: [],
            isCheck: '0',
            inputVal: '',
            disabledFlag: false
        }
    },
    created() {
        const { work, product, isCheck} = this.$route.query
        this.work = work
        this.product = product
        this.isCheck = isCheck
        this.getCheckList()
    },
    mounted() {
        this.scanInputFocus()
    },
    methods: {
        getCheckList() {
            // axios.get(this.httpUrl + 'MES/GetTitle?page=PRD_APS_BOM')
            // .then((res) => {
            //     console.log(res)
            //     let newData = res.data
            //     const newcolum = {
            //         S_CHINESE: "扫描码",
            //         S_NAME: 'scan_result'
            //     }
            //     newData.push(newcolum)
            //     this.columns = newData
            // }).catch(err => err)
            // axios.get('http://mengxuegu.com:7300/mock/5ea245bd2a2f716419f892c5/GetProductHalf')
            axios.get(this.httpUrl + 'MES/GetProductHalf?wo='+ this.product)
            .then((res) => {
                // console.log(res)
                this.checkList = res.data
            }).catch(err => err)
        },
        scaning() {
            const value = this.inputVal.trim()
            if(value === '') {
                this.$toast.fail('扫描结果为空')
                return
            }
            // 不需验证只增加扫描值
            if(this.isCheck === '0'){
                this.noCheckList.push({scan_result: value})
            }else{
                // 需要验证则验证结果
                const datas = this.checkList
                // 遍历查找列表中是否存在输入框中的值
                let index = datas.findIndex((item) => (value.toLowerCase( ).indexOf(item.PA_METRIAL.toLowerCase( )) != -1))
                if(index != '-1') {
                    // 若存在，把扫描结果写入扫描码处，并选中此行
                    this.$set(this.checkList[index], 'scan_result' , value)
                    this.$set(this.checkList[index], 'checked' , true)
                }else{
                    this.$toast.fail('不属验证项，请重新扫码')
                }
                // 遍历列表中checkd属性是否都为true
                let checkedNum = datas.filter(item => item.checked === true)
                if(checkedNum.length != 0 && checkedNum.length === datas.length) {
                    // 校验成功，禁用扫码框
                    this.disabledFlag = true
                    // 弹出提交验证数据且页面将返回框
                    this.promptAlert()
                }
            }
            // 输入框清空
            this.inputVal = ''
        },
        deleteItem(i) {
            this.noCheckList.splice(i, 1)
            this.scanInputFocus()
        },
        noChecksEmpty() {
            this.$dialog.confirm({
                message: '确定清空所有数据？'
            }).then(() => {
                this.noCheckList = []
                this.scanInputFocus()
            }).catch(err => err)
        },
        // 提示返回并提交验证结果
        promptAlert() {
            this.$dialog.alert({
                message: '验证结果已提交！即将返回工单页面',
            }).then(() => {
                this.checkScans()
            })
        },
        noChecksSubmit() {
            this.$dialog.confirm({
                message: '结束扫码验证，提交结果'
            }).then(() => {
                this.promptAlert()
            }).catch(err => err)
        },
        // 将扫码结果数组变为字符串格式
        getScans(){
            // console.log(this.noCheckData)
            let scans = []
            let scansArray = null;
            if(this.isCheck==='0'){
                scansArray = this.noCheckList
            }else{
                scansArray = this.checkList
            }
            scansArray.map(item => scans.push(item.scan_result))
            return scans.join(',')
        },
        // 上传验证结果
        checkScans() {
            const PM_WORKER = this.work
            const PM_PRODUCT_HALF = this.product
            const PM_MACHINE = this.machine
            const PM_METRIAL = this.getScans()
            axios.post(this.httpUrl + 'MES/Metrial', {PM_WORKER, PM_MACHINE, PM_PRODUCT_HALF, PM_METRIAL})
            .then(res => {
                // console.log(res)
                if(res.data.code===200) {
                    this.$toast.success('调机校验成功')
                    this.$router.replace('/worklist')
                }else{
                    this.$toast.fail('调机校验失败')
                }
            }).catch(err => err)
        },
        scanInputFocus() {
            this.$refs.scanInput.focus()
        }
    }
}
</script>
<style scoped>
.saoma{
    width: 80%;
    height: 4rem;
    margin: 1rem auto;
    font-size: 2rem;
    vertical-align: middle;
    border-color: rgb(38, 181, 238);
    border-style: solid;
}
.tunInfo{
    font-size: 0.8rem;
}
.btns{
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
}
.btns .van-button{
    margin-right: 0.5rem;
}
/deep/ .checkTun .van-grid-item__content--center{
    align-items: flex-start;
}
/deep/ .noChecklist .van-grid-item__content--center{
    justify-content: space-around;
}
.checkTun .van-icon{
    position: relative;
    top: 0.4rem;
    left: 0.5rem;
}
</style>
