const fs = require("fs");
function convertToSeconds(time){
let[timePart,period]= time.split(" ");
let[hours,minutes,seconds]=timePart.split(":").map(Number);
if(period.toLowerCase()==="pm"&& hours!==12){
    hours+=12;
}else if(period.toLowerCase()==="am" && hours===12){
    hours=0;
}
return hours*3600 + minutes*60 + seconds;
}
// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
 let startSecond = convertToSeconds(startTime);
    let endSecond = convertToSeconds(endTime); 
    let diff = endSecond - startSecond;
    let h = Math.floor(diff/3600);
    let reamingingSeconds = diff%3600;
    let m = Math.floor(reamingingSeconds/60);
    let s = reamingingSeconds%60;
    m = m.toString().padStart(2,"0");
    s = s.toString().padStart(2,"0");
    return `${h}:${m}:${s}`;
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
     let startSec=convertToSeconds(startTime);
    let endSec=convertToSeconds(endTime);
    const deliveryStart =28800;
    const deliveryEnd =79200;
    let idleBefore =0;
    let idleAfter =0;
    if(startSec<deliveryStart){
        idleBefore =deliveryStart - startSec;
}
if(endSec>deliveryEnd){
    idleAfter = endSec - deliveryEnd;
}
let idle =idleBefore + idleAfter;
let h = Math.floor(idle/3600);
let remainingSeconds = idle%3600;
let m = Math.floor(remainingSeconds/60);
let s = remainingSeconds%60;
m = m.toString().padStart(2,"0");
s = s.toString().padStart(2,"0");
return `${h}:${m}:${s}`;
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
let[h1,m1,s1] = shiftDuration.split(":").map(Number);
    let shiftSeconds = h1*3600 + m1*60 + s1;
    let[h2,m2,s2] = idleTime.split(":").map(Number);
    let idleSeconds = h2*3600 + m2*60 + s2;
    let diffSeconds = shiftSeconds - idleSeconds;
    let h = Math.floor(diffSeconds/3600);
    let remainingSeconds = diffSeconds%3600;
    let m = Math.floor(remainingSeconds/60);
    let s = remainingSeconds%60;
    m = m.toString().padStart(2,"0");
    s = s.toString().padStart(2,"0");
    return `${h}:${m}:${s}`;
}



function hmsToSeconds(hms){
let[h,m,s] = hms.split(":").map(Number);
return h*3600 + m*60 + s;
}



// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    let[year,month,day] = date.split("-").map(Number);
let quotaSeconds = hmsToSeconds("8:24:00");
if(year ===2025 && month === 4 && day >=10 && day<=30){
    quotaSeconds = hmsToSeconds("6:00:00");
}
let activeSeconds = hmsToSeconds(activeTime);
return activeSeconds >= quotaSeconds;
}
/// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================




function readLines(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8").trim();
  if (data === "") return [];
  return data.split("\n").map(line => line.trim()).filter(line => line !== "");
}

function writeLines(filePath, lines) {
  const content = lines.join("\n") + (lines.length > 0 ? "\n" : "");
  fs.writeFileSync(filePath, content, "utf8");
}

function parseShiftLine(line) {
  const parts = line.split(",");
  return {
    driverID: parts[0],
    driverName: parts[1],
    date: parts[2],
    startTime: parts[3],
    endTime: parts[4],
    shiftDuration: parts[5],
    idleTime: parts[6],
    activeTime: parts[7],
    metQuota: parts[8] === "true",   
    hasBonus: parts[9] === "true"
  };
}

function shiftObjToLine(obj) {
  return [
    obj.driverID,
    obj.driverName,
    obj.date,
    obj.startTime,
    obj.endTime,
    obj.shiftDuration,
    obj.idleTime,
    obj.activeTime,
    obj.metQuota ? "true" : "false",
    obj.hasBonus ? "true" : "false"
  ].join(",");
}





