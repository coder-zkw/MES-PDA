<template>
    <div class="examine">
        <van-nav-bar title="首末件品检" fixed left-text="返回" left-arrow @click-left="$router.back()"/>
        <switch-btn></switch-btn>
        <van-form>
            <van-grid :column-num="2">
                <van-grid-item>
                    <van-field
                    v-model="form.user"
                    label="操作人员："
                    disabled 
                />
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="form.datePlan"
                    label="计划日期："
                    disabled  
                />
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="form.machine"
                    label="机台："
                    disabled 
                />
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="form.orderVal"
                    label="制令单号："
                    disabled  
                />
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="form.productNum"
                    label="成品编号："
                    disabled 
                />
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="form.productName"
                    label="成品名称："
                    disabled  
                />
                </van-grid-item>
            </van-grid>
            <van-grid :column-num="1">
                <van-grid-item>
                    <van-field
                    v-model="form.productType"
                    label="成品规格："
                    disabled  
                />
                </van-grid-item>
            </van-grid>
            <van-grid :column-num="2">
                <van-grid-item>
                    <van-field
                    v-model="form.client"
                    label="客户编号："
                    disabled 
                />
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="form.dateDraw"
                    label="图纸日期："
                    disabled  
                />
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="form.versionDraw"
                    label="图纸版次："
                    disabled 
                />
                </van-grid-item>
                <van-grid-item>
                    <van-button type="info" size="mini">图纸</van-button>
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="form.processNum"
                    label="工序序号："
                    readonly
                    @click="showProcess = true" 
                />
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="form.processName"
                    label="工序名称："
                    disabled  
                />
                </van-grid-item>
            </van-grid>
            <van-grid :column-num="1">
                <van-grid-item>
                    <van-field
                    v-model="form.processDesc"
                    label="工序描述："
                    disabled  
                />
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="form.identifier"
                    label="实物编号："  
                    :rules="[{ required: true, message: '请填写实物编号' }]"
                />
                </van-grid-item>
                <van-grid-item>
                    <van-field
                    v-model="remark"
                    label="备注："
                    type="textarea"
                    rows="1"
                    autosize
                />
                </van-grid-item>
            </van-grid>
        </van-form>
        <!-- 工序序号选择框 -->
        <van-popup v-model="showProcess" position="bottom">
            <van-picker
                show-toolbar
                :columns="form.processNums"
                @confirm="processNumConfirm"
                @cancel="showProcess = false"
            />
        </van-popup>
        <!-- 分割线 -->
        <van-divider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 1rem' }">品检项</van-divider>
        <!-- 验证项列表 -->
        <van-list @load="onLoad">
            <van-row 
                class="examWrap"
                v-for="(item, i) in examines" 
                :key="i">
                <van-col span="6" class="examleft">
                    <img class="examImg" src="../assets/pinjian.jpg"/>
                    <van-tag class="mark" :type="item.STATUS != '' ? 'success':'warning'">{{i+1}}</van-tag>
                </van-col>
                <van-col span="18" class="examright">
                    <van-cell title="品检类别：" :value="item.CATE_NAME || ''" />
                    <van-cell title="品检项目：" :value="item.QC_ITEM || ''" />
                    <van-cell title="规格：" :value="item.WL_SPEC || ''" />
                    <van-cell title="品检备注：" :value="item.QC_REMARK || ''" />
                    <van-cell title="标准值：" :value="item.QC_VALUE || ''" />
                    <div class="tags">
                    <van-tag round>{{item.TOOL_NAME}}</van-tag>
                    <van-tag round>{{item.INPUT_MODE}}</van-tag>
                </div>
                <van-field class="writeVal" v-if="item.CHECK_MODE === 'Y/N'" name="radio" label="检验值：">
                    <template #input>
                        <van-radio-group 
                            v-model="item.INPUTVAL" 
                            @change="getStatus(item, i)"
                            direction="horizontal">
                            <van-radio name="Y">Y</van-radio>
                            <van-radio name="N">N</van-radio>
                        </van-radio-group>
                    </template>
                </van-field>
                <van-field class="writeVal" v-else
                    v-model="item.INPUTVAL"
                    label="检验值："
                    placeholder="请输入检验值"
                    @input="getStatus(item, i)"
                />
                <van-tag class="status" 
                    v-if="item.STATUS != ''"
                    size="large"
                    :type="item.STATUS === 'OK' ? 'success' : 'danger'">
                    {{item.STATUS}}    
                </van-tag>
                </van-col>
            </van-row>
        </van-list>
        <van-field class="examresult" name="radio" label="品检结果：">
            <template #input>
                <van-radio-group disabled v-model="resExamine" direction="horizontal">
                    <van-radio name="Y">通过</van-radio>
                    <van-radio name="N">不通过</van-radio>
                </van-radio-group>
            </template>
            <template #button>
                <van-button size="normal" type="primary" :disabled="isAllCheck" @click="resultSubmit">提交</van-button>
            </template>
        </van-field>
    </div>
</template>
<script>
import SwitchBtn from './Switch'
import axios from 'axios'

