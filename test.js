// console.log('Node is working!');

// //tests

// Yes! Based on everything you've implemented so far, here’s a list of *PowerShell (or Postman/cURL equivalent)* tests you can run to validate each API route and interaction module in your human-agent interaction prototype.

// ---

// ### ✅ 1. *Login (Simulated)*

// powershell
// $body = '{"email": "example@gmail.com"}'
// $response = Invoke-RestMethod -Uri http://localhost:3001/auth/login -Method POST -Body $body -ContentType "application/json"
// $response


// ---

// ### ✅ 2. **Session Check (/auth/me)**

// powershell
// Invoke-RestMethod -Uri http://localhost:3001/auth/me -Method GET


// ---

// ### ✅ 3. *Proof of Humanity Check*

// powershell
// $body = '{"userId": "user-abc123"}'
// Invoke-RestMethod -Uri http://localhost:3001/poh/check -Method POST -Body $body -ContentType "application/json"


// ---

// ### ✅ 4. *List Available Communities*

// powershell
// Invoke-RestMethod -Uri http://localhost:3001/communities -Method GET


// ---

// ### ✅ 5. *Select a Community*

// powershell
// $body = '{"userId": "user-abc123", "communityId": "comm-002"}'
// Invoke-RestMethod -Uri http://localhost:3001/communities/select -Method POST -Body $body -ContentType "application/json"


// ---

// ### ✅ 6. *Get Active Avatars in Community*

// powershell
// Invoke-RestMethod -Uri "http://localhost:3001/avatars/active?communityId=comm-002" -Method GET


// ---

// ### ✅ 7. *Send Chat Message*

// powershell
// $body = '{"userId": "user-abc123", "communityId": "comm-002", "content": "Hello world!"}'
// Invoke-RestMethod -Uri http://localhost:3001/chat/message -Method POST -Body $body -ContentType "application/json"


// ---

// ### ✅ 8. *Fetch Chat History*

// powershell
// Invoke-RestMethod -Uri "http://localhost:3001/chat/history?communityId=comm-002" -Method GET


// ---

// ### ✅ 9. *Log Interaction*

// powershell
// $body = '{"userId": "user-abc123", "action": "send_message", "result": "Message accepted"}'
// Invoke-RestMethod -Uri http://localhost:3001/interaction/log -Method POST -Body $body -ContentType "application/json"


// ---

// ### ✅ 10. *Evaluate Policy*

// powershell
// $body = @{
//   userId = "user-abc123"
//   communityId = "comm-002"
//   actionType = "send_message"
//   payload = @{ content = "Hello!" }
// } | ConvertTo-Json -Depth 3

// Invoke-RestMethod -Uri http://localhost:3001/policy/enforce -Method POST -Body $body -ContentType "application/json"


// ---

// Let me know if you'd like *automated test scripts, **Postman collection files*, or tests for the upcoming DB-connected or agent-based modules.
