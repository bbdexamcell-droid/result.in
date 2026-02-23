document.addEventListener("DOMContentLoaded", function () {

  const params = new URLSearchParams(window.location.search);
  const roll = params.get("roll");
  const sem = Number(params.get("sem"));

  if (!roll || !sem) {
    document.body.innerHTML = "<h2>Invalid Access</h2>";
    return;
  }

  fetch("students.json")
    .then(res => res.json())
    .then(data => {

      const studentData = data.filter(s => String(s.ROLL) === String(roll));

      if (studentData.length === 0) {
        document.body.innerHTML = "<h2>Student Not Found</h2>";
        return;
      }

      const student = studentData[0];

      /* ===== HEADER DETAILS ===== */

      document.getElementById("studentName").innerText = student.NAME || "-";
      document.getElementById("studentRoll").innerText = student.ROLL || "-";
      document.getElementById("fatherName").innerText = student.FATHER || "-";
      document.getElementById("motherName").innerText = student.MOTHER || "-";
      document.getElementById("enrollmentNo").innerText = student.ENROLLMENT || "-";
      document.getElementById("branch").innerText = student.BRANCH || "-";
      document.getElementById("examType").innerText = student.EXAM_TYPE || "MAIN";
      document.getElementById("status").innerText = student.STATUS || "RG";

      const session = student.SESSION || "2024-25";

      let yearText = "";
      if (sem === 1 || sem === 2) yearText = "First Year Session";
      else if (sem === 3 || sem === 4) yearText = "Second Year Session";
      else if (sem === 5 || sem === 6) yearText = "Third Year Session";
      else if (sem === 7 || sem === 8) yearText = "Final Year Session";

      document.getElementById("sessionLine").innerText = `${yearText}: ${session}`;

      /* ===== Semester Name ===== */

      const semesterNames = {
        1: "First Semester",
        2: "Second Semester",
        3: "Third Semester",
        4: "Fourth Semester",
        5: "Fifth Semester",
        6: "Sixth Semester",
        7: "Seventh Semester",
        8: "Eighth Semester"
      };

      document.getElementById("leftSemTitleRow").innerText =
        semesterNames[sem] || ("Semester " + sem);

      /* ===== Load Selected Semester ===== */

      const tableBody = document.getElementById("leftTable");
      tableBody.innerHTML = "";

      const semData = studentData.filter(s => Number(s.SEMESTER) === sem);

      if (semData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9">No Records Found</td></tr>`;
        return;
      }

      /* ===== SGPA helpers ===== */

      const gradePointMap = {
        "O": 10,
        "A+": 9,
        "A": 8,
        "B+": 7,
        "B": 6,
        "C": 5,
        "P": 4,
        "F": 0
      };

      /* ===== SUBJECT ROWS ===== */

      let totalESE = 0;
      let totalCIA = 0;
      let totalCredit = 0;
      let weightedSum = 0;

      // ⭐ NEW → carry list
      let carryList = [];

      semData.forEach(s => {

        const ese = Number(s.ESE) || 0;
        const cia = Number(s.CIA) || 0;
        const total = ese + cia;

        totalESE += ese;
        totalCIA += cia;

        const credit = Number(s.CREDIT) || 0;

        const grade = String(s.GRADE || "")
          .replace(/\s+/g, "")
          .toUpperCase();

        const gradePoint = gradePointMap[grade] ?? 0;

        totalCredit += credit;
        weightedSum += credit * gradePoint;

        // ⭐ NEW → detect carry
        if (grade === "F") {
          carryList.push(s.SUBJECT_CODE);
        }

        tableBody.innerHTML += `
          <tr>
            <td>${s.SUBJECT_CODE || "-"}</td>
            <td>${ese}</td>
            <td>60</td>
            <td>${cia}</td>
            <td>40</td>
            <td>${total}</td>
            <td>100</td>
            <td>${s.CREDIT || "-"}</td>
            <td>${s.GRADE || "-"}</td>
          </tr>
        `;
      });

      // ⭐ NEW → show carry papers
      document.getElementById("carryPapers").innerText =
        carryList.length ? carryList.join(", ") : "-";

      /* ===== TOTAL ROW ===== */

      const grandTotal = totalESE + totalCIA;
      const subjectCount = semData.length;

      tableBody.innerHTML += `
        <tr>
          <th>Total</th>
          <th>${totalESE}</th>
          <th>${subjectCount * 60}</th>
          <th>${totalCIA}</th>
          <th>${subjectCount * 40}</th>
          <th>${grandTotal}</th>
          <th>${subjectCount * 100}</th>
          <th></th>
          <th></th>
        </tr>
      `;

      /* ===== SGPA CALCULATION ===== */

      const sgpa = totalCredit ? (weightedSum / totalCredit).toFixed(2) : "0.00";

      /* ===== Credit + SGPA Section ===== */

      tableBody.innerHTML += `
<tr>
  <th colspan="3">Credit Theory</th>
  <th colspan="3">Credit Practical</th>
  <th colspan="3" rowspan="2">SGPA</th>
</tr>

<tr>
  <td>Obt.</td>
  <td colspan="2">13</td>

  <td>Obt.</td>
  <td colspan="2">4</td>
</tr>

<tr>
  <td>Max</td>
  <td colspan="2">20</td>

  <td>Max</td>
  <td colspan="2">4</td>

  <td colspan="3">${sgpa}</td>
</tr>
`;

    })
    .catch(() => {
      document.body.innerHTML = "<h2>Server Error</h2>";
    });

});