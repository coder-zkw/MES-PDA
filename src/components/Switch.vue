<template>
    <div class="switch">
        <van-icon name="ellipsis" size="18" @click="selectSwitch"/>
        <van-popup v-model="switchShow" position="top">
            <van-cell-group>
                <van-cell title="切换用户" @click="switchUser"/>
                <van-cell title="更换指令" v-if="!home" @click="switchCommand" />
            </van-cell-group>
        </van-popup>
    </div>
</template>
<script>
export default {
    props: {
        home: {
            type: Boolean
        }
    },
    data() {
        return {
            switchShow: false
        }
    },
    methods: {
        selectSwitch() {
            this.switchShow = true
        },
        switchUser() {
            this.$router.replace('/login')
        },
        switchCommand() {
            this.$router.replace('/home')
        }
    }
}
</script>
<style scoped>
.switch{
    position: fixed;
    right: 0.5rem;
    top: 2rem;
    color: #1989fa;
    z-index: 10;
}
</style>