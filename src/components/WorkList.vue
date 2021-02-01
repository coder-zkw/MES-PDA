<template>
    <div>
        <van-nav-bar fixed title="调机工单" left-text="返回" left-arrow @click-left="$router.back()">
            <template #right>
                <van-icon class="margin-r" name="search" size="18" @click="clickSearch"/>
            </template>
        </van-nav-bar>
        <switch-btn></switch-btn>
        <!-- 搜索选择设置 -->
        <van-popup v-model="searchShow" position="top">
            <van-search
                class="searchs"
                v-model="matchVal"
                ref="searchInput"
                shape="round"
                background="#4fc08d"
                placeholder="匹配工单号"
                />
            <van-field
                readonly
                clickable
                name="calendar"
                :value="dateInterval"
                label="日期区间"
                placeholder="点击选择日期"
                @click="showCalendar = true"
                />
            <van-calendar 
                v-model="showCalendar"
                :min-date="minDate"
                :max-date="maxDate" 
                type="range"
                :default-date="defaultDates"
                :show-confirm="false"
                @confirm="onConfirm" />
            <van-button class="searchWorkBtn" type="primary" @click="searchWork">确定</van-button>
        </van-popup>
        <!-- 工单列表 -->
        <van-list
            v-model="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad">
            <van-row 
                class="workWrap"
                v-for="(item, i) in list" 
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
                        <van-button round type="primary" :disabled="item.isTuneStart" @click="toTuning(item, i)">开始调机</van-button>
                        <van-button round type="info" :disabled="item.isMaterial" @click="verification">条码验证</van-button>
                        <van-button round type="danger" :disabled="item.isTuneEnd" @click="tuningEnd">结束调机</van-button>
                    </div>
                </van-col>
            </van-row>
        </van-list>
        <!-- 调机原因选择框 -->
        <van-action-sheet v-model="reasonShow">
            <van-picker 
                show-toolbar title="调机原因" 
                :columns="reasons" 
                @confirm="reasonConfirm"
                @cancel="reasonShow = false"/>
        </van-action-sheet>
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
            machine: localStorage.getItem('machine'),
            user: localStorage.getItem('userName'),
            list: [],
            loading: false,
            finished: false,
            // 搜索工单显示隐藏切换
            searchShow: false,
            minDate: null,
            maxDate: null,
            // 匹配值
            matchVal: '',
            // 起始日期
            dateInterval: '',
            // 默认日期
            defaultDates: [],
            // 日历显示隐藏切换
            showCalendar: false,
            // 点击调机的工单数据
            currentRow: {},
            currentIndex: null,
            // 调机原因框显示隐藏切换
            reasonShow: false,
            // 调机原因数据
            reasons: [{
                    text: 'A类',
                    children: [
                        {text: 'sadf1'},{text: 'gfdi1'},{text: 'dkf1'}
                    ]
                },
                {
                    text: 'B类',
                    children: [
                        {text: 'sa1df2'},{text: 'g3fdi2'},{text: 'dk23f2'},{text: '23f2'},{text: 'dkf2'}
                    ]
                }],
            reasonVal: [],
            // 选中调机原因的ID
            activeId: 1,
            // 选中调机原因的index类
            activeIndex: 0,
        }
    },
    created() {
        // 获取默认日期
        this.getDefaultDate()
        this.getWorkList()
    },
    methods: {
        getWorkList() {
            // 获取工单标题
            // axios.get(this.httpUrl + 'MES/GetTitle?page=APS_WORKER')
            // .then((res) => {
            //     this.columnsAll = res.data
            // })
            let startDate = ''
            let endDate = ''
            if(this.dateInterval != '') {
                startDate = this.dateInterval.split('-')[0].trim()
                endDate = this.dateInterval.split('-')[1].trim()
            }else{
                startDate = getCurrentTime(this.defaultDates[0]).split(' ')[0]
                endDate = getCurrentTime(this.defaultDates[1]).split(' ')[0]
            }
            // console.log(startDate, endDate)
            // 获取工单数据
            // axios.get('http://mengxuegu.com:7300/mock/5ea245bd2a2f716419f892c5/GetApsWorker?machine='+this.machine +'&time='+startDate+'&EndTime='+endDate)
            axios.get(this.httpUrl + 'MES/GetApsWorkerQ?machine=' + this.machine + '&time=' + startDate + '&EndTime=' +endDate)
            .then((res) => {
                // console.log(res)
                if(res.status === 200) {
                    let datas = res.data
                    datas.map(item => {
                        item.isTuneStart = false
                        item.isMaterial = true
                        item.isTuneEnd = true
                    })
                    if (this.matchVal != '') {
                        this.list = datas.filter(item => (item.AW_APS_WORKER.indexOf(this.matchVal) != -1))
                    }else{
                        this.list = datas
                    }
                    if(this.list.length === 0) {
                        this.$toast('获取工单数为0')
                    }
                }else{
                    this.$toast.fail('获取工单失败')
                }
            }).catch(err => err)
        },
        getDefaultDate() {
            const today = new Date();
            this.minDate = new Date(today.getTime()-90*24*60*60*1000)
            this.maxDate = new Date(today.getTime()+5*24*60*60*1000)
            this.defaultDates = [new Date(today.getTime()-2*24*60*60*1000), today]
            // console.log(this.defaultDates)
        },
        clickSearch() {
            this.searchShow = true
            this.$nextTick(() => {
                // 找到search组件下的input
                const input = this.$refs.searchInput.children[0].children[0].children[1].children[0].children[0]
                input.focus()
            })
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
        searchWork() {
            // 重新获取工单列表
            this.getWorkList()
            this.searchShow = false
        },
        formatDate(date) {
            return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
        },
        onConfirm(date) {
            const [start, end] = date
            this.showCalendar = false
            this.dateInterval = `${this.formatDate(start)} - ${this.formatDate(end)}`
        },
        toDetails(row) {
            // 点击详情按钮，把本工单数据保存到store
            this.$store.dispatch('handleChangeOrder', row)
            this.$router.push('/workdetails')
        },
        // 获取调机原因数据
        getReasons() {
            this.reasonShow = true
            // 先清空上次的数据
            this.reasons = []
            axios.get(this.httpUrl + 'MES/GetTuneNg')
            .then(res => {
                // console.log(res)
                if(res.data.code === 200) {
                    const datas = res.data.data
                    const obj = {}
                    // 把获取的数据进行归类处理成一个对象
                    datas.map(item => {
                        if(!obj[item.F_ITEMCODE]) {
                        obj[item.F_ITEMCODE] = [item.F_ITEMNAME]
                        }else{
                        obj[item.F_ITEMCODE].push(item.F_ITEMNAME)
                        }
                    })
                    // 把归类后的对象处理成渲染二级列表所需的对象格式
                    for(let key in obj) {
                        let o = {}
                        o.text = key+'类'
                        o.children = []
                        obj[key].map(item => {
                            o.children.push({
                                text: item
                            })
                        })
                        this.reasons.push(o)
                    }
                // console.log(this.reasons)
                }else{
                    this.$toast.fail('获取调机原因列表失败！')
                }
            }).catch(err => err)
        },
        reasonConfirm(value) {
            this.reasonVal = value
            // 选择调机原因后，确定，写入开始调机时间
            this.setStartTime()
            this.reasonShow = false
        },
        // 点击开始调机按钮，
        toTuning(row, i) {
            // console.log(row)
            this.currentRow = row
            this.currentIndex = i
            // 先判断是否有机台在调机中
            this.setStartTime(0)
        },
        setStartTime(time) {
            // if(time === 0) this.getReasons()
            const MT_WORKER = this.currentRow.AW_APS_WORKER
            const MT_PRODUCT_HALF = this.currentRow.AW_PRODUCT_HALF
            const MT_MACHINE = this.machine
            const MT_DOUSER = this.user
            const MT_STARTTIME = (time === 0 ? '' : getCurrentTime(new Date()))
            // 调机原因
            const F_ITEMCODE = this.reasonVal[0]
            const F_ITEMNAME = this.reasonVal[1]
            // 开始调机，开始时间传后台
            axios.post(this.httpUrl + 'MES/Tune', {MT_WORKER,MT_PRODUCT_HALF,MT_MACHINE,MT_DOUSER,MT_STARTTIME,F_ITEMCODE,F_ITEMNAME})
            .then((res) => {
                // console.log(res)
                if(res.data.code === 200) {
                    // time为0时，才验证是否在调机中
                    if(time === 0) {
                        // 正在调机的设备
                        const machines = res.data.data
                        // 返回数组为空，说明没有正在调机的工单，则调机原因框出现开始调机，开始调机按钮开
                        if(machines.length === 0) {
                            this.getReasons()
                        }else {
                            const work = machines[0].MT_WORKER
                            const machine = machines[0].MT_MACHINE
                            const product = machines[0].MT_PRODUCT_HALF
                            // 提示有工单未结束
                            this.isTuneOver(work, machine, product)
                            this.list[this.currentIndex].isMaterial = true
                            this.list[this.currentIndex].isTuneEnd = true
                        }
                    }else{
                        // 写入制令信息
                        this.verification()
                        // time不为0时，点击开始调机按钮后，开始调机按钮关，条码验证按钮开
                        this.list[this.currentIndex].isTuneStart = true
                        this.list[this.currentIndex].isMaterial = false
                        this.list[this.currentIndex].isTuneEnd = false
                    }
                    // code不为200时
                }else{
                    if(time === 0) {
                        this.$toast.fail('验证此工单是否在调机状态失败，请重试！')
                    }else{
                        this.$toast.fail('开始时间写入失败，请重试！')
                    }
                }
            }).catch(err => err)
        },
        // 确定是否立即结束未结束的调机工单
        isTuneOver(work, machine, product) {
            this.$dialog.confirm({
            message: machine+'有未结束调机的工单：'+work+',是否结束？',
            })
            .then(() => {
                // 直接结束此工单
                this.tuningEnd(null, work, machine, product)
            })
            .catch(() => {
                // on cancel
            })
        },
        tuningEnd(e, work, machine, product) {
            const MT_WORKER = work || this.currentRow.AW_APS_WORKER
            const MT_PRODUCT_HALF = product || this.currentRow.AW_PRODUCT_HALF
            const MT_MACHINE = machine || this.machine
            const MT_DOUSER = this.user
            const MT_ENDTIME = getCurrentTime(new Date())
            const index = this.list.findIndex(item => item.AW_APS_WORKER === MT_WORKER)
            // 结束调机，结束时间传后台
            axios.post(this.httpUrl + 'MES/Tune', {MT_WORKER,MT_PRODUCT_HALF,MT_MACHINE,MT_DOUSER,MT_ENDTIME})
            .then((res) => {
                // console.log(res)
                if(res.data.code === 200) {
                    this.$toast.success('调机结束时间已保存成功！')
                    // 结束调机成功后，条码验证按钮、结束调机按钮禁用开
                    this.list[index].isTuneStart = false
                    this.list[index].isMaterial = true
                    this.list[index].isTuneEnd = true
                }else if(res.data.code === 401) {
                    this.$toast.fail(res.data.value)
                }else{
                    this.$toast.fail('结束时间写入失败，请重试！')
                }
            }).catch(err => err)
            // 结束调机，发送请求通知上位机切换操作员权限
            let formdata = new FormData()
            formdata.append('machineName', this.userName)
            axios.post(this.writeUrl+'cmd/changeUser', formdata)
            .then(res => {
                if(res.data.code === 200) {
                this.$toast.success('上位机切换操作员权限成功！')
                }else{
                this.$toast.fail('上位机切换操作权限失败！请手动切换')
                }
            }).catch(() => {
                this.$toast.fail('上位机自动切换操作权限失败！请手动切换')
            })
        },
        // 条码验证
        verification() {
            this.$dialog.confirm({
                message: '点击确定后，将会向机台写入制令信息，是否继续？',
            }).then(() => {
                // 工单号传参
                const work_Id = this.currentRow.AW_PRODUCT_HALF
                const worker = this.currentRow.AW_APS_WORKER
                // 林全机台，则写入制令信息，否则不用写
                if(this.company === '0'){
                    // 校验是否通过允许跳转
                    let formdata = new FormData()  
                    formdata.append('machineName', this.machine)
                    formdata.append('worker', worker)
                    axios.post(this.writeUrl +'cmd/writeMakeInfo', formdata)
                    .then((res) => {
                        // console.log(res)
                        // 写入失败，提示手动输入
                        if(res.data.code != 200) {
                        this.$toast.fail('未找到'+work_Id+'制令信息！请在机台手动输入。')
                        }
                    }).catch(() => this.$toast.fail('制令信息写入失败！请在机台手动输入。'))
                }
                // 无论是否写制令信息，都跳转物料验证页面
                this.toMaterials()
            }).catch(() => {
                this.$toast('已取消验证')    
            })
        },
        toMaterials() {
            const {AW_CLASS, AW_APS_WORKER, AW_PRODUCT_HALF, SW_CHECK} = this.currentRow
            // SELF类型有是否验证字段SW_CHECK，APS没有，需判断返回是否有内容，有则需验证
            if(AW_CLASS === 'APS') {
                axios.get(this.httpUrl + 'MES/GetProductHalf?wo='+ AW_PRODUCT_HALF)
                .then((res) => {
                    // console.log(res)
                    let isCheck = '0';
                    if(res.data.length > 0){
                        isCheck = '1'
                    }
                    this.$router.push('/tuning?isCheck='+isCheck+'&work='+AW_APS_WORKER+'&product='+AW_PRODUCT_HALF)
                }).catch(err => err)
            }else{
                // 跳至物料验证页面
                this.$router.push('/tuning?isCheck='+SW_CHECK+'&work='+AW_APS_WORKER+'&product='+AW_PRODUCT_HALF)
            }
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
.margin-r{
    margin-right: 1rem;
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
