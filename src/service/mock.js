import { callApi } from '../../utils/https'

export const mockGetQuery = () =>
  callApi({
    url: 'mock/getQuery',
    prefixUrl: 'api1',
  })

export const mockPostDel = (data) =>
  callApi({
    url: 'mock/postDel',
    data,
    options: {
      method: 'post',
    },
    prefixUrl: 'api1',
  })

export const mockPostAdd = (data) =>
  callApi({
    url: 'mock/postAdd',
    data,
    options: {
      method: 'post',
    },
    contentType: 'urlencoded',
    prefixUrl: 'api1',
  })
