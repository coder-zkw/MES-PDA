<template>
    <div class="audit">
        <van-nav-bar fixed title="扫码备模" left-text="返回" left-arrow @click-left="$router.back()" />
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
                placeholder="扫描模具号"
                />
        </div>
        <div class="infoarea">
            <div class="infos" v-if="list.length !== 0">
                <div class="moldgroup" v-for="(item, i) in list" :key="i">
                    <h5>工单：{{item.workId}}</h5>
                    <div>模具：{{item.mold}} <i class="van-icon van-icon-success" v-show="item.isMold"></i></div>
                    <div>模具状态：{{statusText[item.status]}}</div>
                    <!-- <div>区域：{{item.area}}</div> -->
                    <div>储位：{{item.storage}} <i class="van-icon van-icon-success" v-show="item.isStorage"></i></div>
                </div>
            </div>
        </div>
        <div class="btnwrap">
            <van-button round block type="info" @click="saveSubmit">提交</van-button>
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
            list: [
                // {workId: 'b6', mold: 'a123', storage: 'A-1',area: '23',status: 10},
                // {workId: 'b6', mold: 'a124', storage: 'A-1',area: '23',status: 15},
                // {workId: 'b6', mold: 'a126', storage: 'A-1',area: '23',status: 11},
                // {workId: 's7', mold: 'a129', storage: 'A-2',area: 'B',status: 12}
            ],
            //扫码结果
            scanVal: '',
            statusText: {10: '在库', 12:'备模', 15:'使用', 20:'保养', 25:'维修', 30:'外发', 35:'报废', 40:'封存，三年未使用', 45:'拆除', 11:'待送模', 13:'待上模', 14:'待退模'},
            moldTypes: [],
            isOk: false
        }
    },
    created() {
        this.onFocus()
        this.getNoPreparationList()
        this.minDate = new Date(this.today.getTime() - 27*24 * 60 * 60 * 1000)
        this.maxDate = new Date(this.today.getTime() + 2*24 * 60 * 60 * 1000)
    },
    methods: {
        // 获取未备模列表
        getNoPreparationList(d) {
            this.list = []
            var dateStr = d || getCurrentTime(new Date(this.today.getTime() + 24 * 60 * 60 * 1000))
            axios.get(this.httpUrl + 'MES/GetWorkerMould?date=' + dateStr.substr(0,10))
            // axios.get('http://localhost:50814/MES/GetWorkerMould?date=' + dateStr.substr(0,10))
            .then(res => {
                console.log(res)
                if(res.status === 200 && res.statusText === 'OK'){
                    var datas = res.data
                    if (datas.length === 0) {
                        return this.$toast('查询数据为空')
                    }
                    var obj = {}
                    for(var i = 0; i < datas.length; i++) {
                        var molds = datas[i].children
                        for (var j = 0; j < molds.length; j++) {
                            var moldtype = molds[j].EM4
                            if (this.moldTypes.indexOf(moldtype) === -1) {
                                this.moldTypes.push(moldtype)
                            } else {
                                continue
                            }
                            obj.mold = molds[j].EM1
                            obj.workId = molds[j].EM2
                            obj.status = molds[j].EM3
                            obj.storage = molds[j].EM5
                            obj.isMold = false
                            obj.isStorage = false
                            this.list.push(obj)
                            obj = {}
                        }
                    }
                    this.moldTypes = []
                }else{
                    this.$toast.fail('获取未备模列表信息失败')
                }
            }).catch(err => err)
            this.onFocus()
        },
        onConfirm(date) {
            this.getNoPreparationList(getCurrentTime(date))
            this.showCalendar = false
        },
        scaning() {
            // 扫描后判断结果
            this.list.map(item => {
                if (this.scanVal === item.mold) {
                    item.isMold = true
                    this.$toast('模具号正确')
                    this.isOk = true
                    return
                }
            })
            if (!this.isOk) {
                this.$toast.fail('该项不属于备模模具')
            }
            this.scanVal = ''
        },
        saveSubmit() {
            // 保存数据
            var molds = []
            var isAll = true
            this.list.map(item => {
                if (item.isMold) {
                    molds.push({
                        EM_WORKER: item.workId,
                        EM_MOULD: item.mold
                    })
                } else {
                    if (item.status === 10) {
                        isAll = false
                    }
                }
            })
            if(!isAll) {
                return this.$toast.fail('有在库模具未扫码')
            }
            axios.post(this.httpUrl + 'MES/SaveMould', {
            // axios.post('http://localhost:50814/MES/SaveMould', {
                MOLDS: molds
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('备模成功')
                }else{
                    this.$toast.fail('备模失败')
                }
            }).catch(err => err)
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
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 9;
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
.moldgroup{
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