class Filemeta {
  constructor() {
    this.Filetype = {
      '.pdf': 'application/pdf',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
    }
  }
  
   static getFileType(extesnsion) {
    return this.Filetype[extesnsion.toLowerCase()] || 'application/octet-stream';
  }

}
export default Filemeta;  