import { callApi } from '../../utils/https'

export const mockGetQuery = () =>
  callApi({
    url: 'file/upload',
    contentType: 'multipart',
  })
