
export const rules = {
    required: (value) => !!value || "必填",
    emailRule: (value) => {
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return pattern.test(value) || "電子郵件格式錯誤"
    },
    usernameRule: (value) => {
      const pattern = /^[a-z0-9]+$/
      return pattern.test(value) || "帳號只能是英文字母或數字"
    },
    passwordRule: (value) => {
      const pattern = /^[a-z0-9]+$/
      return pattern.test(value) || "密碼只能是英文字母或數字"
    },
    captchaCodeRule: (value) => {
      // 不能為空或是空字串
      return value !== '' || "驗證碼不能為空"
    },
    confirmPasswordRule: (newPassword, confirmPassword) => {
      return newPassword === confirmPassword || "密碼不一致"
    }
}
