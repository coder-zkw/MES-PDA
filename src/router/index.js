import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import WorkList from '../components/WorkList'
import ExamineList from '../components/ExamineList'
import WorkDetails from '../components/WorkDetails'
import Tuning from '../components/Tuning'
import Examine from '../components/Examine'
import Audit from '../components/Audit'
import ExamDetails from '../components/ExamDetails'
import Preparation from '../components/Preparation'
import SendMold from '../components/SendMold'
import UpperMold from '../components/UpperMold'
import RemoveMold from '../components/RemoveMold'
import ReturnMold from '../components/ReturnMold'
import Repair from '../components/Repair'
import Maintenance from '../components/Maintenance'
import PrepFixture from '../components/Fixture/PrepFixture'
import SendFixture from '../components/Fixture/SendFixture'
import UpperFixture from '../components/Fixture/UpperFixture'
import RemoveFixture from '../components/Fixture/RemoveFixture'
import ReturnFixture from '../components/Fixture/ReturnFixture'

Vue.use(VueRouter)

const routes = [
    {
        path: '/login',
        component: Login
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
        path: '/home',
        component: Home
    },
    {
        path: '/worklist',
        component: WorkList
    },
    {
        path: '/examlist',
        component: ExamineList
    },
    {
        path: '/workdetails',
        component: WorkDetails
    },
    {
        path: '/tuning',
        component: Tuning
    },
    {
        path: '/examine',
        component: Examine
    },
    {
        path: '/audit',
        component: Audit
    },
    {
        path: '/examdetails',
        component: ExamDetails
    },
    {
        path: '/preparation',
        component: Preparation
    },
    {
        path: '/sendmold',
        component: SendMold
    },
    {
        path: '/uppermold',
        component: UpperMold
    },
    {
        path: '/removemold',
        component: RemoveMold
    },
    {
        path: '/returnmold',
        component: ReturnMold
    },
    {
        path: '/repair',
        component: Repair
    },
    {
        path: '/maintain',
        component: Maintenance
    },
    {
        path: '/prepfixture',
        component: PrepFixture
    },
    {
        path: '/sendfixture',
        component: SendFixture
    },
    {
        path: '/usefixture',
        component: UpperFixture
    },
    {
        path: '/removefixture',
        component: RemoveFixture
    },
    {
        path: '/returnfixture',
        component: ReturnFixture
    }
]

const router = new VueRouter({
    routes
})

export default router