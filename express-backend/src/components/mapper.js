export const __courseNameMap = {
  'BACHELOR OF SCIENCE IN COMPUTER SCIENCE': 'BSCS',
  'BS COMPUTER SCIENCE': 'BSCS',
  'COMPUTER SCIENCE': 'BSCS',
  'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY': 'BSIT',
  'BS INFORMATION TECHNOLOGY': 'BSIT',
  'INFORMATION TECHNOLOGY': 'BSIT',
  'BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT': 'BSHM',
  'BS HOSPITALITY MANAGEMENT': 'BSHM',
  'HOSPITALITY MANAGEMENT': 'BSHM',
  'BACHELOR OF SCIENCE IN TOURISM MANAGEMENT': 'BSTM',
  'BS TOURISM MANAGEMENT': 'BSTM',
  'TOURISM MANAGEMENT': 'BSTM',
  'BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION': 'BSBA',
  'BS BUSINESS ADMINISTRATION': 'BSBA',
  'BUSINESS ADMINISTRATION': 'BSBA',
  'BACHELOR OF SCIENCE IN OFFICE ADMINISTRATION': 'BSOA',
  'BS OFFICE ADMINISTRATION': 'BSOA',
  'OFFICE ADMINISTRATION': 'BSOA',
  'BACHELOR OF ELEMENTARY EDUCATION': 'BECED',
  'ELEMENTARY EDUCATION': 'BECED',
  'BACHELOR OF TECHNOLOGY AND LIVELIHOOD EDUCATION': 'BTLE',
  'TECHNOLOGY AND LIVELIHOOD EDUCATION': 'BTLE'
};

export const __knownCourses = {
  'CCS': ['BSCS', 'BSIT'],
  'CHTM': ['BSHM', 'BSTM'],
  'CBA': ['BSBA', 'BSOA'],
  'CTE': ['BECED', 'BTLE'],
  'COE': ['BSEE', 'BSCE', 'BSME'],
  'CON': ['BSN'],
  'CAS': ['AB', 'BS']
};

export const __validGradeStatuses = [
  'PASSED', 'FAILED', 'INCOMPLETE',
  'DROPPED', 'WITHDREW',
  'INC', 'DRP',
  'P', 'F']

export const __gradesIndicators = [
  'STUDENT NUMBER', 'STUDENT NAME', 'SUBJECT CODE', 'SUBJECT DESCRIPTION',
  'UNITS', 'EQUIVALENT', 'GRADE', 'GRADES', 'REMARKS', 'GWA',
  'ACADEMIC RECORD', 'TRANSCRIPT', 'GRADING', 'FINAL GRADE'
];

export async function __subject(firstCell, row, convertExcelTimeToReadable)  {
  return {
    'Subject Code': firstCell,
    'Description': String(row[1] || '').trim(),
    'Type': String(row[2] || '').trim(),
    'Units': String(row[3] || '').trim(),
    'Day': String(row[4] || '').trim(),
    'Time Start': convertExcelTimeToReadable(row[5]),
    'Time End': convertExcelTimeToReadable(row[6]),
    'Room': String(row[7] || '').trim()
  }
};

export const courseDepartmentMap = [
  { prefixes: ['BS HM', 'BSHM'], department: ['CHTM'] },
  { prefixes: ['BS TM', 'BSTM'], department: ['CHTM'] },
  { prefixes: ['BS IT', 'BSIT'], department: ['CCS'] },
  { prefixes: ['BS CS', 'BSCS'], department: ['CCS'] },
  { prefixes: ['BS BA', 'BSBA'], department: ['CBA'] },
  { prefixes: ['BS OA', 'BSOA'], department: ['CBA'] },
]

export const programMap = [
  { Keywords: ['COMPUTER SCIENCE'], code: ['CCS'] },
  { Keywords: ['INFORMATION TECHNOLOGY'], code: ['CCS'] },
  { Keywords: ['HOSPITALITY MANAGEMENT', 'HOSPITALITY'], code: ['CHTM'] },
  { Keywords: ['TOURISM MANAGEMENT', 'TOURISM'], code: ['CHTM'] },
  { Keywords: ['BUSINESS ADMINISTRATION', 'BUSINESS'], code: ['CBA'] },
  { Keywords: ['OFFICE ADMINISTRATION'], code: ['CBA'] },
  { Keywords: ['EDUCATION'], code: ['CTE'] },
  { Keywords: ['ENGINEERING'], code: ['COE'] },
  { Keywords: ['NURSING'], code: ['CON'] },
  { Keywords: ['ARTS', 'SCIENCE'], code: ['CAS'], matchAll: true },
]

export const __fieldMappings = {
  subject_code: ['SUBJECT CODE', 'SUBJ CODE', 'CODE', 'COURSE CODE'],
  subject_description: ['SUBJECT DESCRIPTION', 'DESCRIPTION', 'SUBJECT NAME', 'COURSE TITLE', 'TITLE'],
  units: ['UNITS', 'CREDITS', 'CREDIT UNITS', 'CR'],
  equivalent: ['EQUIVALENT', 'GRADE', 'FINAL GRADE', 'RATING'],
  remarks: ['REMARKS', 'STATUS', 'RESULT', 'COMMENT']
};