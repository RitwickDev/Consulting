const pdf = require('pdf-parse');
const fs = require('fs');

class CVParser {
  async parsePDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  async parseText(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error('Error reading text file:', error);
      throw new Error('Failed to read text file');
    }
  }

  async parseCV(filePath, fileType) {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return await this.parsePDF(filePath);
      case 'txt':
        return await this.parseText(filePath);
      case 'doc':
      case 'docx':
        // For now, instruct user to convert to PDF
        throw new Error('Please convert Word documents to PDF format');
      default:
        throw new Error('Unsupported file type. Please use PDF or TXT format');
    }
  }
}

module.exports = new CVParser();
