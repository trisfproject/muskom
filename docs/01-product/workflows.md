# Product Business Workflows

## 1. Musyawarah Event Lifecycle Workflow
`DRAFT` -> `Configure Settings & Dates` -> `PUBLISHED` -> `Registration Open` -> `Candidate Nomination` -> `Campaign` -> `Convention & Attendance` -> `Voting Session` -> `Result Tally` -> `ARCHIVED`.

## 2. Delegate Lifecycle Workflow
`Public Visitor` -> `Submit Registration Form` -> `Status: Pending` -> `Committee Verification` -> `Status: Verified (QR Code issued)` -> `Arrive & Scan Attendance` -> `Quorum Check` -> `Cast Secret Vote` -> `View Published Results`.

## 3. Candidate Lifecycle Workflow
`Nomination / Form Submission` -> `Document Upload (PDF)` -> `Committee Verification` -> `Publication Status: Published` -> `Public Showcase (/kandidat)` -> `Ballot Option in Voting Room`.

## 4. E-Voting & Quorum Workflow
`Admin Opens Voting Session` -> `System Publishes EventBus Event` -> `Checked-In Delegate Enters /voting` -> `Cast Vote` -> `Single Vote Record Inserted` -> `Real-Time Live Results Calculated` -> `Admin Closes Session`.
