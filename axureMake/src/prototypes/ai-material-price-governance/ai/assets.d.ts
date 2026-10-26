/** Vite 资源导入声明（pdf.worker 以 ?raw 内联为字符串，再用 Blob 生成 worker 地址） */
declare module '*?url' {
  const src: string;
  export default src;
}

declare module '*?raw' {
  const src: string;
  export default src;
}
