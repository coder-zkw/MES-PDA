import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    currentOrderData: {}
  },
  mutations: {
    changeOrderData(state, data) {
      state.currentOrderData = data
    }
  },
  actions: {
    handleChangeOrder(context, data) {
      context.commit('changeOrderData', data)
    }
  },
  getter: {

  }
})

export default store