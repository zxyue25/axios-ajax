import axios from 'axios'
import qs from 'qs'
import { debounce } from './debounce'

const contentTypes = {
  json: 'application/json; charset=utf-8',
  urlencoded: 'application/x-www-form-urlencoded; charset=utf-8',
  multipart: 'multipart/form-data',
}

function toastMsg() {
  Object.keys(errorMsgObj).map((item) => {
    Message.error(item)
    delete errorMsgObj[item]
  })
}

let errorMsgObj = {}

const defaultOptions = {
  method: 'get',
  withCredentials: true, // 允许把cookie传递到后台
  headers: {
    Accept: 'application/json',
    'Content-Type': contentTypes.json,
  },
  timeout: 15000,
}

export const callApi = (
  url,
  data = {},
  options = {},
  contentType = 'json', // json || urlencoded || multipart
  prefixUrl = 'api'
) => {
  if (!url) {
    const error = new Error('请传入url')
    return Promise.reject(error)
  }
  const fullUrl = `/${prefixUrl}/${url}`

  const newOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      'Content-Type': options.headers && options.headers['Content-Type'] || contentTypes[contentType],
    },
  }

  const { method } = newOptions

  if (method !== 'get' && method !== 'head') {
    if (data instanceof FormData) {
      newOptions.data = data
      newOptions.headers = {
        'x-requested-with': 'XMLHttpRequest',
        'cache-control': 'no-cache',
      }
    } else if (newOptions.headers['Content-Type'] === contentTypes.urlencoded) {
      newOptions.data = qs.stringify(data)
    } else {
      Object.keys(data).forEach((item) => {
        if (
          data[item] === null ||
          data[item] === undefined ||
          data[item] === ''
        ) {
          delete data[item]
        }
      })
      // 没有必要，因为axios会将JavaScript对象序列化为JSON
      // newOptions.data = JSON.stringify(data);
    }
  }

  axios.interceptors.request.use((request) => {
    // 移除起始部分 / 所有请求url走相对路径
    request.url = request.url.replace(/^\//, '')
    return request
  })

  axios.interceptors.response.use(
    (response) => {
      const { data } = response
      if (data.code === 'xxx') { // 与服务端约定
        // 登录校验失败
      } else if (data.code === 'xxx') { // 与服务端约定
        // 无权限
        router.replace({ path: '/403' })
      } else if (data.code === 'xxx') { // 与服务端约定
        return Promise.resolve(data)
      } else {
        const { message } = data
        if (!errorMsgObj[message]) {
          errorMsgObj[message] = message
        }
        setTimeout(debounce(toastMsg, 1000, true), 1000)
        return Promise.reject(data)
      }
    },
    (error) => {
      if (error.response) {
        const { data } = error.response
        const resCode = data.status
        const resMsg = data.message || '服务异常'
        // if (resCode === 401) { // 与服务端约定
        //     // 登录校验失败
        // } else if (data.code === 403) { // 与服务端约定
        //     // 无权限
        //     router.replace({ path: '/403' })
        // }
        if (!errorMsgObj[resMsg]) {
          errorMsgObj[resMsg] = resMsg
        }
        setTimeout(debounce(toastMsg, 1000, true), 1000)
        const err = { code: resCode, respMsg: resMsg }
        return Promise.reject(err)
      } else {
        const err = { type: 'canceled', respMsg: '数据请求超时' }
        return Promise.reject(err)
      }
    }
  )

  return axios({
    url: fullUrl,
    ...newOptions,
  })
}
