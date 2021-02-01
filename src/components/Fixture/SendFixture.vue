<template>
    <div class="audit">
        <van-nav-bar fixed title="扫码送治具" left-text="返回" left-arrow @click-left="$router.back()" />
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
        <div class="infoarea">
            <div class="infos" v-if="list.length !== 0">
                <div class="moldgroup" v-for="(item, i) in list" :key="i">
                    <!-- <h5>工单：{{item.workId}}</h5> -->
                    <div>治具：{{item.mold}} <i class="van-icon van-icon-success" v-show="item.isMold"></i></div>
                    <div>治具状态：{{statusText[item.status]}}</div>
                    <!-- <div>区域：{{item.area}}</div> -->
                    <div>产线储位：{{item.storage}} <i class="van-icon van-icon-success" v-show="item.isStorage"></i></div>
                </div>
            </div>
        </div>
        <div class="btnwrap" v-show="list.length > 0">
            <van-button type="info" @click="saveSubmit">确认送治具</van-button>
        </div>
    </div>
</template>
<script>
import SwitchBtn from '../Switch'
import axios from 'axios'

export default {
    components: { SwitchBtn },
    data() {
        return {
            // 送治具列表
            list: [],
            //扫码结果
            scanVal: '',
            statusText: {10: '在库', 11:'待送', 12:'已备', 14:'已退', 15:'使用', 20:'保养', 25:'维修', 30:'外发', 35:'报废', 40:'封存，三年未使用', 45:'拆除'},
            moldTypes: [],
            isOk: false
        }
    },
    created() {
        this.onFocus()
    },
    methods: {
        scaning() {
            // 扫描后判断结果
            var currenFixture = this.scanVal
            var index = this.list.findIndex(item => item.mold === currenFixture)
            this.scanVal = ''
            if (index != -1) {
                return this.$toast.fail('该治具已存在待送列表')
            }
            axios.post(this.httpUrl + 'MES/getFixturePlace', {
            // axios.post('http://localhost:50814/MES/getFixturePlace', {
                EM_FIXTURE: currenFixture
            }).then(res => {
                console.log(res)
                var result = res.data
                if(result.code === 200){
                    if (result.data.length === 0) {
                        return this.$toast.fail('该治具不存在')
                    }
                    var infos = result.data[0]
                    if (infos.STATUS !== 11) {
                        this.$dialog.confirm({
                        title: '标题',
                        message: '该治具不在待送列表，是否添加至待送列表',
                        })
                        .then(() => {
                            this.list.push({
                                mold: currenFixture,
                                storage: infos.PLACE,
                                status: infos.STATUS
                            })
                            this.onFocus()
                        })
                        .catch(() => {
                            this.onFocus()
                        })
                    }else {
                        this.list.push({
                            mold: currenFixture,
                            storage: infos.PLACE,
                            status: infos.STATUS
                        })
                    }
                }else{
                    this.$toast.fail('查询治具产线储位失败')
                }
            }).catch(err => err)
        },
        saveSubmit() {
            // 保存数据
            var molds = []
            this.list.map(item => {
                molds.push(item.mold)
            })
         
            axios.post(this.httpUrl + 'MES/SaveFixtureDeliver', {
            // axios.post('http://localhost:50814/MES/SaveFixtureDeliver', {
                EM_USER: localStorage.getItem('userName'),
                EM_FIXTURE: molds.join(',')
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$toast.success('送治具成功')
                    this.list = []
                    this.onFocus()
                }else{
                    this.$toast.fail('送治具失败')
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
    padding: 0.5rem 1.5rem;
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
</style>