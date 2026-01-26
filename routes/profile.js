<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Profile | Online Voting</title>

  <style>
    body {
      margin: 0;
      font-family: "Segoe UI", Arial, sans-serif;
      background: linear-gradient(135deg, #fde2e4, #e0f2fe);
      min-height: 100vh;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 30px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    .app-title {
      font-size: 18px;
      font-weight: 600;
      color: #334155;
    }

    .profile-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #userName {
      font-size: 14px;
      color: #334155;
      font-weight: 500;
    }

    .logout-btn {
      background: #f87171;
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
    }

    .container {
      max-width: 520px;
      margin: 60px auto;
      background: white;
      padding: 35px;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    label {
      font-weight: 500;
      color: #475569;
    }

    input, select, textarea {
      width: 100%;
      padding: 10px 12px;
      margin-top: 6px;
      margin-bottom: 16px;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      font-size: 14px;
    }

    button.primary {
      width: 100%;
      background: linear-gradient(135deg, #a5b4fc, #93c5fd);
      border: none;
      color: #1e293b;
      padding: 12px;
      border-radius: 999px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>

<body>

<!-- TOP BAR -->
<div class="top-bar">
  <span class="app-title">🗳 Online Voting</span>
  <div class="profile-area">
    <span id="userName">Loading...</span>
    <button class="logout-btn" onclick="logout()">Logout</button>
  </div>
</div>

<!-- PROFILE FORM -->
<div class="container">
  <h2>Complete Your Profile</h2>
  <p>All fields marked * are mandatory.</p>

  <!-- 🔥 NATIVE FORM SUBMIT (NO FETCH) -->
  <form action="/profile" method="POST">
    <label>Name *</label>
    <input type="text" name="name" required />

    <label>Age *</label>
    <input type="number" name="age" min="18" required />

    <label>Gender *</label>
    <select name="gender" required>
      <option value="">Select</option>
      <option>Female</option>
      <option>Male</option>
      <option>Other</option>
    </select>

    <label>LinkedIn URL *</label>
    <input type="url" name="linkedinUrl" required />

    <label>Description (optional)</label>
    <textarea name="bio"></textarea>

    <button type="submit" class="primary">Save & Continue</button>
  </form>
</div>

<script>
/* =========================
   AUTH CHECK + USER NAME
========================= */
fetch("/whoami", { credentials: "include" })
  .then(res => res.json())
  .then(data => {
    if (!data.loggedIn) {
      window.location.href = "/index.html";
      return;
    }
    document.getElementById("userName").innerText =
      data.user.name || data.user.email;
  });

function logout() {
  fetch("/auth/logout", { credentials: "include" })
    .then(() => window.location.href = "/index.html");
}
</script>

</body>
</html>
