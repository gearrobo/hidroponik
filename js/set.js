document.addEventListener('DOMContentLoaded', function () {

  const serialNumber = 'ESP32-001'; // Sesuaikan
  const API_BASE_URL = 'http://localhost:7001';

  const serialInput = document.getElementById('serialInput');
  const loadBtn = document.getElementById('loadBtn');
  const alertTable = document.getElementById('alertTable');
  const alertBody = document.getElementById('alertBody');

  let currentSerial = serialInput.value.trim();

  async function fetchAndDisplayAlerts(serial) {
    if (!serial) {
      alertTable.style.display = 'none';
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/${serialNumber}`);
      const data = await response.json();

      alertBody.innerHTML = '';

      if (Array.isArray(data) && data.length > 0) {
        data.forEach(alert => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${alert.parameter}</td>
            <td>${alert.value}</td>
            <td>${alert.threshold_min}</td>
            <td>${alert.threshold_max}</td>
            <td>${new Date(alert.created_at).toLocaleString()}</td>
          `;
          alertBody.appendChild(row);
        });
        alertTable.style.display = 'table';
      } else {
        alertTable.style.display = 'none';
      }
    } catch (error) {
      console.error('Gagal memuat data alert:', error);
    }
  }

  // Load pertama kali
  fetchAndDisplayAlerts(currentSerial);

  // Update serial jika user klik tombol
  loadBtn.addEventListener('click', () => {
    const newSerial = serialInput.value.trim();
    if (newSerial) {
      currentSerial = newSerial;
      fetchAndDisplayAlerts(currentSerial);
    } else {
      alert('Masukkan serial number terlebih dahulu');
    }
  });

  // Refresh otomatis setiap 5 detik
  setInterval(() => {
    fetchAndDisplayAlerts(currentSerial);
  }, 5000);
  
    window.submitThreshold = async function () {
      const serialNumber = 'ESP32-001'; // Sesuaikan
      const API_BASE_URL = 'http://localhost:7001';
  
      const payload = {
        threshold_min_ph: parseFloat(document.getElementById('thresholdMinPh').value),
        threshold_max_ph: parseFloat(document.getElementById('thresholdMaxPh').value),
        threshold_min_tinggi: parseFloat(document.getElementById('thresholdMinTinggi').value),
        threshold_max_tinggi: parseFloat(document.getElementById('thresholdMaxTinggi').value)
      };
  
      if (
        isNaN(payload.threshold_min_ph) || isNaN(payload.threshold_max_ph) ||
        isNaN(payload.threshold_min_tinggi) || isNaN(payload.threshold_max_tinggi)
      ) {
        alert('Isi semua nilai threshold dengan benar.');
        return;
      }
  
      try {
        const res = await fetch(`${API_BASE_URL}/api/threshold/${serialNumber}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
  
        if (res.ok) {
          alert('Threshold berhasil disimpan!');
        } else {
          alert('Gagal menyimpan threshold.');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Terjadi kesalahan saat menyimpan.');
      }
    };
  });
  