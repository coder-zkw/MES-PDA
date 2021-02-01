<template>
    <div class="audit">
        <van-nav-bar fixed title="未备模具列表" left-text="返回" left-arrow @click-left="$router.back()" />
        <van-tag size="large" class="calendar">
            <van-icon name="notes-o" @click="showCalendar = true"></van-icon>
        </van-tag>
        <van-calendar v-model="showCalendar" :show-confirm="false" @confirm="onConfirm" />
        <switch-btn></switch-btn>
        <van-list>
            <van-row 
                class="auditWrap"
                v-for="(item, i) in list" 
                :key="i">
                <van-col span="5" class="auditleft">
                    <img class="auditImg" src="../assets/mold.jpg"/>
                    <!-- <van-tag class="mark" mark type="warning">{{item.QP_CUST_CODE}}</van-tag> -->
                </van-col>
                <van-col span="14" class="auditcenter">
                    <span class="audittitle">{{item.workId}}</span>
                    <span>模具：{{item.mold}}</span>
                    <span>储位：{{item.storage}}</span>
                </van-col>
                <van-col span="5" class="auditright">
                    <div class="btns">
                        <van-button round type="info" @click="startPreparing(item)">开始备模</van-button>
                    </div>
                </van-col>
            </van-row>
        </van-list>
        <!-- 审核弹出框 -->
        <van-popup v-model="scanbox" position="top" closeable>
            <van-form class="scanarea">
                <span>扫码备模</span>
                <van-field
                    class="scaninput"
                    v-model="scanVal"
                    ref="scanInput"
                    @keypress.enter.native.prevent="scaning"
                    placeholder="扫描储位号、模具号"
                    />
                <div class="infos">
                    <h3>工单：{{currentwork}}</h3>
                    <div class="moldgroup" v-for="(item, i) in currentScan" :key="i">
                        <div>模具：{{item.mold}} <i class="van-icon van-icon-success" v-show="item.isMold"></i></div>
                        <!-- <div>库位：{{item.location}}</div> -->
                        <div>区域：{{item.area}}</div>
                        <div>储位：{{item.storage}} <i class="van-icon van-icon-success" v-show="item.isStorage"></i></div>
                    </div>
                </div>
                <van-button round block type="info" @click="saveSubmit">提交</van-button>
            </van-form>
        </van-popup>
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
            // 未备模具列表
            list: [
                // {workId: '123456', mold: 'abc123,a2', storage: 'A-1',area: '23',location: '35k'},
                // {workId: '123457', mold: 'abc124', storage: 'A-2',area: 'B',location: '4rg'}
            ],
            //扫码结果
            scanVal: '',
            // 开始扫描弹出框
            scanbox: false,
            currentwork: '',
            currentMolds: '',
            currentScan: [],
            isOk: false
        }
    },
    created() {
        this.getNoPreparationList()
    },
    methods: {
        // 获取未备模列表
        getNoPreparationList() {
            axios.get(this.httpUrl + 'MES/GetWorkerMould')
            .then(res => {
                console.log(res)
                if(res.status === 200 && res.statusText === 'OK'){
                    var datas = res.data
                    if (datas.length === 0) {
                        return this.$toast('查询数据为空')
                    }
                    var obj = {}
                    for(var i = 0; i < datas.length; i++) {
                        obj.workId = datas[i].EMID
                        var molds = datas[i].children
                        obj.mold = molds[0].EM1
                        obj.location = molds[0].EM3
                        obj.area = molds[0].EM4
                        obj.storage = molds[0].EM5
                        for (var j = 1; j < molds.length; j++) {
                            obj.mold += ',' + molds[j].EM1
                            obj.location += ',' + molds[j].EM3
                            obj.area += ',' + molds[j].EM4
                            obj.storage += ',' + molds[j].EM5
                        }
                        this.list.push(obj)
                        obj = {}
                    }
                }else{
                    this.$toast.fail('获取未备模列表信息失败')
                }
            }).catch(err => err)
        },
        // 点击审核按钮，弹出审核结果备注提交框
        startPreparing(row) {
            this.currentwork = row.workId
            this.currentMolds = row.mold
            this.currentScan = []
            var molds = row.mold.split(',')
            for (var i = 0; i < molds.length; i++) {
                var obj = {}
                obj.mold = molds[i]
                obj.location = row.location.split(',')[i]
                obj.area = row.area.split(',')[i]
                obj.storage = row.storage.split(',')[i]
                obj.isMold = false
                obj.isStorage = false
                this.currentScan.push(obj)
            }
           
            this.scanbox = true
            this.$nextTick(() => {
                this.$refs.scanInput.focus()
            })
        },
        onConfirm(date) {
            console.log(getCurrentTime(date))
            this.showCalendar = false
        },
        scaning() {
            // 扫描后判断结果
            this.isOk = false
            this.currentScan.map(item => {
                if (this.scanVal === item.mold) {
                    item.isMold = true
                    this.$toast('模具号正确')
                    this.isOk = true
                    return
                } else if(this.scanVal === item.storage) {
                    item.isStorage = true
                    this.$toast('储位号正确')
                    this.isOk = true
                    return
                }
            })
            if (!this.isOk) {
                this.$toast.fail('非此工单模具或储位')
            }
            // 扫码后判断剩余未扫码的模具
            var lastMold = this.currentScan.filter(item => {
                return !item.isMold || !item.isStorage
            })
            if (lastMold.length === 0) {
                this.saveSubmit()
            }
            this.scanVal = ''
        },
        saveSubmit() {
            // 保存数据
            var molds = []
            this.currentScan.map(item => {
                if (item.isMold) {
                    molds.push(item.mold)
                }
            })
            axios.post(this.httpUrl + 'MES/SaveMould', {
                EM_WORKER: this.currentwork,
                EM_MOULD: molds.join(',')
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('备模成功')
                    this.scanbox = false
                    this.getNoPreparationList()
                }else{
                    this.$toast.fail('备模失败')
                }
            }).catch(err => err)
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
    font-size: 0.7rem;
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
.auditcenter span{
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
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

.scanarea{
    padding: 2rem;
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
    margin: 1rem 0;
    padding: 1rem 1.8rem;
    text-align: left;
    border: 1px solid #999;
}
.moldgroup{
    margin-top: 1rem;
    border-bottom: 1px solid rgb(5, 172, 238);
}
.scanarea .van-icon{
    font-size: 1.5rem;
    color: forestgreen;
    position: absolute;
    left: 2.5rem;
}
.calendar{
    position: absolute;
    right: 2rem;
    top: 2rem;
    z-index: 10;
}
</style>