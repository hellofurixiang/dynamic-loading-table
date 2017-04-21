export default function getResponseData (url, paramObj, callbackSuccess, callbackError) {
  try {
    this.$http.post(url, JSON.stringify(paramObj)).then(function (response) {
      const responseData = response.data
      if (responseData.state === '1') {
        callbackSuccess(responseData.resBody)
      }
    }, function (error) {
      callbackError(error)
    })
  } catch (e) {
    callbackError(e.message)
  }
}

