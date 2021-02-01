<template>
    <div class="audit">
        <van-nav-bar fixed title="首末件审核" left-text="返回" left-arrow @click-left="$router.back()" />
        <switch-btn></switch-btn>
        <van-list @load="onLoad">
            <van-row 
                class="auditWrap"
                v-for="item in list" 
                :key="item.AW_ID">
                <van-col span="6" class="auditleft">
                    <img class="auditImg" src="../assets/shen.jpg"/>
                    <van-tag class="mark" mark type="warning">{{item.QP_CUST_CODE}}</van-tag>
                </van-col>
                <van-col span="10" class="auditcenter">
                    <span class="audittitle">{{item.QP_WORKER}}</span>
                    <span>日期：{{item.QP_PLAN_DATE}}</span>
                </van-col>
                <van-col span="8" class="auditright">
                    <span class="audittitle">{{item.QP_ITEM_CODE}}</span>
                    <span>品检员：{{item.QP_USERID}}</span>
                    <div class="btns">
                        <van-button round @click="detailAuditOrder(item)">详情</van-button>
                        <van-button round type="info" @click="handleAuditResult(item)">审核</van-button>
                    </div>
                </van-col>
            </van-row>
        </van-list>
        <!-- 审核弹出框 -->
        <van-popup v-model="resultShow" :style="{ width: '80%' }" @close="resetRemark">
            <van-form>
                <span>审核结果</span>
                <van-field
                    v-model="remarkAudit"
                    type="textarea"
                    ref="remarkInput"
                    placeholder="审核备注信息"
                    />
                <div style="margin: 16px;">
                    <van-button round block type="primary" @click="auditResultSubmit('Y')">通过</van-button>
                </div>
                <div style="margin: 16px;">
                    <van-button round block type="danger" @click="auditResultSubmit('N')">驳回</van-button>
                </div>
            </van-form>
        </van-popup>
    </div>
</template>
<script>
import SwitchBtn from './Switch'
import axios from 'axios'

export default {
    components: { SwitchBtn },
    data() {
        return {
            // 品检数据列表
            list: [],
            //审核备注信息
            remarkAudit: '',
            // 审核结果弹出框
            resultShow: false,
            QP_ONLY: '',
            auditResult: false,
        }
    },
    created() {
        this.getExamineWorks()
    },
    methods: {
        detailAuditOrder(row) {
            // 点击详情按钮，把当前数据保存到store
            this.$store.dispatch('handleChangeOrder', row)
            this.$router.push('/examdetails?QP_ONLY=' + row.QP_ONLY)
        },
        // 获取品检完的工单列表
        getExamineWorks() {
            axios.get('http://localhost:50814/MES/GetQcProductEnd')
            // axios.get(this.httpUrl + 'MES/GetQcProductEnd')
            .then(res => {
                // console.log(res)
                if(res.status === 200 && res.statusText === 'OK'){
                    this.list = res.data
                }else{
                    this.$toast.fail('获取首末检工单信息失败')
                }
            }).catch(err => err)
        },
        // 点击审核按钮，弹出审核结果备注提交框
        handleAuditResult(row) {
            this.resultShow = true
            this.QP_ONLY = row.QP_ONLY
            this.$nextTick(() => {
                this.$refs.remarkInput.focus()
            })
        },
        // 提交审核结果，点击“通过”result为“Y”,点击“驳回”result为“N”
        auditResultSubmit(result){
            if(this.remarkAudit === '') {
                this.$toast.fail('备注不能为空')
                return
            }
            axios.post('http://localhost:50814/MES/QcProductendPass', {
            // axios.post(this.httpUrl + 'MES/QcProductendPass', {
                "QP_ONLY": this.QP_ONLY,
                "QP_PASS": result,
                "QP_QC_REMARK": this.remarkAudit,
                "QP_QC_NAME": localStorage.getItem('operator')
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('审核结果提交成功')
                    // 更新列表
                    this.getExamineWorks()
                }else {
                    this.$toast.fail('审核结果提交失败')
                }
            }).catch(err => err)
            this.resultShow = false
            this.remarkAudit = ''
        },
        resetRemark() {
            this.remarkAudit = ''
        },
        onLoad() {
            
        }
    }
}
</script>
<style scoped>
.van-list{
    padding: 0 0.5rem;
}
.auditWrap{
    padding: 0.8rem 0;
    font-size: 0.5rem;
    position: relative;
    border-bottom: 0.5px solid #eee;
}
.auditImg{
    width: 4rem;
}
.auditleft{
    position: relative;
}
.mark{
    position: absolute;
    top: 0.25rem;
    left: 0;
}
.audittitle{
    font-size: 0.8rem;
    font-weight: 600;
}
.auditcenter, .auditright{
    display: flex;
    flex-direction: column;
    text-align: left;
}
.btns{
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
}
.btns .van-button{
    height: 2rem;
    margin-left: 5px;
    padding: 0 8px;
    font-size: 0.8rem;
}

.details{
    text-align: left;
    font-size: 0.5rem;
}
/deep/ .van-grid-item__content--center{
    align-items: flex-start;
}

.examWrap{
    padding: 0.8rem 0;
    position: relative;
    border-bottom: 0.5px solid #eee;
}
.examWrap .van-cell{
    padding: 0;
    font-size: 0.5rem;
}
.examImg{
    width: 4rem;
}
.examleft{
    position: relative;
}
.mark{
    position: absolute;
    top: 0.25rem;
    left: 0.1rem;
}
.examright .van-cell__value{
    text-align: left;
}
.examright .van-cell__title{
    flex: none;
    text-indent: 1rem;
}
.tags{
    display: flex;
    flex-direction: column;
    justify-items: baseline;
    position: absolute;
    left: 0.5rem;
    top: 5rem;
}
.tags .van-tag{
    margin-bottom: 0.3rem;
    font-size: 0.3rem;
}
.status{
    position: absolute;
    right: 1rem;
    bottom: 1rem;
}
</style>