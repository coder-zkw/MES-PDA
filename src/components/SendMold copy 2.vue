<template>
    <div class="audit">
        <van-nav-bar fixed title="已备模具列表" left-text="返回" left-arrow @click-left="$router.back()" />
        <switch-btn></switch-btn>
        <van-list>
            <van-row 
                class="auditWrap"
                v-for="(item, i) in list" 
                :key="i">
                <van-col span="5" class="auditleft">
                    <img class="auditImg" src="../assets/bei.jpg"/>
                </van-col>
                <van-col span="14" class="auditcenter">
                    <span class="audittitle">{{item.workId}}</span>
                    <span>模具：{{item.mold}}</span>
                    <span>储位：{{item.storage}}</span>
                </van-col>
                <van-col span="5" class="auditright">
                    <div class="btns">
                        <van-button round type="info" @click="startPreparing(item)">开始送模</van-button>
                    </div>
                </van-col>
            </van-row>
        </van-list>
        <!-- 审核弹出框 -->
        <van-popup v-model="scanbox" position="top" :style="{ height: '100%' }" closeable>
            <div class="infos">
                <h3>工单：{{currentwork}}</h3>
                <div class="moldgroup" v-for="(item, i) in currentScan" :key="i">
                    <div>模具：{{item.MOD_SN}}</div>
                    <!-- <div>库位：{{item.location}}</div> -->
                    <div>区域：{{item.AREA}}</div>
                    <div>储位：{{item.PLACE}}</div>
                    <div class="btns">
                        <van-button round type="info" v-show="item.ST === 0" @click="toScaning(item)">送模</van-button>
                        <van-button round type="primary" v-show="item.ST === 1" @click="toScaning(item)">解绑</van-button>
                    </div>
                </div>
            </div>
        </van-popup>
        <!-- 扫码框 -->
        <van-popup v-model="show" :style="{ width: '100%', height: '50%' }">
            <van-form class="scanarea">
                <span>扫码送模</span>
                <van-field
                    class="scaninput"
                    v-model="scanVal"
                    ref="scanInput"
                    @keypress.enter.native.prevent="scaning"
                    placeholder="扫描储位号、模具号"
                    />
                <div class="infos">
                    <div class="moldgroup">
                        <div>模具：{{sendMold.MOD_SN}} <i class="van-icon van-icon-success" v-show="sendMold.isMold"></i></div>
                        <!-- <div>库位：{{item.location}}</div> -->
                        <div>区域：{{sendMold.AREA}}</div>
                        <div>储位：{{sendMold.PLACE}} <i class="van-icon van-icon-success" v-show="sendMold.isStorage"></i></div>
                    </div>
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
            // 未备模具列表
            list: [
                // {workId: '123456', mold: 'abc123,a2', storage: 'A-1',area: '23',location: '35k'},
                // {workId: '123457', mold: 'abc124', storage: 'A-2',area: 'B',location: '4rg'}
            ],
            //扫码结果
            scanVal: '',
            // 开始扫描弹出框
            scanbox: false,
            show: false,
            currentwork: '',
            currentScan: [],
            sendMold: {}
        }
    },
    created() {
        this.getNoPreparationList()
    },
    methods: {
        // 获取未备模列表
        getNoPreparationList() {
            // axios.get(this.httpUrl + 'MES/GetAWorkerMould')
            axios.get('http://localhost:50814/MES/GetAWorkerMould')
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
                    this.$toast.fail('获取已备模列表信息失败')
                }
            }).catch(err => err)
        },
        startPreparing(row) {
            this.currentwork = row.workId
            this.getAsMoulds()

            this.scanbox = true
        },
        getAsMoulds() {
            // 获取送模和解绑的模具
            // axios.get(this.httpUrl + 'MES/GetASMould?wo='+this.currentwork).then(res => {
            axios.get('http://localhost:50814/MES/GetASMould?wo='+this.currentwork).then(res => {
                // console.log(res)
                if(res.status === 200){
                    this.currentScan = res.data
                }else{
                    this.$toast.fail('获取需解绑模具失败')
                }
            }).catch(err => err)
        },
        toScaning(row) {
            this.show = true
            this.sendMold = row
            this.$nextTick(() => {
                this.$refs.scanInput.focus()
            })
        },
        scaning() {
            if (this.sendMold.MOD_SN === this.scanVal) {
                this.sendMold.isMold = true
            } else if (this.sendMold.PLACE == this.scanVal) {
                this.sendMold.isStorage = true
            } else {
                this.$toast.fail('请扫描正确的模具或储位')
            }

            if(this.sendMold.isMold && this.sendMold.isStorage) {
                if (this.sendMold.ST === 0) {
                    this.saveMold()
                }else if(this.sendMold.ST == 1) {
                    this.unBind()
                }
            }
           
            this.scanVal = ''
        },
        saveMold() {
            axios.post(this.httpUrl + 'MES/SaveMouldDeliver', {
                EM_WORKER: this.currentwork,
                EM_MOULD: this.sendMold.MOD_SN
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('送模成功')
                    this.resetScan()
                    this.show = false
                    this.getAsMoulds()
                }else{
                    this.$toast.fail('送模失败')
                }
            }).catch(err => err)
        },
        unBind() {
            axios.post(this.httpUrl + 'MES/SaveRelieveMould', {
                EM_WORKER: this.currentwork,
                EM_MOULD: this.sendMold.MOD_SN
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('解绑成功')
                    this.resetScan()
                    this.show = false
                    this.getAsMoulds()
                }else{
                    this.$toast.fail('解绑失败')
                }
            }).catch(err => err)
        },
        resetScan() {
            this.sendMold = {}
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
    /* border: 1px solid #999; */
}
.moldgroup{
    position: relative;
    margin-top: 1rem;
    border-bottom: 1px solid rgb(5, 172, 238);
}
.van-icon{
    font-size: 1.5rem;
    color: forestgreen;
    position: absolute;
    left: -1.5rem;
}
</style>