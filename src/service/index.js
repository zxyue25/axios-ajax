import { callApi } from '../utils/https'

export * from './mock'
export * from './file'

// get请求带参数
export const getQuery = (data) =>
  callApi({
    url: 'admin/getQuery',
    data,
  })

export const postDel = (data) =>
  callApi({
    url: 'admin/postDel',
    data,
    method: 'post',
  })

export const postAdd = (data) =>
  callApi({
    url: 'admin/postAdd',
    data,
    method: 'post',
    contentType: 'urlencoded',
  })
