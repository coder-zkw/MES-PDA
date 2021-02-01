<template>
    <div class="maintain">
        <van-nav-bar fixed title="模具保养列表" left-text="返回" left-arrow @click-left="$router.back()" />
        <switch-btn></switch-btn>
        <van-button class="addbtn" round size="mini" type="primary" @click="addNew()">+</van-button>
        <van-list>
            <van-row 
                class="auditWrap"
                v-for="(item, i) in list" 
                :key="i">
                <van-col span="6" class="auditleft">
                    <img class="auditImg" src="../assets/bao.jpg"/>
                    <!-- <van-tag class="mark" mark type="warning">{{item.QP_CUST_CODE}}</van-tag> -->
                </van-col>
                <van-col span="12" class="auditcenter">
                    <span class="audittitle">模具：{{item.EM_U4}}</span>
                    <span>保养人：{{item.EM_U10}}</span>
                </van-col>
                <van-col span="6" class="auditright">
                    <div class="btns">
                        <van-button round type="info" @click="maintainEnd(item)">保养结束</van-button>
                    </div>
                </van-col>
            </van-row>
        </van-list>
        <!-- 审核弹出框 -->
        <van-popup v-model="scanbox" position="top" :style="{ height: '88%' }" closeable>
            <van-form class="scanarea">
                <span>扫码新增</span>
                <van-field
                    class="scaninput"
                    v-model="scanVal"
                    ref="scanInput"
                    @keypress.enter.native.prevent="scaning"
                    placeholder="扫描模具"
                    />
                <div class="infos">
                    <van-field
                        v-model="moldname"
                        required
                        readonly
                        label="模具："
                        placeholder="扫码输入模具"
                    />
                    <van-field
                        readonly
                        clickable
                        name="picker"
                        :value="maintainLevel"
                        label="类型："
                        placeholder="点击选择类型"
                        @click="showPicker = true"
                        />
                        <van-popup v-model="showPicker" position="bottom">
                            <van-picker
                                show-toolbar
                                :columns="columns"
                                @confirm="onConfirm"
                                @cancel="showPicker = false"
                            />
                        </van-popup>
                        <van-field
                        readonly
                        clickable
                        name="picker"
                        :value="maintainType"
                        label="保养类别："
                        placeholder="点击选择类别"
                        @click="showTypePicker = true"
                        />
                        <van-popup v-model="showTypePicker" position="bottom">
                            <van-picker
                                show-toolbar
                                :columns="types"
                                @confirm="selectType"
                                @cancel="showTypePicker = false"
                            />
                        </van-popup>
                    <van-field
                        v-model="site"
                        label="保养现场："
                        placeholder="请输入保养现场"
                    />
                    <van-field
                        v-model="material"
                        label="使用材质："
                        placeholder="请输入使用材质"
                    />  
                    <van-field
                        readonly
                        clickable
                        name="datetimePicker"
                        :value="startDate"
                        label="开始时间："
                        placeholder="点击选择时间"
                        @click="showStartDate = true"
                        />
                    <van-popup v-model="showStartDate" position="bottom">
                        <van-datetime-picker
                            type="datetime"
                            title="选择时间"
                            @confirm="setStartDate"
                            @cancel="showStartDate = false"
                            />
                    </van-popup>
                    <van-field
                        readonly
                        clickable
                        name="datetimePicker"
                        :value="endDate"
                        label="结束时间："
                        placeholder="点击选择时间"
                        @click="showEndDate = true"
                        />
                    <van-popup v-model="showEndDate" position="bottom">
                        <van-datetime-picker
                            type="datetime"
                            title="选择时间"
                            @confirm="setEndDate"
                            @cancel="showEndDate = false"
                            />
                    </van-popup>
                    <van-field
                        v-model="maintainMan"
                        label="保养人："
                        placeholder="请输入保养人"
                    />
                </div>
                <div style="margin: 16px;">
                    <van-button round block :disabled="moldname===''" type="info" native-type="submit" @click="saveMaintains">
                    提交
                    </van-button>
                </div>
                <div style="margin: 16px;">
                    <van-button round block type="warning" @click="resetForm">
                    重置
                    </van-button>
                </div>
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
            // 模具保养列表
            list: [],
            //扫码结果
            scanVal: '',
            // 新增维保养出框
            scanbox: false,
            moldname: '',
            maintainMan: '',
            showPicker: false,
            showTypePicker: false,
            maintainLevel: '',
            maintainType: '',
            site: '',
            material: '',
            columns: ['一级', '二级', '三级'],
            types: ['正常', '异常'],
            date: '',
            startDate: '',
            showStartDate: false,
            endDate: '',
            showEndDate: false
        }
    },
    created() {
        this.getMaintainMoldList()
    },
    methods: {
        // 获取保养列表
        getMaintainMoldList() {
            axios.get(this.httpUrl + 'MES/GetMouldUpkeep')
            .then(res => {
                console.log(res)
                if(res.status === 200 && res.statusText === 'OK'){
                    this.list = res.data
                }else{
                    this.$toast.fail('获取维保养表失败')
                }
            }).catch(err => err)
        },
        // 新增保养
        addNew() {
            this.scanbox = true
            // axios.get(this.httpUrl + 'MES/GetMRepairType')
            // .then(res => {
            //     // console.log(res)
            //     if(res.status === 200 && res.statusText === 'OK'){
            //         this.columns = res.data.map(item => {
            //             return item.F_ITEMNAME
            //         })
            //     }else{
            //         this.$toast.fail('获取保养类型失败')
            //     }
            // }).catch(err => err)
            this.$nextTick(() => {
                this.$refs.scanInput.focus()
            })
        },
        scaning() {
            this.moldname = this.scanVal
            this.scanVal = ''
        },
        onConfirm(value) {
            this.showPicker = false
            this.maintainLevel = value
        },
        selectType(value) {
            this.maintainType = value
            this.showTypePicker = false
        },
        setStartDate(date) {
            this.startDate = getCurrentTime(date)
            this.showStartDate = false
        },
        setEndDate(date) {
            this.endDate = getCurrentTime(date)
            this.showEndDate = false
        },
        saveMaintains() {
            axios.post(this.httpUrl + 'MES/SaveMUpkeep', {
                EM_UMOULD: this.moldname,
                EM_URANK: this.maintainLevel,
                EM_UTYPE: this.types.indexOf(this.maintainType),
                EM_UAREA: this.site,
                EM_UMATERIAL: this.material,
                EM_USTART: this.startDate,
                EM_UEND: this.endDate,
                EM_UPERSON: this.maintainMan
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('新增保养成功')
                    this.resetForm()
                    this.getMaintainMoldList()
                }else{
                    this.$toast.fail('新增保养失败')
                }
            }).catch(err => err)
        },
        resetForm() {
            this.moldname = ''
            this.maintainLevel =  ''
            this.maintainType =  ''
            this.site =  ''
            this.material = ''
            this.startDate = ''
            this.endDate = ''
            this.maintainMan = ''
        },
        maintainEnd(row) {
            axios.post(this.httpUrl + 'MES/SaveMouldUpkeep', {
                EM_REMOULD: row.EM_U1
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('结束保养成功')
                    this.getMaintainMoldList()
                }else{
                    this.$toast.fail('结束保养失败')
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
    margin-top: 1rem;
    padding: 1rem 1.8rem;
    text-align: left;
    border: 1px solid #999;
}
.maintain{
    position: relative;
}
.addbtn{
    font-size: 1.2rem;
    position: absolute;
    top: -2.2rem;
    right: 2rem;
    z-index: 9;
}
</style>