# Unified Visitor Form | Role Management | Notification

**Legend:**
- ⭐ → Mandatory
- ✅ → Visible
- ❌ → Hidden
- Optional → Configurable (Admin controlled)
- Auto → Auto-filled / derived

---

## Sheet 1: Visitor Form – Employee / Walk-In

| Field Name | CAT Officials | Vendor | Contractor | Customer | Govt Official | Emp from other Branch | General Visitor | Hospitality | Others | Mandatory Rule |
|---|---|---|---|---|---|---|---|---|---|---|
| Mobile Number | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Always Mandatory |
| Email | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Configurable |
| First Name | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Always Mandatory |
| Last Name | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Always Mandatory |
| Location | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Auto filled based on Front Desk Login - Mandatory |
| Photo Capture (Only for Walk-In) | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Auto fetch photo if the visitor is returning visitor |
| Visitor Type | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Always Mandatory |
| Purpose of Visit | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Configurable - Auto Derived based on Visit Type |
| Whom to Meet | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Always Mandatory |
| Department | Auto | Auto | Auto | Auto | Auto | Auto | Auto | Auto | Auto | Auto-filled based on whom to meet |
| Date & Time | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Always Mandatory |
| Multi-Day Visit | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Date Range to be Selected (From - To) |
| Duration | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional - Drop Down |
| Need Guest WiFi Access? | ⭐ | ⭐ | Optional | Optional | Optional | ⭐ | Optional | ❌ | Optional | Optional - Yes/No |
| Visitor Company | Optional | ⭐ | ⭐ | Optional | Optional | Optional | Optional | ❌ | Optional | Mandatory/Optional based on visitor type |
| Business Segment | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Customer Only - Optional |
| Model | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Auto filtered based on Business Segment - Optional |
| Priority | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Customer Only - based on Business Segment - Optional |
| Remarks | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional |

---

## Sheet 2: Check-In (Approved)

| Field Name | CAT Officials | Vendor | Contractor | Customer | Govt Official | Emp from other Branch | General Visitor | Hospitality | Others | Mandatory Rule |
|---|---|---|---|---|---|---|---|---|---|---|
| Visit ID | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | System Generated - Only for Report purpose. Don't show during Check-In |
| Badge Number | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Front Desk enter the number from issues Physical Badge |
| Mobile Number | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Email | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| First Name | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Last Name | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Location | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Photo Capture | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Capture for Pre-Approved. Auto fetch photo if the visitor is returning visitor |
| Visitor Type | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Read-Only |
| Purpose of Visit | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Read-Only |
| Whom to Meet | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Department | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Date & Time | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only: From Date / To Date |
| Duration | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Optional - Drop Down |
| Visitor Company | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Mandatory/Optional based on visitor type |
| Business Segment | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Customer Only - Optional |
| Model | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Auto filtered based on Business Segment - Optional |
| Priority | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Customer Only - based on Business Segment - Optional |
| Remarks | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Optional |
| Laptop Details | Optional | Optional | Optional | Optional | Optional | Optional | Optional | ❌ | Optional | Based on Visitor Type |
| Mobile/Other Devices | Optional | Optional | Optional | Optional | Optional | Optional | Optional | ❌ | Optional | Optional - Based on Visitor Type |
| Issue Assets to Visitor? | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Yes/No options |
| Asset issued | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | |
| ID Proof Type | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | |
| ID Number | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | |
| ID Photo Capture | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional |
| Vehicle - Yes/No | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional |
| Vehicle Details (Registration No.) | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional |
| Visitor In-Temperature | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional |

---

## Sheet 3: Check-Out Form

| Field Name | CAT Officials | Vendor | Contractor | Customer | Govt Official | Emp from other Branch | General Visitor | Hospitality | Others | Mandatory Rule |
|---|---|---|---|---|---|---|---|---|---|---|
| Badge Number | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Mobile Number | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Email | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| First Name | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Last Name | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Location | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Photo Capture | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Visitor Type | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| Purpose of Visit | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| Whom to Meet | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Department | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Date & Time | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Read-Only |
| Duration | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| Visitor Company | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| Business Segment | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| Model | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| Priority | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| Remarks | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| Laptop Details | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | Read-Only - Only if values are available in the fields |
| Mobile/Other Devices | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | Read-Only - Only if values are available in the fields |
| Issue Assets to Visitor? | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Yes/No options |
| Asset Issued | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| Asset Returned | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | Have to confirm whether all the issued assets are returned. |
| ID Proof Type | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| ID Number | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| ID Photo Capture | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| Vehicle - Yes/No | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| Vehicle Details (Registration No.) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| Visitor In-Temperature | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| Visitor Out-Temperature | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | Optional | |

---

## Sheet 4: Purpose Vs Visitor Type Final

| Purpose \ Visitor Type | CAT Officials | Vendor | Contractor | Customer | Government Official | Emp. from other Branch | General Visitor | Hospitality | Others |
|---|---|---|---|---|---|---|---|---|---|
| Official | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Personal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Training | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Interview | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Delivery | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |

---

## Sheet 5: Role Management

| Features | Employees | Front Desk | Branch Admin | App Admin | Visitor |
|---|---|---|---|---|---|
| Pre-Registered Visitor Request | ✅ | ❌ | ✅ | ✅ | ❌ |
| Create Visit | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve Visit Request | ✅ | ❌ | ✅ | ✅ | ❌ |
| Reject Visit Request | ✅ | ❌ | ✅ | ✅ | ❌ |
| Cancel Visit | ✅ | ✅ | ✅ | ✅ | ❌ |
| Check In | ❌ | ✅ | ❌ | ❌ | ❌ |
| Check Out | ❌ | ✅ | ❌ | ❌ | ❌ |
| Overstay Alert | ✅ | ✅ | ✅ | ❌ | ❌ |
| Feedback | ❌ | ✅ | ❌ | ❌ | ✅ |
| Dashboard | ❌ | ✅ | ✅ | ❌ | ❌ |
| Reports & Analytics | ✅ | ✅ | ✅ | ❌ | ❌ |
| QR Code (Create Visit) | ❌ | ✅ | ❌ | ❌ | ✅ |
| Override (To change waiting for request approval) | ❌ | ✅ | ❌ | ❌ | ❌ |
