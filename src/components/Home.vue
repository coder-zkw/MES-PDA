<template>
    <div class="home">
        <van-nav-bar fixed title="选择指令">
            <!-- <template #left>
                <van-icon name="wap-home" color="#333"/>首页
            </template> -->
            <template #left>
                <van-tag size="large">
                    <van-icon name="user-circle-o" color="#fff" />{{user}}
                </van-tag>
            </template>
        </van-nav-bar>
        <switch-btn :home="true"></switch-btn>
        <van-grid class="commands" :gutter="10" :column-num="2">
            <van-grid-item v-for="(item, i) in commands" :key="i">
                <van-button class="commandBtn" type="primary" @click="toTargetPage(item)">{{item.text}}</van-button>
            </van-grid-item>
        </van-grid>
        <van-popup v-model="selectMachineShow" round closeable position="bottom" :style="{ height: '30%' }">
            <div class="selectTit">选择机台</div>
            <van-field v-model="machine" left-icon="desktop-o" ref="scanInput" autofocus @keyup.enter.native="selectMachineScan" placeholder="请扫码选择" />
        </van-popup>
        <van-popup v-model="selectModleShow" round position="bottom" :style="{ height: '50%' }">
            <van-picker
                show-toolbar
                :columns="columns"
                @confirm="onConfirm"
                @cancel="selectModleShow = false"
            />
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
            user: localStorage.getItem('userName'),
            commands: [
                {text: '调 机', path: '/worklist', isHasMachine: true},
                {text: '首 / 中 / 末检', path: '/examlist', isHasMachine: false},
                {text: 'IPQC审核', path: '/audit', isHasMachine: false},
                {text: '模具管理', isHasMachine: false, isHasSelect: true},
                {text: '治具管理', isHasMachine: false, isHasSelect: true}
            ],
            selectMachineShow: false,
            selectModleShow: false,
            machine: '',
            // 所有机台
            machines: ['machine02', 'machine03'],
            // 在线机台
            machinesOnline: [],
            // 需选择机台的跳转页面路径，保留最后跳转用
            selectMachinePath: '',
            columns: [],
            paths: []
        }
    },
    created() {
        this.getMachines()
        this.getEquipmentOnline()
    },
    methods: {
        getEquipmentOnline() {
        axios.get(this.killBrowserUrl + 'server/getOnline')
        .then((res) => {
            // console.log(res)
            if(res.data.code === 200) {
                this.machinesOnline = res.data.content
            } 
        }).catch(err => err)
        // 模拟有在线机台，用于测试
        // this.machinesOnline = [{name: 'machine02'},{name: 'machine03'}]
        },
        getMachines() {
            // 获取缓存中的设备名
            // const userName = localStorage.getItem('userName')
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetUser')
            axios.get(this.httpUrl + 'MES/GetUser')
            .then((res) => {
            // console.log(res)
            if(res.status === 200 && res.statusText === 'OK') {
                res.data.machine.map(item => {
                    this.machines.push(item.BM_NAME)
                })
            }else{
                this.$toast.fail('获取设备名失败')
            }
            }).catch(err => err)
        },
        toTargetPage(item) {
            if(item.isHasMachine) {
                this.selectMachineShow = true
                this.selectMachinePath = item.path
                this.$nextTick(() => {
                    this.$refs.scanInput.focus()
                })
            }else if(item.isHasSelect) {
                this.selectModleShow = true
                if(item.text === '模具管理') {
                    this.columns = ['备模', '送模', '上模', '下模', '上库位', '维修', '保养']
                    this.paths = ['/preparation', '/sendmold', '/uppermold', '/removemold', '/returnmold', '/repair', '/maintain']
                } else if (item.text === '治具管理') {
                    this.columns = ['备治具', '送治具', '使用治具', '退治具', '上库位', '维修', '保养']
                    this.paths = ['/prepfixture', '/sendfixture', '/usefixture', '/removefixture', '/returnfixture', '/repair', '/maintain']
                }
            } else {
                this.$router.push(item.path)
            }
        },
        selectMachineScan() {
            if(this.machine === '') {
                return this.$toast.fail('扫描结果为空')
            }
            const isMachine = this.machines.findIndex(item => item === this.machine)
            if(isMachine === -1) {
                return this.$toast.fail('此机台不存在')
            }
            const isOnline = this.machinesOnline.findIndex(item => item.name === this.machine)
            if(isOnline === -1) {
                this.$toast.fail('当前机台未连接，请先上线')
                return
            }
            localStorage.setItem('machine', this.machine)
            this.$router.push(this.selectMachinePath)
        },
        onConfirm(value,i) {
            // let path = ''
            // switch (value) {
            //     case '备模': path = '/preparation'
            //     break;
            //     case '送模': path = '/sendmold'
            //     break;
            //     case '上模': path = '/uppermold'
            //     break;
            //     case '下模': path = '/removemold'
            //     break;
            //     case '上库位': path = '/returnmold'
            //     break;
            //     case '维修': path = '/repair'
            //     break;
            //     case '保养': path = '/maintain'
            //     break;
            // }
            // this.$router.push(path)
            
            this.$router.push(this.paths[i])
            this.selectModleShow = false
        }
    }
}
</script>
<style scoped>
.home .van-nav-bar__left i, .home .van-nav-bar__right i{
    padding-right: 0.2rem;
    font-size: 1.2rem;
}
.commands{
    margin-top: 1rem;
}
.commandBtn{
    width: 80%;
}
.selectTit{
    margin: 1.5rem;
}
.van-cell{
  margin-top: 10px;
  /* font-size: 12px; */
  color:rgb(38, 181, 238);
  /* border-radius: 22px; */
  /* box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.2); */
}
/deep/ .van-field__left-icon .van-icon{
  font-size: 20px;
  font-weight: 700;
}
</style>