function addShiftRecord(textFile, shiftObj) {
  const lines = readLines(textFile);

  for (const line of lines) {
    const row = parseShiftLine(line);
    if (row.driverID === shiftObj.driverID && row.date === shiftObj.date) {
      return {}; 
    }
  }

  const shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
  const idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
  const activeTime = getActiveTime(shiftDuration, idleTime);
  const quotaMet = metQuota(shiftObj.date, activeTime);

  const fullRecord = {
    driverID: shiftObj.driverID,
    driverName: shiftObj.driverName,
    date: shiftObj.date,
    startTime: shiftObj.startTime,
    endTime: shiftObj.endTime,
    shiftDuration: shiftDuration,
    idleTime: idleTime,
    activeTime: activeTime,
    metQuota: quotaMet,
    hasBonus: false
  };

  const newLine = shiftObjToLine(fullRecord);

  let insertIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const row = parseShiftLine(lines[i]);
    if (row.driverID === shiftObj.driverID) {
      insertIndex = i;
    }
  }

  if (insertIndex === -1) {
    lines.push(newLine);
  } else {
    lines.splice(insertIndex + 1, 0, newLine);
  }

  writeLines(textFile, lines);

  return fullRecord;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
     const lines = readLines(textFile);

  for (let i = 0; i < lines.length; i++) {
    const row = parseShiftLine(lines[i]);

    if (row.driverID === driverID && row.date === date) {
      row.hasBonus = newValue === true;   
      lines[i] = shiftObjToLine(row);
      writeLines(textFile, lines);
      return; 
    }
  }

}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
     const lines = readLines(textFile);

  const targetMonth = Number(month); // handles "04" and "4"
  let driverFound = false;
  let count = 0;

  for (const line of lines) {
    const row = parseShiftLine(line);

    if (row.driverID === driverID) {
      driverFound = true;

      // row.date format: yyyy-mm-dd
      const rowMonth = Number(row.date.split("-")[1]);

      if (rowMonth === targetMonth && row.hasBonus === true) {
        count++;
      }
    }
  }

  if (!driverFound) return -1;
  return count;
}


function secondsToHms(totalSeconds) {
  // totalSeconds is non-negative integer
  let h = Math.floor(totalSeconds / 3600);
  let remaining = totalSeconds % 3600;
  let m = Math.floor(remaining / 60);
  let s = remaining % 60;

  m = m.toString().padStart(2, "0");
  s = s.toString().padStart(2, "0");

  return `${h}:${m}:${s}`;
}



// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    const lines = readLines(textFile);
  const targetMonth = Number(month);

  let totalSeconds = 0;

  for (const line of lines) {
    const row = parseShiftLine(line);

    if (row.driverID !== driverID) continue;

    const rowMonth = Number(row.date.split("-")[1]);
    if (rowMonth !== targetMonth) continue;

    // activeTime is stored as h:mm:ss
    totalSeconds += hmsToSeconds(row.activeTime);
  }

  return secondsToHms(totalSeconds);
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================


function parseRateLine(line) {
  const [driverID, dayOff, basePay, tier] = line.split(",");
  return {
    driverID: driverID,
    dayOff: dayOff,                 
    basePay: Number(basePay),
    tier: Number(tier)
  };
}

function getWeekdayName(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z"); 
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[d.getUTCDay()];
}



function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    const shiftLines = readLines(textFile);
  const rateLines = readLines(rateFile);
  const targetMonth = Number(month);

  let dayOff = null;
  for (const line of rateLines) {
    const r = parseRateLine(line);
    if (r.driverID === driverID) {
      dayOff = r.dayOff;
      break;
    }
  }

  let requiredSeconds = 0;

  for (const line of shiftLines) {
    const row = parseShiftLine(line);
    if (row.driverID !== driverID) continue;

    const [y, m, d] = row.date.split("-").map(Number);
    if (m !== targetMonth) continue;

    if (dayOff !== null) {
      const weekday = getWeekdayName(row.date);
      if (weekday.toLowerCase() === dayOff.toLowerCase()) {
        continue;
      }
    }

    let dailyQuotaSeconds = hmsToSeconds("8:24:00");
    if (y === 2025 && m === 4 && d >= 10 && d <= 30) {
      dailyQuotaSeconds = hmsToSeconds("6:00:00");
    }

    requiredSeconds += dailyQuotaSeconds;
  }

  const bonusReductionSeconds = Number(bonusCount) * 2 * 3600;
  requiredSeconds -= bonusReductionSeconds;

  if (requiredSeconds < 0) requiredSeconds = 0;

  return secondsToHms(requiredSeconds); 
}





// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
 const rateLines = readLines(rateFile);

  let basePay = null;
  let tier = null;

  for (const line of rateLines) {
    const r = parseRateLine(line);
    if (r.driverID === driverID) {
      basePay = r.basePay;
      tier = r.tier;
      break;
    }
  }

  if (basePay === null || tier === null) return 0;

  const actualSec = hmsToSeconds(actualHours);
  const requiredSec = hmsToSeconds(requiredHours);

  if (actualSec >= requiredSec) return basePay;

  let missingSec = requiredSec - actualSec;

  let allowanceHours = 0;
  if (tier === 1) allowanceHours = 50;
  else if (tier === 2) allowanceHours = 20;
  else if (tier === 3) allowanceHours = 10;
  else if (tier === 4) allowanceHours = 3;

  let missingHours = missingSec / 3600;

  let billableHours = missingHours - allowanceHours;
  if (billableHours < 0) billableHours = 0;

  billableHours = Math.floor(billableHours);

  const deductionRatePerHour = Math.floor(basePay / 185);
  const deduction = billableHours * deductionRatePerHour;

  return basePay - deduction;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
