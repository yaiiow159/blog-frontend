

export const commonRules = {
  required: (value) => !!value || "此欄位為必填欄位",
  emailRule: (value) => {
    // 需要為 ****@****.****
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(value) || "電子郵件格式錯誤"
  },
  usernameRule: (value) => {
    const pattern = /^[a-z0-9]+$/
    return pattern.test(value) || "帳號只能是英文字母或數字"
  },
  passwordRule: (value) => {
    // 需要為 8 碼以上
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return pattern.test(value) || "密碼格式錯誤"
  },
  phoneRule: (value) => {
    // 需要為 10 碼以上
    const pattern = /^09\d{8}$/
    return pattern.test(value) || "手機號碼格式錯誤"
  }
}
