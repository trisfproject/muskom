(async () => {
  try {
    const loginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'ChangeMe123!' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.access_token;

    // Get active event ID
    const getRes = await fetch('http://localhost:8080/api/v1/admin/musyawarah', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getResJson = await getRes.json();
    const activeEventId = getResJson.data[0].id;

    // Get Timeline
    const timelineRes = await fetch('http://localhost:8080/api/v1/admin/musyawarah/timeline', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Event-ID': activeEventId
      }
    });
    console.log("GET /admin/musyawarah/timeline:", await timelineRes.json());
  } catch (err) {
    console.log("ERROR:", err.message);
  }
})();
