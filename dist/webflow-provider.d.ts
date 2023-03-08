declare type WebflowProviderOptions = {
  url: string
  fetch: any
  entity: Record<string, any>
  debug: boolean
}
declare function WebflowProvider(
  this: any,
  options: WebflowProviderOptions
): {
  exports: {
    makeUrl: (suffix: string, q: any) => string
    makeConfig: (config?: any) => any
    getJSON: (url: string, config?: any) => Promise<any>
    postJSON: (url: string, config: any) => Promise<any>
  }
}
export default WebflowProvider
