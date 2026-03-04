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
// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
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
    // TODO: Implement this function
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
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
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
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
    // TODO: Implement this function
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
