
import axiosInstance from "@/utils/request";

const categoryApi = {
  getCategories: async (page, pageSize) => {
    return await axiosInstance.get('/categories', {
      params: {
        page: page,
        pageSize: pageSize
      }
    }).then((response) => {
      return response.data
    })
  }
}