export default {
    components: { SwitchBtn },
    data() {
        return {
            examines: [],
            form: {
                // user: '李丽娟',
                // datePlan: '2020/6/10',
                // machine: 'machine02',
                // orderVal: 'MO90012345',
                user: localStorage.getItem('userName'),
                datePlan: this.$route.query.date,
                machine: localStorage.getItem('machine'),
                orderVal: this.$route.query.work,
                productNum: '',
                productName: '',
                productType: '',
                client: '',
                dateDraw: '',
                versionDraw: '',
                // 工序序号下拉列表数据
                processData: [],
                processNums: [],
                // 工序序号
                processNum: '',
                processName: '',
                processDesc: '',
                // 实物编号
                identifier: '',
            },
            // 品检表单备注信息
            remark: '',
            // 工序号选择框显示隐藏
            showProcess: false,
            // 品检最终是否通过结果
            resExamine: 'N',
            timer: null,
            isAllCheck: true
        }
    },
    created() {
        this.getProductInfo()
    },
    methods: {
        getProductInfo(){
            // 用工单号查询成品信息和成品工序
            axios.get('http://localhost:50814/MES/GetProductend?wo='+this.form.orderVal)
            // axios.get(this.httpUrl + 'MES/GetProductend?wo='+this.form.orderVal)
            .then(res => {
                console.log(res)
                if(res.status === 200) {
                    const {ITEM_CODE, ITEM_NAME, ITEM_SPEC, CUST_CODE, CAD_DATE, CAD_VER} = res.data.V_MES_PRODUCT[0]
                    const processArr = res.data.v_mes_gongxu
                    this.form.productNum = ITEM_CODE === null ? '' : ITEM_CODE
                    this.form.productName = ITEM_NAME === null ? '' : ITEM_NAME
                    this.form.productType = ITEM_SPEC === null ? '' : ITEM_SPEC
                    this.form.client = CUST_CODE === null ? '' : CUST_CODE
                    CAD_DATE === null ? '' : CAD_DATE
                    this.form.dateDraw = CAD_DATE.replace(/-/g, '/')
                    this.form.versionDraw = CAD_VER === null ? '' : CAD_VER
                    // 工序序号列表渲染
                    processArr.map(item => {
                        this.form.processNums.push(item.WS_IDX)
                    })
                    this.form.processData = processArr
                    // 默认工序序号、工序名称、工序描述选中第一道工序
                    this.form.processNum = processArr[0].WS_IDX
                    // this.form.processName = processArr[0].GX_NAME
                    // this.form.processDesc = processArr[0].WS_DESC
                    // 第一次选中制令号时，默认获取第一工序号的品检信息渲染
                    this.getProcessInfo(this.form.processNum)
                }else{
                    this.$toast.fail('获取成品信息失败')
                }
            }).catch(err => err)
        },
        processNumConfirm(value) {
            this.form.processNum = value
            this.showProcess = false
            // 根据工序序号查询对应的工序名称、工序描述展示出来
            this.getProcessInfo(value)
        },
        // processChange(newVal) {
        //     // 根据工序序号查询对应的工序名称、工序描述展示出来
        //     // console.log(newVal)
        //     this.getProcessInfo(newVal)
        // },
        getProcessInfo(num) {
            // 制令选择新值后重新获取成品信息和成品工序
            this.form.processData.find(item => {
                if(item.WS_IDX === num) {
                    this.form.processName = item.GX_NAME
                    this.form.processDesc = item.WS_DESC
                    return true
                }
            })
            // 根据成品编号和工序号查询出需要品检项目的列表
            // axios.get('http://mengxuegu.com:7300/mock/5ea245bd2a2f716419f892c5/GetProductendGx?Productend=V0U0600770A&gx=01')
            axios.get(this.httpUrl+ 'MES/GetProductendGx?Productend='+ this.form.productNum + '&gx='+num)
            .then(res => {
                // console.log(res)
                if(res.status === 200) {
                    // 提取品检数据
                    let examineArr = res.data
                    // 每组数据加上输入框值和状态属性
                    examineArr.map(item => {
                        // console.log(item)
                        item.INPUTVAL = '',
                        item.STATUS = ''
                    })
                    // 再把新数据赋值给渲染表格的数据
                    this.examines = examineArr
                }else{
                    this.$message.error('获取品检列表失败！')
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
        getStatus(item, index) {
            // 节流
            if(this.timer) {
                clearTimeout(this.timer)
            }
            this.timer = setTimeout(() => {
                // 校验检验值是否通过
                const {CHECK_MODE, QC_VALUE, INPUTVAL} = item
                let value = ''
                if(INPUTVAL != ''){
                    switch(CHECK_MODE) {
                        case 'Y/N':
                            if(INPUTVAL === 'Y'){
                                value = 'OK'
                            }else if(INPUTVAL === 'N'){
                                value = 'NG'
                            }
                            break
                        case '等于':
                            value = (INPUTVAL-0) === (QC_VALUE-0) ? 'OK' : 'NG'
                            break
                        case '小于':
                            value = (INPUTVAL-0) < (QC_VALUE-0) ? 'OK' : 'NG'
                            break
                        case '小于等于':
                            value = (INPUTVAL-0) <= (QC_VALUE-0) ? 'OK' : 'NG'
                            break
                        case '大于':
                            value = (INPUTVAL-0) > (QC_VALUE-0) ? 'OK' : 'NG'
                            break
                        case '大于等于':
                            value = (INPUTVAL-0) >= (QC_VALUE-0) ? 'OK' : 'NG'
                            break
                        case '介于':
                            {
                            const nums = QC_VALUE.split('-')
                            value = (INPUTVAL-0 > nums[0]-0 && INPUTVAL-0 < nums[1]-0) ? 'OK' : 'NG'
                            }
                            break
                        case '介于等于': 
                            {
                                const nums = QC_VALUE.split('-')
                                value = (INPUTVAL-0 >= nums[0]-0 && INPUTVAL-0 <= nums[1]-0) ? 'OK' : 'NG'
                            }
                            break
                        case '不判定':
                            value = 'OK'
                            break
                    }
                }
                this.examines[index].STATUS = value
                this.isAllExamine()
            }, 800)
        },
        isAllExamine() {
            // console.log(this.tableData)
            // 工序值变化后，重新获取数据并渲染
            const allCheckflag = this.examines.findIndex(item => item.STATUS === '')
            if(allCheckflag === -1){
                this.isAllCheck = false
                // 当全部检验后判断最终结果是通过与否
                const isOK = this.examines.findIndex(item => item.STATUS != 'OK')
                this.resExamine = (isOK === -1) ? 'Y': 'N'
            }else{
                this.isAllCheck = true
            }
        },
        resultSubmit() {
            if(this.form.identifier === '') {
                this.$toast.fail('实物编号未填')
                return
            }
            let formData = {}
            formData.QP_USERID = localStorage.getItem('userName')
            formData.QP_WORKER = this.form.orderVal
            formData.QP_PLAN_DATE = this.form.datePlan
            formData.QP_MACHINE = this.form.machine
            formData.ITEM_CODE = this.form.productNum
            formData.ITEM_NAME = this.form.productName
            formData.ITEM_SPEC = this.form.productType
            formData.CUST_CODE = this.form.client
            formData.CAD_DATE = this.form.dateDraw
            formData.CAD_VER = this.form.versionDraw
            formData.WS_IDX = this.form.processNum
            formData.GX_NAME = this.form.processName
            formData.WS_DESC = this.form.processDesc
            formData.identifier = this.form.identifier
            formData.remark = this.remark
            formData.resExamine = this.resExamine
            formData.WS_DATA = this.examines
            // console.log(formData)
            
            axios.post(this.httpUrl + 'MES/QCProductend', formData)
            .then(res => {
                if(res.status === 200){
                    this.$toast.success('品检结果保存成功')
                    // 返回工单列表
                    this.$router.replace('/worklist')
                }else {
                    this.$toast.fail('品检结果保存失败！请重试')
                }
            }).catch(err => err)  
        }
    }
}
</script>
<style scoped>
.examine{
    padding-bottom: 3rem;
}
.van-cell{
    padding: 0;
    font-size: 0.5rem;
}
/deep/ .van-field__label{
    width: 4rem;
    text-align: right;
}
/deep/ .van-grid-item__content{
    padding: 12px 6px;
}
/* /deep/ .van-field__control{
    padding-left: 3px;
    border: 0.5px solid #eee;
} */
[class*=van-hairline]::after{
    border: 0;
}

.van-list{
    padding: 0 0.5rem;
}
.examWrap{
    padding: 0.8rem 0;
    font-size: 0.5rem;
    position: relative;
    border-bottom: 0.5px solid #eee;
}
.examImg{
    width: 4rem;
}
.examleft{
    position: relative;
}
.mark{
    position: absolute;
    top: 0.25rem;
    left: 0.5rem;
}
.examright .van-cell__value{
    text-align: left;
}
.examright .van-cell__title{
    flex: none;
    text-indent: 1rem;
}
.tags{
    display: flex;
    flex-direction: column;
    justify-items: baseline;
    position: absolute;
    left: 0.5rem;
    top: 5rem;
}
.tags .van-tag{
    margin-bottom: 0.3rem;
    font-size: 0.3rem;
}

.writeVal{
    padding: 0.5rem 0;
    font-size: 1rem;
}
.status{
    position: absolute;
    right: 1rem;
    bottom: 1.3rem;
}
.examresult{
    width: 100%;
    height: 3rem;
    line-height: 3.2rem;
    justify-content: center; 
    background: gray;
    color: #fff;
    position: fixed;
    left: 0;
    bottom: 0;
}
/deep/ .examresult .van-radio__label{
    color: #fff;
}
/deep/ .examresult .van-cell__value{
    flex:none;
}
/deep/ .van-radio__icon--disabled.van-radio__icon--checked .van-icon{
    background-color: #1989fa;
    border-color: #1989fa;
}
</style>