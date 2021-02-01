<template>
    <div class="examdetails">
        <van-sticky>
        <van-nav-bar title="品检详情" fixed left-text="返回" left-arrow @click-left="$router.back()" />
        <switch-btn></switch-btn>
        </van-sticky>
        <van-grid :column-num="2">
            <van-grid-item v-for="(item, i) in columnsAll" :key="i">
                <span class="details">{{item.name}}：{{detailData[item.c]}}</span>
            </van-grid-item>
        </van-grid>
        <!-- 分割线 -->
        <van-divider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 1rem' }">品检项</van-divider>
        <van-list @load="onLoad">
            <van-row 
                class="examWrap"
                v-for="(item, i) in auditData" 
                :key="i">
                <van-col span="6" class="examleft">
                    <img class="examImg" src="../assets/pinjian.jpg"/>
                    <van-tag class="mark" type="warning">{{i+1}}</van-tag>
                </van-col>
                <van-col span="18" class="examright">
                    <van-cell title="品检类别：" :value="item.QP_CATE_NAME || ''" />
                    <van-cell title="品检项目：" :value="item.QP_QC_ITEM || ''" />
                    <van-cell title="规格：" :value="item.QP_WL_SPEC || ''" />
                    <van-cell title="品检备注：" :value="item.QP_QC_REMARK || ''" />
                    <van-cell title="标准值：" :value="item.QP_QC_VALUE || ''" />
                    <van-cell title="检验值：" :value="item.QP_INPUTVAL || ''" />
                    <!-- <van-cell title="状态：" :value="item.QP_STATUS || ''" /> -->
                    <van-tag 
                        class="status"
                        size="medium"
                        v-if="item.QP_STATUS != null"
                        :type="item.QP_STATUS === 'OK' ? 'success' : 'danger'">
                        {{item.QP_STATUS}}
                    </van-tag>
                    <div class="tags">
                        <van-tag round>{{item.QP_TOOL_NAME}}</van-tag>
                        <van-tag round>{{item.QP_INPUT_MODE}}</van-tag>
                    </div>
                </van-col>
            </van-row>
        </van-list>
    </div>
</template>
<script>
import SwitchBtn from './Switch'
import axios from 'axios'

export default {
    components: { SwitchBtn },
    data() {
        return {
            // 首末检工单列表标题项及对应属性名
            columnsAll: [
                {name:'工 号', c: 'QP_USERID'}, 
                {name:'计划日期', c: 'QP_PLAN_DATE'}, 
                {name:'机 台', c: 'QP_MACHINE'}, 
                {name:'制 令', c: 'QP_WORKER'}, 
                {name:'成品编号', c: 'QP_ITEM_CODE'}, 
                {name:'成品名称', c: 'QP_ITEM_NAME'}, 
                {name:'成品规格', c: 'QP_ITEM_SPEC'}, 
                {name:'客户编号', c: 'QP_CUST_CODE'}, 
                {name:'图纸日期', c: 'QP_CAD_DATE'}, 
                {name:'图纸版次', c: 'QP_CAD_VER'},
                {name:'工序序号', c: 'QP_WS_IDX'}, 
                {name:'工序名称', c: 'QP_GX_NAME'}, 
                {name:'工序描述', c: 'QP_WS_DESC'}, 
                {name:'实物编号', c: 'QP_IDENTIFIER'},
                {name:'备 注', c: 'QP_REMARK'},
                {name:'品检结果', c: 'QP_PASS'}
            ],
            // 点击某一条详情的信息
            detailData: [],
            // 具体某工单的品检信息
            auditData: [],
            auditResult: false
        }
    },
    created() {
        // 从store获取点击详情的那条品检信息
        this.detailData = this.$store.state.currentOrderData
        this.detailAuditOrder()
    },
    methods: {
        detailAuditOrder() {
            // console.log(row)
            // this.detailData = row
            const QP_ONLY = this.detailData.QP_ONLY
            // for(let i = 0; i < this.columnsAll.length; i++) {
            //     this.detailData.push(row[this.columnsAll[i].c])
            // }
            // 获取品检结果信息列表
            // axios.get('http://mengxuegu.com:7300/mock/5ea245bd2a2f716419f892c5/GetQcDetails?QP_ONLY='+ QP_ONLY)
            axios.get(this.httpUrl + 'MES/GetQcDetails?QP_ONLY='+ QP_ONLY)
            .then(res => {
                // console.log(res)
                if(res.status === 200 && res.statusText === 'OK'){
                    this.auditData = res.data
                }else{
                    this.$toast.fail('获取品检信息失败')
                }
            }).catch(err => err)
            this.detailsShow = true
        },
        // 点击审核按钮，弹出审核结果备注提交框
        handleAuditResult(row) {
            this.QP_ONLY = row.QP_ONLY
            this.dialogResultVisible = true
        },
        // 提交审核结果，点击“通过”result为“Y”,点击“驳回”result为“N”
        auditResultSubmit(result){
            axios.post(this.httpUrl + 'MES/QcProductendPass', {
                "QP_ONLY": this.QP_ONLY,
                "QP_PASS": result,
                "QP_QC_REMARK": this.form.remark,
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
            this.dialogResultVisible = false
            this.form.remark = ''
        },
        resetRemark() {
            this.form.remark = ''
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
    left: 0.5rem;
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