const fs = require('fs');
const path = require('path');

function getBase64(relPath) {
  const full = path.join(__dirname, relPath);
  const ext = path.extname(full).slice(1);
  const buf = fs.readFileSync(full);
  return `data:image/${ext};base64,${buf.toString('base64')}`;
}

const glBajajLogo = getBase64('figures/gl_bajaj_logo.png');
const aktuLogo = getBase64('figures/aktu_logo.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CareSync - Project Report Front Page</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0.55in 0.65in;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: "Times New Roman", Times, serif;
      color: #000000;
      background-color: #ffffff;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .border-container {
      width: 100%;
      height: 100%;
      min-height: 10.45in;
      border: 2.5pt solid #000000;
      padding: 3.5pt;
      display: flex;
      flex-direction: column;
    }

    .inner-border {
      width: 100%;
      height: 100%;
      flex: 1;
      border: 1pt solid #000000;
      padding: 20pt 24pt 18pt 24pt;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
    }

    /* Section 1: Title */
    .title-box {
      margin-top: 2pt;
    }

    .project-title {
      font-size: 15.5pt;
      font-weight: bold;
      line-height: 1.28;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      color: #000000;
    }

    /* Section 2: Degree Notice */
    .degree-notice {
      margin: 8pt 0 6pt 0;
    }

    .p-report {
      font-size: 14pt;
      font-weight: bold;
      line-height: 1.35;
      letter-spacing: 0.02em;
    }

    .p-submitted {
      font-size: 11.5pt;
      font-weight: bold;
      line-height: 1.35;
      margin-top: 2pt;
    }

    .p-partial {
      font-size: 11.5pt;
      font-weight: bold;
      line-height: 1.35;
    }

    .p-degree-of {
      font-size: 11.5pt;
      font-weight: bold;
      line-height: 1.35;
    }

    .p-btech {
      font-size: 16pt;
      font-weight: bold;
      letter-spacing: 0.02em;
      margin-top: 3pt;
      margin-bottom: 2pt;
    }

    .p-in {
      font-size: 12.5pt;
      font-weight: bold;
      line-height: 1.30;
    }

    .p-branch {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 0.02em;
      color: #000000;
      margin-top: 2pt;
    }

    /* Section 3: Students */
    .students-section {
      margin: 6pt 0;
    }

    .p-by {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 6pt;
    }

    .students-grid {
      display: flex;
      justify-content: space-between;
      max-width: 5.6in;
      margin: 0 auto;
      text-align: left;
    }

    .student-col {
      width: 48%;
    }

    .student-item {
      margin-bottom: 6pt;
    }

    .student-name {
      font-size: 12pt;
      font-weight: bold;
      line-height: 1.25;
    }

    .student-roll {
      font-size: 11pt;
      font-weight: bold;
      line-height: 1.25;
      color: #000000;
    }

    /* Section 4: Supervision */
    .supervision-section {
      margin: 6pt 0;
    }

    .p-supervision {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 3pt;
    }

    .guide-name {
      font-size: 14pt;
      font-weight: bold;
      line-height: 1.25;
    }

    .guide-desig {
      font-size: 11.5pt;
      font-weight: bold;
      line-height: 1.25;
      margin-top: 1pt;
    }

    .guide-dept {
      font-size: 11pt;
      font-weight: bold;
      line-height: 1.25;
      margin-top: 1pt;
    }

    /* Section 5: Institute & University */
    .bottom-block {
      margin-top: 4pt;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 4pt 0 3pt 0;
    }

    .logo-gl {
      height: 0.92in;
      width: auto;
      object-fit: contain;
    }

    .logo-aktu {
      height: 0.88in;
      width: auto;
      object-fit: contain;
    }

    .inst-name {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.02em;
      line-height: 1.25;
      margin-top: 2pt;
    }

    .inst-place {
      font-size: 12pt;
      font-weight: bold;
      letter-spacing: 0.04em;
      margin-bottom: 4pt;
    }

    .univ-name {
      font-size: 12pt;
      font-weight: bold;
      letter-spacing: 0.02em;
      line-height: 1.25;
      margin-top: 2pt;
    }

    .univ-place {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.03em;
      line-height: 1.25;
    }

    .sub-date {
      font-size: 12pt;
      font-weight: bold;
      letter-spacing: 0.06em;
      margin-top: 6pt;
    }
  </style>
</head>
<body>

  <div class="border-container">
    <div class="inner-border">

      <!-- Section 1: Title -->
      <div class="title-box">
        <h1 class="project-title">
          CARESYNC: AN AI-ASSISTED CLINICAL TRIAGE, TELEMEDICINE, AND DOCTOR RECOMMENDATION ARCHITECTURE FOR DIGITAL HEALTHCARE
        </h1>
      </div>

      <!-- Section 2: Submission Notice -->
      <div class="degree-notice">
        <div class="p-report">A Project Report</div>
        <div class="p-submitted">Submitted</div>
        <div class="p-partial">In Partial Fulfillment of the Requirements</div>
        <div class="p-degree-of">For the Degree of</div>
        <div class="p-btech">Bachelor of Technology (B.Tech)</div>
        <div class="p-in">in</div>
        <div class="p-branch">Computer Science Engineering (Data Science)</div>
      </div>

      <!-- Section 3: Students -->
      <div class="students-section">
        <div class="p-by">by</div>
        <div class="students-grid">
          <div class="student-col">
            <div class="student-item">
              <div class="student-name">Tushar Jeswani</div>
              <div class="student-roll">Roll No: 2410912540263</div>
            </div>
            <div class="student-item">
              <div class="student-name">Utkarsh Chaubey</div>
              <div class="student-roll">Roll No: 2410912540269</div>
            </div>
          </div>
          <div class="student-col" style="text-align: right;">
            <div class="student-item">
              <div class="student-name">Suryanshu Singh Tomar</div>
              <div class="student-roll">Roll No: 2410912540254</div>
            </div>
            <div class="student-item">
              <div class="student-name">Umair Khan</div>
              <div class="student-roll">Roll No: 2410912540268</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 4: Supervision -->
      <div class="supervision-section">
        <div class="p-supervision">Under the Supervision of</div>
        <div class="guide-name">Ms. Ayasha Malik</div>
        <div class="guide-desig">Assistant Professor</div>
        <div class="guide-dept">Department of Computer Science &amp; Engineering (Data Science)</div>
      </div>

      <!-- Section 5: Institute, University & Logos -->
      <div class="bottom-block">
        <div class="logo-container">
          <img src="${glBajajLogo}" class="logo-gl" alt="G.L. Bajaj Emblem">
        </div>
        <div class="inst-name">G. L. BAJAJ INSTITUTE OF TECHNOLOGY &amp; MANAGEMENT</div>
        <div class="inst-place">GREATER NOIDA</div>

        <div class="logo-container">
          <img src="${aktuLogo}" class="logo-aktu" alt="AKTU Seal">
        </div>
        <div class="univ-name">DR. A. P. J. ABDUL KALAM TECHNICAL UNIVERSITY,</div>
        <div class="univ-place">UTTAR PRADESH, LUCKNOW</div>

        <div class="sub-date">NOVEMBER 2026</div>
      </div>

    </div>
  </div>

</body>
</html>`;

fs.writeFileSync('CareSync_Front_Page.html', htmlContent, 'utf-8');
console.log('CareSync_Front_Page.html created successfully!');
