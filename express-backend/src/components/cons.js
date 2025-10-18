class Filemeta {
  constructor() {
    this.Filetype = {
      '.pdf': 'application/pdf',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  }
  
   getFileType(extesnsion) {
    return this.Filetype[extesnsion.toLowerCase()] || 'application/octet-stream';
  }

}
module.exports = { Filemeta };  