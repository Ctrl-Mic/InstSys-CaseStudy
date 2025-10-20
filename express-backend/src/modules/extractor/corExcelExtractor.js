import * as xlsx from 'xlsx';
import path from 'path';
import { __courseNameMap, __knownCourses, __subject, programMap, courseDepartmentMap} from './../../components/mapper.js';
import { __defaultText, __text, metadataSchema} from '../../components/constructor.js';
import { logMessage } from './../../utils/console.js';

 class CORExcelExtractor {
  constructor(log = false) {

    this.knownCourses = __knownCourses;
    this.log = log;
  }

  async extractCORExcelInfoSmart(filename) {
    try {
      
      const workbook = xlsx.readFile(filename);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });      
      const corInfo = this.extractCORUniversalScan(data, filename);
      
      if (corInfo && corInfo.program_info.Program) {
        logMessage('✅ Universal COR extraction successful', this.log);
        return corInfo;
      }
      
      logMessage('Could not extract COR data from any format', this.log);
      return null;
      
    } catch (error) {
      console.error(`Error in universal COR extraction: ${error.message}`);
      return null;
    }
  }

  extractCORUniversalScan(data, filename) {
    try {
      let programInfo = { Program: '', 'Year Level': '', Section: '', Adviser: '' };
      let scheduleData = [];
      let totalUnits = null;
      
      programInfo = this.scanForProgramInfo(data, filename);
      scheduleData = this.scanForScheduleData(data);
      totalUnits = this.scanForTotalUnits(data);
      console.log(`📋 Total Units: ${totalUnits}`);
      
      return {
        program_info: programInfo,
        schedule: scheduleData,
        total_units: totalUnits
      };
      
    } catch (error) {
      console.error(`⚠️ Universal scan failed: ${error.message}`);
      return null;
    }
  }

  scanForProgramInfo(data, filename) {
    const programInfo = { Program: '', 'Year Level': '', Section: '', Adviser: '' };
    
    const maxRows = Math.min(data.length, 30);
    const maxCols = 15;
    
    for (let i = 0; i < maxRows; i++) {
      const row = data[i] || [];
      for (let j = 0; j < Math.min(row.length, maxCols); j++) {
        const cellValue = String(row[j] || '').trim();
        if (!cellValue) continue;
        
        const cellUpper = cellValue.toUpperCase();
        
        if (!programInfo.Program && (cellUpper.includes('PROGRAM') || cellUpper.includes('COURSE'))) {
          logMessage(`   Found label at (${i},${j}): "${cellValue}"`, this.log);
          
          const match = cellValue.match(/(?:PROGRAM|COURSE)\s*[:=]?\s*(.+)/i);
          if (match && match[1].trim()) {
            const value = match[1].trim();
            const cleaned = this.cleanProgramInfoValue(value, 'Program');
            if (cleaned) {
              programInfo.Program = cleaned;
              logMessage(`   ✅ Found Program (same cell): ${cleaned}`, this.log);
              continue;
            }
          }
          
          if (j + 1 < row.length) {
            const nextValue = String(row[j + 1] || '').trim();
            if (nextValue) {
              const cleaned = this.cleanProgramInfoValue(nextValue, 'Program');
              if (cleaned) {
                programInfo.Program = cleaned;
                logMessage(`   ✅ Found Program (right cell): ${cleaned} at (${i},${j + 1})`, this.log);
                continue;
              }
            }
          }
          
          if (i + 1 < data.length && j < data[i + 1].length) {
            const belowValue = String(data[i + 1][j] || '').trim();
            if (belowValue) {
              const cleaned = this.cleanProgramInfoValue(belowValue, 'Program');
              if (cleaned) {
                programInfo.Program = cleaned;
                logMessage(`   ✅ Found Program (below): ${cleaned} at (${i + 1},${j})`, this.log);
                continue;
              }
            }
          }
        }
        
        if (!programInfo['Year Level'] && (cellUpper.includes('YEAR') || cellUpper.includes('LEVEL'))) {
          
          const match = cellValue.match(/(?:YEAR|LEVEL)\s*[:=]?\s*(.+)/i);
          if (match && match[1].trim()) {
            const cleaned = this.cleanProgramInfoValue(match[1].trim(), 'Year Level');
            if (cleaned) {
              programInfo['Year Level'] = cleaned;
              logMessage(`   ✅ Found Year Level: ${cleaned}`, this.log);
              continue;
            }
          }
          
          // Try adjacent cells
          if (j + 1 < row.length) {
            const nextValue = String(row[j + 1] || '').trim();
            const cleaned = this.cleanProgramInfoValue(nextValue, 'Year Level');
            if (cleaned) {
              programInfo['Year Level'] = cleaned;
              logMessage(`   ✅ Found Year Level: ${cleaned}`, this.log);
              continue;
            }
          }
        }
        
        // SECTION detection
        if (!programInfo.Section && (cellUpper.includes('SECTION') || cellUpper.includes('SEC'))) {
          logMessage(`   Found label at (${i},${j}): "${cellValue}"`, this.log);
          
          // Try same cell
          const match = cellValue.match(/(?:SECTION|SEC)\s*[:=]?\s*(.+)/i);
          if (match && match[1].trim()) {
            const cleaned = this.cleanProgramInfoValue(match[1].trim(), 'Section');
            if (cleaned) {
              programInfo.Section = cleaned;
              logMessage(`   ✅ Found Section: ${cleaned}`, this.log);
              continue;
            }
          }
          
          // Try adjacent cells
          if (j + 1 < row.length) {
            const nextValue = String(row[j + 1] || '').trim();
            const cleaned = this.cleanProgramInfoValue(nextValue, 'Section');
            if (cleaned) {
              programInfo.Section = cleaned;
              logMessage(`   ✅ Found Section: ${cleaned}`, this.log);
              continue;
            }
          }
        }
        
        // ADVISER detection
        if (!programInfo.Adviser && (cellUpper.includes('ADVISER') || cellUpper.includes('ADVISOR') || cellUpper.includes('INSTRUCTOR'))) {          
          // Try same cell

          const match = cellValue.match(/(?:ADVISER|ADVISOR|INSTRUCTOR)\s*[:=]?\s*(.+)/i);
          if (match && match[1].trim()) {
            const cleaned = this.cleanProgramInfoValue(match[1].trim(), 'Adviser');
            if (cleaned) {
              programInfo.Adviser = cleaned;
              logMessage(`   ✅ Found Adviser: ${cleaned}`, this.log);
              continue;
            }
          }
          
          // Try adjacent cells
          if (j + 1 < row.length) {
            const nextValue = String(row[j + 1] || '').trim();
            if (nextValue && nextValue.length > 5) { // Likely a name
              programInfo.Adviser = nextValue;
              logMessage(`   ✅ Found Adviser: ${nextValue}`,);
              continue;
            }
          }
        }
      }
    }
        
    // Fallback: Extract from filename if still missing critical info
    if (!programInfo.Program) {
      const filenameCourse = this.extractCourseFromFilename(filename);
      if (filenameCourse) {
        programInfo.Program = filenameCourse;
        logMessage(`   ✅ Found Program from filename: ${filenameCourse}`, this.log);
      }
    }
    
    if (!programInfo['Year Level']) {
      const yearFromFilename = this.extractYearFromFilename(filename);
      if (yearFromFilename) {
        programInfo['Year Level'] = yearFromFilename;
        logMessage(`   ✅ Found Year from filename: ${yearFromFilename}`, this.log);
      }
    }
    
    if (!programInfo.Section) {
      const sectionFromFilename = this.extractSectionFromFilename(filename);
      if (sectionFromFilename) {
        programInfo.Section = sectionFromFilename;
        logMessage(`   ✅ Found Section from filename: ${sectionFromFilename}`, this.log);
      }
    }
        
    return programInfo;
  }

  //Clean and validate program info values
  
  cleanProgramInfoValue(value, field) {
  if (!value) return null;
  
  value = value.trim();
  
  // Remove common prefixes/suffixes
  value = value.replace(/^[:=\-–—]\s*/, '').replace(/\s*[:=\-–—]$/, '').trim();
  
  if (!value || value === ':' || value === '=' || value === '-') return null;
  
  if (field === 'Program') {
    // Map full course names to codes (NEW!)
    const courseNameMap = __courseNameMap
    const valueUpper = value.toUpperCase();
    
    // Check if it's a full name that can be mapped
    for (const [fullName, code] of Object.entries(courseNameMap)) {
      if (valueUpper.includes(fullName)) {
        logMessage(`   🔄 Converted "${value}" to "${code}"`, this.log);
        return code;
      }
    }
    
    // Try to extract course code pattern
    const match = value.match(/\b(BS[A-Z]{2,4}|AB[A-Z]{2,4}|B[A-Z]{2,4})\b/i);
    if (match) {
      return match[1].toUpperCase();
    }
    
    return value;
    
  } else if (field === 'Year Level') {
    // Extract year number
    const match = value.match(/([1-4])/);
    return match ? match[1] : null;
  } else if (field === 'Section') {
    // Extract section letter
    const match = value.match(/\b([A-Z])\b/);
    return match ? match[1] : value.substring(0, 1).toUpperCase();
  } else if (field === 'Adviser') {
    // Clean adviser name
    return value.replace(/[^a-zA-Z\s.,]/g, '').trim();
  }
  
  return value;
}

    //Convert Excel decimal time to readable format
    convertExcelTimeToReadable(excelTime) {
    if (!excelTime || excelTime === '') return 'N/A';
    
    // If it's already a string time (like "8:00 AM"), return as-is
    if (typeof excelTime === 'string' && excelTime.includes(':')) {
        return excelTime;
    }
    
    // Convert Excel decimal to time
    const decimal = parseFloat(excelTime);
    if (isNaN(decimal)) return 'N/A';
    
    // Excel time is stored as fraction of 24 hours
    const totalMinutes = Math.round(decimal * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
    }



  //Extract course from filename
  extractCourseFromFilename(filename) {
    const basename = path.basename(filename, path.extname(filename)).toUpperCase();
    
    // Try multiple patterns
    const patterns = [
      /\b(BS[A-Z]{2,4})\b/,
      /\b(AB[A-Z]{2,4})\b/,
      /\b(B[A-Z]{3,4})\b/
    ];
    
    for (const pattern of patterns) {
      const match = basename.match(pattern);
      if (match) {
        logMessage(`   Matched: ${match[1]}`,this.log);
        return match[1];
      }
    }
    
    return null;
  }

  //Extract year from filename
  extractYearFromFilename(filename) {
    const basename = path.basename(filename, path.extname(filename));
    const match = basename.match(/(\d)(?:YR|YEAR|Y)/i);
    return match ? match[1] : null;
  }

  //Extract section from filename

  extractSectionFromFilename(filename) {
    const basename = path.basename(filename, path.extname(filename));
    const match = basename.match(/SEC([A-Z])|_([A-Z])_/i);
    return match ? (match[1] || match[2]).toUpperCase() : null;
  }

  //Universal schedule data extraction

  scanForScheduleData(data) {

    const scheduleData = [];
    const headerKeywords = ['SUBJECT', 'CODE', 'DESCRIPTION', 'UNITS', 'DAY', 'TIME', 'ROOM'];
    let scheduleStartRow = -1;
    
    // Look for a row with multiple schedule keywords
    for (let i = 0; i < data.length; i++) {
      const row = data[i] || [];
      const rowText = row.slice(0, 10).map(cell => String(cell || '')).join(' ').toUpperCase();
      const keywordCount = headerKeywords.filter(kw => rowText.includes(kw)).length;
      
      if (keywordCount >= 3) {
        scheduleStartRow = i + 1;
        logMessage(`   Found schedule header at row ${i}, data starts at ${scheduleStartRow}`, this.log);
        break;
      }
    }
    
    // Fallback: look for subject code pattern
    if (scheduleStartRow === -1) {
      for (let i = 0; i < data.length; i++) {
        const firstCell = String(data[i]?.[0] || '').trim();
        if (/^[A-Z]{2,4}\s*\d{3}[A-Z]?$/i.test(firstCell)) {
          scheduleStartRow = i;
          logMessage(`   Found schedule data starting at row ${i} (subject code pattern)`, this.log);
          break;
        }
      }
    }
    
    if (scheduleStartRow >= 0) {
      return this.extractScheduleFlexible(data, scheduleStartRow);
    }
    
    return scheduleData;
  }

  //Flexible schedule extraction
extractScheduleFlexible(data, startRow) {
  const schedule = [];
  
  for (let i = startRow; i < data.length; i++) {
    const row = data[i] || [];
    if (row.length === 0) continue;
    
    const firstCell = String(row[0] || '').trim();
    
    // Stop if we hit total or empty rows
    if (!firstCell || /TOTAL/i.test(firstCell)) break;
    
    // Check if this looks like a subject code
    if (!/^[A-Z]{2,4}\s*\d{2,4}[A-Z]?$/i.test(firstCell)) continue;
    
    const subject = __subject;
    
    schedule.push(subject);
  }
  
  return schedule;
}

  //Find total units anywhere in the sheet

  scanForTotalUnits(data) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i] || [];
      for (let j = 0; j < row.length; j++) {
        const cellValue = String(row[j] || '').toUpperCase();
        
        if (cellValue.includes('TOTAL') && (cellValue.includes('UNIT') || cellValue.includes('CREDIT'))) {
          // Look for number in nearby cells
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 3; dj++) {
              const ni = i + di;
              const nj = j + dj;
              
              if (ni >= 0 && ni < data.length && nj >= 0 && nj < data[ni].length) {
                const potentialUnits = String(data[ni][nj] || '').trim();
                if (/^\d+(\.\d+)?$/.test(potentialUnits)) {
                  return potentialUnits;
                }
              }
            }
          }
        }
      }
    }
    return null;
  }

  //Format COR info for display/storage

  formatCORInfoEnhanced(corInfo) {
    let text = __defaultText;
    
    if (corInfo.schedule.length > 0) {
      corInfo.schedule.forEach((course, i) => {
        text += __text
      });
    } else {
      text += '\nNo subjects found in schedule.';
    }
    
    return text.trim();
  }

  //Detect department from course code
  detectDepartmentFromCourse(courseCode) {
  if (!courseCode) return 'UNKNOWN';
  
  const courseUpper = String(courseCode).toUpperCase().trim();
  
  // Handle full program names FIRST (NEW!)
  for (const { Keywords, code, matchAll} in programMap) {
    const hasMatch = matchAll ? Keywords.every(kw => courseUpper.includes(kw)): Keywords.some(kw => courseUpper.includes(kw));
    if (hasMatch) return code;
  }
  
  // Check abbreviated codes
  for (const [dept, courses] of Object.entries(this.knownCourses)) {
    if (courses.includes(courseUpper)) {
      return dept;
    }
  }
  
  // Additional check for BS/AB prefix patterns (NEW!)
  const courseUPPER = courses.toUpperCase().trim()
  for (const entry in courseDepartmentMap) {
    if ( entry.prefixes.some(prefix => courseUPPER.startsWith(prefix))) {
      return entry.department;
    }
  }
  
  return 'UNKNOWN';
}

  //Process COR Excel file and return structured data
  async processCORExcel(filename) {
  try {
    const corInfo = await this.extractCORExcelInfoSmart(filename);
    
    if (!corInfo || !corInfo.program_info.Program) {
      logMessage('❌ Could not extract COR data from Excel', this.log);
      return null;
    }
    
    const formattedText = this.formatCORInfoEnhanced(corInfo);
    const metadata = metadataSchema(corInfo);
        
    return { cor_info: corInfo, formatted_text: formattedText, metadata: metadata };
    
  } catch (error) {
    console.error(`❌ Error processing COR Excel: ${error.message}`);
    return null;
  }
}
}

export default CORExcelExtractor;