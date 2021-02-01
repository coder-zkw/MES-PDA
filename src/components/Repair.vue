<template>
    <div class="repair">
        <van-nav-bar fixed title="模具维修列表" left-text="返回" left-arrow @click-left="$router.back()" />
        <switch-btn></switch-btn>
        <van-button class="addbtn" round size="mini" type="primary" @click="addNew()">+</van-button>
        <van-list>
            <van-row 
                class="auditWrap"
                v-for="(item, i) in list" 
                :key="i">
                <van-col span="6" class="auditleft">
                    <img class="auditImg" src="../assets/repair.jpg"/>
                    <!-- <van-tag class="mark" mark type="warning">{{item.QP_CUST_CODE}}</van-tag> -->
                </van-col>
                <van-col span="12" class="auditcenter">
                    <span class="audittitle">模具：{{item.EM_ER2}}</span>
                    <span>维修人：{{item.EM_ER8}}</span>
                </van-col>
                <van-col span="6" class="auditright">
                    <div class="btns">
                        <van-button round type="info" @click="repairEnd(item)">维修结束</van-button>
                    </div>
                </van-col>
            </van-row>
        </van-list>
        <!-- 审核弹出框 -->
        <van-popup v-model="scanbox" position="top" :style="{ height: '80%' }" closeable>
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
                        :value="repairType"
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
                        v-model="repairMan"
                        label="维修人："
                        placeholder="请输入维修人"
                    />    
                    <van-field
                        v-model="repairMsg"
                        rows="1"
                        autosize
                        label="说明："
                        type="textarea"
                        placeholder="请输入说明"
                        />
                </div>
                <div style="margin: 16px;">
                    <van-button round block :disabled="moldname===''" type="info" native-type="submit" @click="saveRepairs">
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

export default {
    components: { SwitchBtn },
    data() {
        return {
            // 模具维修列表
            list: [],
            //扫码结果
            scanVal: '',
            // 新增维修弹出框
            scanbox: false,
            moldname: '',
            repairMan: '',
            showPicker: false,
            repairType: '',
            repairMsg: '',
            columns: []
        }
    },
    created() {
        this.getRepairMoldList()
    },
    methods: {
        // 获取维修列表
        getRepairMoldList() {
            axios.get(this.httpUrl + 'MES/GetMouldRepair')
            .then(res => {
                // console.log(res)
                if(res.status === 200 && res.statusText === 'OK'){
                    this.list = res.data
                }else{
                    this.$toast.fail('获取维修列表失败')
                }
            }).catch(err => err)
        },
        // 点击审核按钮，弹出审核结果备注提交框
        addNew() {
            this.scanbox = true
            axios.get(this.httpUrl + 'MES/GetMRepairType')
            .then(res => {
                // console.log(res)
                if(res.status === 200 && res.statusText === 'OK'){
                    this.columns = res.data.map(item => {
                        return item.F_ITEMNAME
                    })
                }else{
                    this.$toast.fail('获取维修类型失败')
                }
            }).catch(err => err)
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
            this.repairType = value
        },
        saveRepairs() {
            axios.post(this.httpUrl + 'MES/SaveMouldRepair', {
                EM_REMOULD: this.moldname,
                EM_RETYPE: this.repairType.substring(0, 1),
                EM_REEXPLANATION: this.repairMsg,
                EM_REPERSON: this.repairMan
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('新增维修成功')
                    this.resetForm()
                }else{
                    this.$toast.fail('新增维修失败')
                }
            }).catch(err => err)
        },
        resetForm() {
            this.moldname = ''
            this.repairMan =  ''
            this.repairType =  ''
            this.repairMsg =  ''
        },
        repairEnd(row) {
            axios.post(this.httpUrl + 'MES/SaveMouldRepairEN', {
                EM_REMOULD: row.EM_ER2
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('结束维修成功')
                    this.getRepairMoldList()
                }else{
                    this.$toast.fail('结束维修失败')
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
.repair{
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