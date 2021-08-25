import { callApi } from '../utils/https'

export * from './mock'
export * from './file'

export const getQuery = () =>
  callApi({
    url: 'admin/getQuery',
  })

export const postDel = (data) =>
  callApi({
    url: 'admin/postDel',
    data,
    method: 'post'
  })

export const postAdd = (data) =>
  callApi({
    url: 'admin/postAdd',
    data,
    method: 'post',
    contentType: 'urlencoded',
  })
