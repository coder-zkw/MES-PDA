<template>
    <div class="audit">
        <van-nav-bar fixed :title="'备模('+workDate+')'" left-text="返回" left-arrow @click-left="$router.back()" />
        <van-tag size="large" class="calendar">
            <van-icon name="notes-o" @click="showCalendar = true"></van-icon>
        </van-tag>
        <van-calendar v-model="showCalendar" :min-date="minDate" :max-date="maxDate" :show-confirm="false" @confirm="onConfirm" />
        <switch-btn></switch-btn>   
        <div class="scanarea">
            <div class="setprior">
                <van-search v-model="searchVal" placeholder="请输入工单" @input="changeWork" @search="searchWork"/>
                <div class="searchList" v-show="searchList.length !== 0">
                    <van-cell v-for="(item,i) in searchList" :key="i" :value="item.AW_APS_WORKER" @click="selectWork(item.AW_APS_WORKER)" />
                </div>
                <van-checkbox v-model="isPrior_pro" class="checkbox">产线模具优先</van-checkbox>
            </div>
            <van-field
                class="scaninput"
                v-model="scanVal"
                ref="scanInput"
                @keypress.enter.native.prevent="scaning"
                placeholder="扫描模具号"
                />
        </div>
        <div class="infoarea" v-if="works.length !==0 && list.length !== 0">
            <div class="infos">
                <h5>工单：{{works[workIndex].AW_APS_WORKER}} <span>当前工单：{{workIndex+1}}/{{works.length}}</span></h5>
                <div class="moldgroup" v-for="(item, i) in list" :key="i"> 
                    <div>模具：{{item.MOD_SN}} <i class="van-icon van-icon-success" v-show="item.isMold"></i></div>
                    <div>模具状态：{{statusText[item.STATUS]}}</div>
                    <!-- <div>区域：{{item.area}}</div> -->
                    <div>储位：{{item.PLACE}} <i class="van-icon van-icon-success" v-show="item.isStorage"></i></div>
                </div>
            </div>
        </div>
        <div class="btnwrap">
            <van-button type="info" @click="nextWorker">下个工单</van-button>
            <van-button type="primary" @click="saveSubmit">提 交</van-button>
        </div>
    </div>
</template>
<script>
import SwitchBtn from './Switch'
import axios from 'axios'
import getCurrentTime from '../utils/currentTime'

