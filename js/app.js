document.addEventListener('DOMContentLoaded', function () {

  window.setRelay = async function (device, value) {
    const serialNumber = 'ESP32-001';
    const API_BASE_URL = 'http://localhost:7001';
  
    // Buat objek payload awal dengan nilai default (relay tetap)
    let body = { relay1: null, relay2: null };
  
    // Tetapkan relay yang dikontrol
    if (device === 'pompa') {
      body.relay1 = value;
    } else if (device === 'lampu') {
      body.relay2 = value;
    }
  
    // Hapus properti yang tidak diubah agar payload bersih
    if (body.relay1 === null) delete body.relay1;
    if (body.relay2 === null) delete body.relay2;
  
    try {
      const res = await fetch(`${API_BASE_URL}/api/relay/${serialNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
  
      const text = await res.text();
      if (res.ok) {
        console.log(`Berhasil atur ${device} ke ${value}`);
        if (device === 'pompa') {
          document.getElementById('pumpStatusIcon').src = value ? 'img/pump-on.png' : 'img/pump-off.png';
        } else {
          document.getElementById('lampStatusIcon').src = value ? 'img/lamp-on.png' : 'img/lamp-off.png';
        }
      } else {
        console.error('Gagal:', text);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };
  
  


  // === Carousel Logic ===
  let slideIndex = 0;
  const slides = document.querySelector('.slides');
  const dots = document.querySelectorAll('.dot');
  const totalSlides = slides ? slides.children.length : 0;

  function showSlide(index) {
    if (!slides) return;
    if (index >= totalSlides) slideIndex = 0;
    else if (index < 0) slideIndex = totalSlides - 1;
    else slideIndex = index;

    slides.style.transform = 'translateX(' + (-slideIndex * 100) + '%)';
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[slideIndex]) dots[slideIndex].classList.add('active');
  }

  function moveSlide(step) {
    showSlide(slideIndex + step);
  }

  function currentSlide(index) {
    showSlide(index);
  }

  function autoSlide() {
    moveSlide(1);
  }

  if (slides) setInterval(autoSlide, 5000);
  showSlide(slideIndex);
  window.moveSlide = moveSlide;
  window.currentSlide = currentSlide;

  // === Modal Logic ===
  window.openModal = function () {
    const modal = document.getElementById('manualModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeModal = function () {
    const modal = document.getElementById('manualModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.openHarvestModal = function (day) {
    const modal = document.getElementById('harvestModal');
    const dayTitle = document.getElementById('harvestDay');
    if (modal && dayTitle) {
      dayTitle.textContent = `Keterangan Jumlah Sayur - ${day}`;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeHarvestModal = function () {
    const modal = document.getElementById('harvestModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.submitHarvest = function () {
    const input = document.getElementById('jumlahSayur');
    if (input) {
      const value = input.value;
      if (value && !isNaN(value) && Number(value) >= 0) {
        alert(`Jumlah sayur berhasil disimpan: ${value}`);
        input.value = '';
        window.closeHarvestModal();
      } else {
        alert('Masukkan jumlah sayur yang valid.');
      }
    }
  };

  // === Live Data + Relay Logic ===
  const serialNumber = 'ESP32-001'; // fallback
  const API_BASE_URL = 'http://localhost:7001';

  async function fetchLatestData() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/data/${serialNumber}`);
      if (!res.ok) throw new Error('Data tidak ditemukan');
      const data = await res.json();

      document.getElementById('suhuAir').textContent = data.suhuAir ?? '-';
      document.getElementById('suhuUdara').textContent = data.suhuUdara ?? '-';
      document.getElementById('nutrisi').textContent = data.nutrisi ?? '-';
      document.getElementById('tinggi').textContent = data.tinggi ?? '-';
      document.getElementById('pH').textContent = data.pH ?? '-';
      document.getElementById('uV').textContent = data.uV ?? '-';
    } catch (err) {
      console.error('Gagal ambil data:', err);
      document.querySelectorAll('.value').forEach(el => el.textContent = '-');
    }
  }
  // Inisialisasi
  fetchLatestData();

  setInterval(fetchLatestData, 1000);
});
