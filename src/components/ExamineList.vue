<template>
    <div>
        <van-nav-bar fixed title="品检工单" left-text="返回" left-arrow @click-left="$router.back()" />
        <switch-btn></switch-btn>
        <!-- 工单列表 -->
        <van-list
            v-model="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad">
            <van-row 
                class="workWrap"
                v-for="item in list" 
                :key="item.AW_ID">
                <van-col span="6" class="workleft">
                    <img class="workImg" src="../assets/work.jpg"/>
                    <van-tag class="mark" mark type="warning">{{item.AW_CLASS}}</van-tag>
                </van-col>
                <van-col span="10" class="workcenter">
                    <span class="worktitle">{{item.AW_APS_WORKER}}</span>
                    <span>日期：{{item.AW_PLAN_DATE}}</span>
                </van-col>
                <van-col span="8" class="workright">
                    <span class="worktitle">{{item.AW_PRODUCT_HALF}}</span>
                    <span>计划数：{{item.AW_COUNT_PLAN}}</span>
                    <div class="btns">
                        <van-button round @click="toDetails(item)">详情</van-button>
                        <van-button round type="warning" @click="toExamine(item)">首/中/末检</van-button>
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
            machine: localStorage.getItem('machine'),
            user: localStorage.getItem('userName'),
            list: [],
            loading: false,
            finished: false
        }
    },
    created() {
        this.getWorkList()
    },
    methods: {
        getWorkList() {
            const jobNum = localStorage.getItem('jobNum') || 18875
            const user = localStorage.getItem('userName') || '唐春香'
            // 获取工单数据
            // axios.get('http://mengxuegu.com:7300/mock/5ea245bd2a2f716419f892c5/GetApsWorker?machine='+this.machine +'&time='+startDate+'&EndTime='+endDate)
            axios.get(this.httpUrl + 'MES/GetApsWorkerQc?u=' + jobNum+'|'+user)
            .then((res) => {
                console.log(res)
                if(res.status === 200) {
                    this.list = res.data
                    if(this.list.length === 0) {
                        this.$toast('获取工单数为0')
                    }
                }else{
                    this.$toast.fail('获取工单失败')
                }
            }).catch(err => err)
        },
        onLoad() {
        // 异步更新数据
        // setTimeout(() => {
        //     for (let i = 0; i < 10; i++) {
        //         this.list.push(this.list.length + 1)
        //         }
        //         // 加载状态结束
                this.loading = false
        //         // 数据全部加载完成
        //         if (this.list.length >= 40) {
        //         this.finished = true;
        //         }
        //     }, 1000)
        },
        toDetails(row) {
            // 点击详情按钮，把本工单数据保存到store
            this.$store.dispatch('handleChangeOrder', row)
            this.$router.push('/workdetails')
        },
        toExamine(row) {
            const {AW_APS_WORKER, AW_PRODUCT_HALF, AW_PLAN_DATE} = row
            this.$router.push('/examine?work='+AW_APS_WORKER+'&product='+AW_PRODUCT_HALF+'&date='+AW_PLAN_DATE)
        }
    }
}
</script>
<style scoped>
.searchs{
    padding-top: 2rem;
}
.searchWorkBtn{
    margin: 2rem;
}
.van-list{
    padding: 0 0.5rem;
}
.workWrap{
    padding: 0.8rem 0;
    font-size: 0.5rem;
    position: relative;
    border-bottom: 0.5px solid #eee;
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
</style>