export default {
    components: { SwitchBtn },
    data() {
        return {
            showCalendar: false,
            today: new Date(),
            minDate: null,
            maxDate: null,
            // 未备模具列表
            works: [],
            workIndex: 0,
            list: [],
            //扫码结果
            scanVal: '',
            statusText: {10: '在库', 11:'待送模', 12:'已备', 14:'已退', 15:'使用', 20:'保养', 25:'维修', 30:'外发', 35:'报废', 40:'封存，三年未使用', 45:'拆除'},
            moldTypes: [],
            isOk: false,
            isPrior_pro: localStorage.getItem('priority') || false,
            searchVal: '',
            searchList: [],
            workDate: ''
        }
    },
    created() {
        this.onFocus()
        this.getMouldWorks()
        // this.getNoPreparationList()
        this.minDate = new Date(this.today.getTime() - 7*24 * 60 * 60 * 1000)
        this.maxDate = new Date(this.today.getTime() + 2*24 * 60 * 60 * 1000)
    },
    methods: {
        getMouldWorks(d) {
            this.works = []
            var dateStr = d || getCurrentTime(new Date(this.today.getTime() + 24 * 60 * 60 * 1000))
            this.workDate = dateStr.substr(0,10)
            // axios.get('http://localhost:50814/MES/getMouldWorks?date=' + this.workDate)
            axios.get(this.httpUrl + 'MES/getMouldWorks?date=' + this.workDate   )
            .then(res => {
                console.log(res)
                this.works = res.data.data
                if (this.works.length === 0) {
                    return this.$toast('当前日期没有未备模工单')
                }
                this.getNoPreparationList(this.works[this.workIndex].AW_APS_WORKER)
            }).catch(err => err)
        },
        // 获取未备模列表
        getNoPreparationList(workId) {
            this.list = []
            axios.get(this.httpUrl + 'MES/GetWorkerMould?workid=' + workId + '&prior='+ this.isPrior_pro)
            // axios.get('http://localhost:50814/MES/GetWorkerMould?workid=' + workId + '&prior='+ this.isPrior_pro)
            .then(res => {
                // console.log(res)
                if(res.status === 200){
                    var datas = res.data
                    if (datas.length === 0) {
                        return this.$toast('查询数据为空')
                    }
                    datas.map(item => {
                        item.isMold = false,
                        item.isStorage = false
                    })
                    this.list = datas;
                }else{
                    this.$toast.fail('获取未备模列表信息失败')
                }
            }).catch(err => err)
            this.onFocus()
        },
        onConfirm(date) {
            this.getMouldWorks(getCurrentTime(date))
            this.showCalendar = false
            this.works = []
            this.list = []
            this.workIndex = 0
        },
        scaning() {
            // 扫描后判断结果
            this.list.map(item => {
                if (this.scanVal === item.MOD_SN) {
                    item.isMold = true
                    this.isOk = true
                    return
                }
            })
            if (!this.isOk) {
                this.$toast.fail('该项不属于备模模具')
            } else {
                var lastMold = this.list.filter(item => {
                    return !item.isMold
                })
                if (lastMold.length === 0) {
                    this.saveSubmit()
                }
            }
            this.scanVal = ''
            this.isOk = false
        },
        saveSubmit() {
            // 保存数据
            var user = localStorage.getItem('userName')
            var molds = []
            this.list.map(item => {
                if (item.STATUS === 10) {
                    if (item.isMold) {
                        molds.push({
                            EM_WORKER: this.works[this.workIndex].AW_APS_WORKER,
                            EM_MOULD: item.MOD_SN,
                            EM_USER: user
                        })
                    }
                } 
            })
            if(molds.length === 0) {
                this.onFocus()
                return this.$toast.fail('模具未扫码')
            }
            axios.post(this.httpUrl + 'MES/SaveMould', {
            // axios.post('http://localhost:50814/MES/SaveMould', {
                MOLDS: molds
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('备模成功')
                    this.workIndex++
                    if (this.workIndex < this.works.length) {
                        this.getNoPreparationList(this.works[this.workIndex].AW_APS_WORKER)
                    } else {
                        this.list = []
                        this.$toast('暂无未备模工单')
                    }
                }else{
                    this.$toast.fail('备模失败')
                }
            }).catch(err => err)
        },
        nextWorker() {
            if (this.workIndex+1 === this.works.length) {
                this.$toast('当前已是最后一个工单')
            } else {   
                this.$dialog.confirm({
                    message: '是否放弃当前工单备模？',
                    })
                    .then(() => {
                        this.getNoPreparationList(this.works[++this.workIndex].AW_APS_WORKER)
                    })
                    .catch(() => {
                        // on cancel
                    })
            }
        },
        // 输入字符查询
        changeWork(val) {
            if (val === '') {
                return this.searchList = []
            }
            this.searchList = this.works.filter(item => item.AW_APS_WORKER.includes(val))
        },
        // enter查询
        searchWork(val) {
            if (val === '') {
                return this.searchList = []
            }
            this.searchList = this.works.filter(item => item.AW_APS_WORKER.includes(val))
        },
        selectWork(workid) {
            this.searchVal = ''
            this.searchList = []
            this.workIndex = this.works.findIndex(item => item.AW_APS_WORKER === workid)
            this.getNoPreparationList(workid)
        },
        onFocus() {
            this.$nextTick(() => {
                this.$refs.scanInput.focus()
            })
        }
    },
    watch: {
        isPrior_pro(curr) {
            if (curr) {
                localStorage.setItem('priority', true)
            } else {
                localStorage.removeItem('priority')
            }
            this.onFocus()
        }
    }
}
</script>
<style scoped>
.scanarea{
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #fff;
    position: fixed;
    z-index: 9;
}
.scanarea .setprior{
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0.5rem 0.5rem 0 0;
}
.setprior .checkbox{
    font-size: 0.8rem;
}
.setprior .searchList{
    width: 100%;
    position: absolute;
    left: 0;
    top: 3.2rem;
    z-index: 99;
}
.setprior .searchList .van-cell{
    padding: 3px 10px;
}
.btnwrap{
    width: 100%;
    display: flex;
    justify-content: space-around;
}
.infoarea{
    padding: 8rem 1.5rem 2rem;
}
.scaninput{
    width: 80%;
    margin-top: 1rem;
    height: 3rem;
    line-height: 1.6rem;
    border: 1px solid rgb(5, 172, 238);
    border-radius: 5px;
}
.infos{
    height: 50%;
    margin: 1rem 0;
    padding: 0 1.5rem;
    text-align: left;
    border: 1px solid #999;
}
.infos h5{
    display: flex;
    justify-content: space-between;
}
.moldgroup{
    margin-bottom: 5px;
    border-bottom: 1px solid rgb(5, 172, 238);
}
.infos .van-icon{
    font-size: 1.5rem;
    color: forestgreen;
    position: absolute;
    left: 1.5rem;
}
.calendar{
    position: fixed;
    right: 2rem;
    top: 2rem;
    z-index: 10;
}
</style>