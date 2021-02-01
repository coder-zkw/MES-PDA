<template>
    <div class="details">
        <van-nav-bar fixed title="工单详情" left-text="返回" left-arrow @click-left="$router.back()"/>
        <switch-btn></switch-btn>
        <van-row class="workWrap">
            <van-col span="6" class="workleft">
                <img class="workImg" src="../assets/work.jpg"/>
                <van-tag class="mark" mark type="warning">{{currentWork.AW_CLASS}}</van-tag>
            </van-col>
            <van-col span="10" class="workcenter">
                <span class="worktitle">{{currentWork.AW_APS_WORKER}}</span>
                <span>日期：{{currentWork.AW_PLAN_DATE}}</span>
            </van-col>
            <van-col span="8" class="workright">
                <span class="worktitle">{{currentWork.AW_PRODUCT_HALF}}</span>
                <span>计划数：{{currentWork.AW_COUNT_PLAN}}</span>
            </van-col>
        </van-row>
        <van-cell-group>
            <van-cell 
                v-for="item in titles" 
                :key="item.S_ID" 
                :title="item.S_CHINESE" 
                :value="currentWork[item.S_NAME]==null ? '' : currentWork[item.S_NAME]" />
        </van-cell-group>
    </div>
</template>
<script>
import SwitchBtn from './Switch'
import axios from 'axios'

export default {
    components: { SwitchBtn },
    data() {
        return {
            currentWork: {},
            titles: []
        }
    },
    created() {
        this.currentWork = this.$store.state.currentOrderData
        this.getTitles()
    },
    methods: {
        getTitles() {
            axios.get(this.httpUrl + 'MES/GetTitle?page=APS_WORKER')
            .then((res) => {
                // console.log(res)
                if(res.status === 200) {
                    this.titles = res.data
                }else{
                    this.$toast.fail('获取工单数据失败')
                }
            })
        }
    }
}
</script>
<style scoped>
.workWrap{
    padding: 0.8rem 0;
    font-size: 0.5rem;
    position: relative;
    border-bottom: 0.5px solid #eee;
    background: #fff;
}
.workImg{
    width: 4rem;
}
.workleft{
    position: relative;
}
.mark{
    position: absolute;
    top: 0.25rem;
    left: 0;
}
.worktitle{
    font-size: 0.8rem;
    font-weight: 600;
}
.workcenter, .workright{
    display: flex;
    flex-direction: column;
    text-align: left;
}
.van-cell__title,.van-cell__value{
    text-align: left;
}
</style>