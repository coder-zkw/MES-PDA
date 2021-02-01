<template>
    <div class="prepfixture">
        <van-nav-bar fixed title="扫码备治具" left-text="返回" left-arrow @click-left="$router.back()" />
        <van-tag size="large" class="calendar">
            <van-icon name="notes-o" @click="showCalendar = true"></van-icon>
        </van-tag>
        <van-calendar v-model="showCalendar" :min-date="minDate" :max-date="maxDate" :show-confirm="false" @confirm="onConfirm" />
        <switch-btn></switch-btn>
        <div class="scanarea">
            <van-field
                class="scaninput"
                v-model="scanVal"
                ref="scanInput"
                @keypress.enter.native.prevent="scaning"
                placeholder="扫描治具号"
                />
        </div>
        <div class="infoarea" v-if="works.length != 0">
            <div class="infos">
                <h5>工单：{{works[workIndex].AW_APS_WORKER}} <span>当前工单：{{workIndex+1}}/{{works.length}}</span></h5>
                <div class="moldgroup" v-for="(item, i) in list" :key="i"> 
                    <div>治具：{{item.mold}} <i class="van-icon van-icon-success" v-show="item.isMold"></i></div>
                    <div>治具状态：{{statusText[item.status]}}</div>
                    <!-- <div>区域：{{item.area}}</div> -->
                    <div>储位：{{item.storage}} <i class="van-icon van-icon-success" v-show="item.isStorage"></i></div>
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
import SwitchBtn from '../Switch'
import axios from 'axios'
import getCurrentTime from '../../utils/currentTime'

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
            list: [
                // {workId: 'b6', mold: 'a123', storage: 'A-1',area: '23',status: 10},
                // {workId: 'b6', mold: 'a124', storage: 'A-1',area: '23',status: 15},
                // {workId: 'b6', mold: 'a126', storage: 'A-1',area: '23',status: 11},
                // {workId: 's7', mold: 'a129', storage: 'A-2',area: 'B',status: 12}
            ],
            //扫码结果
            scanVal: '',
            statusText: {10: '在库', 11:'待送', 12:'已备', 14:'已退', 15:'使用', 20:'保养', 25:'维修', 30:'外发', 35:'报废', 40:'封存，三年未使用', 45:'拆除'},
            isOk: false
        }
    },
    created() {
        this.onFocus()
        this.getMouldWorks()
        this.minDate = new Date(this.today.getTime() - 60*24 * 60 * 60 * 1000)
        this.maxDate = new Date(this.today.getTime() + 2*24 * 60 * 60 * 1000)
    },
    methods: {
        getMouldWorks(d) {
            var dateStr = d || getCurrentTime(new Date(this.today.getTime() + 24 * 60 * 60 * 1000))
            // axios.get('http://localhost:50814/MES/GetFixturnWorks?date=' + dateStr.substr(0,10))
            axios.get(this.httpUrl + 'MES/GetFixturnWorks?date=' + dateStr.substr(0,10))
            .then(res => {
                console.log(res)
                this.works = res.data.data
                if (this.works.length === 0) {
                    return this.$toast('当前日期没有未治具工单')
                }
                var fixturnName = this.works[this.workIndex].AW_PRODUCT_END.substr(0, 9)
                this.getNoPreparationList(fixturnName)
            }).catch(err => err)
        },
        // 获取未备治具列表
        getNoPreparationList(fixturn) {
            this.list = []
            axios.get(this.httpUrl + 'MES/GetWorkerFixturn?fixturn=' + fixturn)
            // axios.get('http://localhost:50814/MES/GetWorkerFixturn?fixturn=' + fixturn)
            .then(res => {
                console.log(res)
                if(res.status === 200 && res.statusText === 'OK'){
                    var datas = res.data.data
                    if (datas.length === 0) {
                        return this.$toast('查询数据为空')
                    }
                    for(var i = 0; i < datas.length; i++) {
                        var obj = {}
                        obj.mold = datas[i].FIX_SN
                        obj.status = datas[i].STATUS
                        obj.storage = datas[i].PLACE
                        obj.isMold = false
                        obj.isStorage = false
                        this.list.push(obj)
                    }
                }else{
                    this.$toast.fail('获取未备治具列表信息失败')
                }
            }).catch(err => err)
            this.onFocus()
        },
        onConfirm(date) {
            this.getMouldWorks(getCurrentTime(date))
            this.showCalendar = false
        },
        scaning() {
            // 扫描后判断结果
            this.list.map(item => {
                if (this.scanVal === item.mold) {
                    item.isMold = true
                    this.isOk = true
                    return
                }
            })
            if (!this.isOk) {
                this.$toast.fail('该项不属于待备治具')
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
            // var user = localStorage.getItem('userName')
            var molds = []
            var isAll = true
            this.list.map(item => {
                if (item.isMold) {
                    molds.push({
                        EM_WORKER: this.works[this.workIndex].AW_APS_WORKER,
                        EM_FIXTURE: item.mold,
                        EM_USER: localStorage.getItem('userName')
                    })
                } else {
                    if (item.status === 10) {
                        isAll = false
                    }
                }
            })
            if(!isAll) {
                return this.$toast.fail('有在库治具未扫码')
            }
            if(molds.length === 0) {
                this.onFocus()
                return this.$toast.fail('治具未扫码')
            }
            axios.post(this.httpUrl + 'MES/SaveFixturn', {
            // axios.post('http://localhost:50814/MES/SaveFixturn', {
                MOLDS: molds
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('备治具成功')
                    if (this.workIndex < this.works.length) {
                        var fixturnName = this.works[this.workIndex++].AW_PRODUCT_END.substr(0, 9)
                        this.getNoPreparationList(fixturnName)
                    } else {
                        this.list = []
                        this.$toast('暂无未备治具工单')
                    }
                }else{
                    this.$toast.fail('备治具失败')
                }
            }).catch(err => err)
        },
        nextWorker() {
            if (this.workIndex+1 === this.works.length) {
                this.$toast('当前已是最后一个工单')
            } else {   
                this.$dialog.confirm({
                    message: '是否放弃当前工单备治具？',
                    })
                    .then(() => {
                        this.workIndex++
                        if(this.works[this.workIndex].AW_PRODUCT_END === null) {
                            this.list = []
                        }
                        var fixturnName = this.works[this.workIndex].AW_PRODUCT_END.substr(0, 9)
                        this.getNoPreparationList(fixturnName)
                        this.onFocus()
                    })
                    .catch(() => {
                        // on cancel
                    })
            }
        },
        onFocus() {
            this.$nextTick(() => {
                this.$refs.scanInput.focus()
            })
        }
    }
}
</script>
<style scoped>
.scanarea{
    width: 100%;
    display: flex;
    justify-content: center;
    background: #fff;
    position: fixed;
    z-index: 9;
}
.btnwrap{
    width: 100%;
    display: flex;
    justify-content: space-around;
}
.infoarea{
    padding: 4rem 1.5rem 2rem;
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