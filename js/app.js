// document.addEventListener('DOMContentLoaded', function() {
//     let slideIndex = 0;
//     const slides = document.querySelector('.slides');
//     const dots = document.querySelectorAll('.dot');
//     const totalSlides = slides.children.length;
  
//     function showSlide(index) {
//       if (index >= totalSlides) slideIndex = 0;
//       else if (index < 0) slideIndex = totalSlides - 1;
//       else slideIndex = index;
      
//       slides.style.transform = 'translateX(' + (-slideIndex * 100) + '%)';
      
//       dots.forEach(dot => dot.classList.remove('active'));
//       dots[slideIndex].classList.add('active');
//     }
  
//     function moveSlide(step) {
//       showSlide(slideIndex + step);
//     }
  
//     function currentSlide(index) {
//       showSlide(index);
//     }
  
//     function autoSlide() {
//       moveSlide(1);
//     }
  
//     // Auto slide every 5 seconds
//     setInterval(autoSlide, 5000);
  
//     // Initialize first slide
//     showSlide(slideIndex);
  
//     // Make functions available globally for onclick handlers
//     window.moveSlide = moveSlide;
//     window.currentSlide = currentSlide;
  
//     // Modal open/close functions
//     window.openModal = function() {
//       const modal = document.getElementById('manualModal');
//       if (modal) {
//         modal.classList.remove('hidden');
//         modal.classList.add('flex');
//       }
//     };
  
//     window.closeModal = function() {
//       const modal = document.getElementById('manualModal');
//       if (modal) {
//         modal.classList.add('hidden');
//         modal.classList.remove('flex');
//       }
//     };
  
//     // Harvest modal functions
//     window.openHarvestModal = function(day) {
//       const modal = document.getElementById('harvestModal');
//       const dayTitle = document.getElementById('harvestDay');
//       if (modal && dayTitle) {
//         dayTitle.textContent = `Keterangan Jumlah Sayur - ${day}`;
//         modal.classList.remove('hidden');
//         modal.classList.add('flex');
//       }
//     };
  
//     window.closeHarvestModal = function() {
//       const modal = document.getElementById('harvestModal');
//       if (modal) {
//         modal.classList.add('hidden');
//         modal.classList.remove('flex');
//       }
//     };
  
//     window.submitHarvest = function() {
//       const input = document.getElementById('jumlahSayur');
//       if (input) {
//         const value = input.value;
//         if (value && !isNaN(value) && Number(value) >= 0) {
//           alert(`Jumlah sayur berhasil disimpan: ${value}`);
//           input.value = '';
//           window.closeHarvestModal();
//         } else {
//           alert('Masukkan jumlah sayur yang valid.');
//         }
//       }
//     };
//   });
  
//   // Function to update sensor values
// function updateSensorValues(data) {
//   // Update temperature
//   document.querySelector('.temperature-value').textContent = `${data.suhu}°C`;
  
//   // Update nutrition
//   document.querySelector('.nutrition-value').textContent = `${data.nutrisi} ppm`;
  
//   // Update height
//   document.querySelector('.height-value').textContent = `${data.tinggi} cm`;
  
//   // Update pH
//   document.querySelector('.ph-value').textContent = data.pH;
  
//   // Update UV status
//   document.querySelector('.uv-value').textContent = data.uV;
// }

// // Function to fetch latest sensor data
// async function fetchSensorData() {
//   try {
//       const serialNumber = 'soendevmonsisversi1.0xx01depok'; // Serial number from Arduino code
//       const response = await fetch(`http://localhost:7001/api/data/${serialNumber}`);
//       if (!response.ok) {
//           throw new Error('Network response was not ok');
//       }
//       const data = await response.json();
//       updateSensorValues(data);
//   } catch (error) {
//       console.error('Error fetching sensor data:', error);
//   }
// }

// // Update sensor values every 10 seconds
// setInterval(fetchSensorData, 10000);

// // Initial fetch
// fetchSensorData();

// // Carousel functionality
// let currentSlide = 0;
// const slides = document.querySelectorAll('.slides img');
// const dots = document.querySelectorAll('.dot');

// function showSlide(n) {
//   // Hide all slides
//   slides.forEach(slide => slide.style.display = 'none');
//   dots.forEach(dot => dot.classList.remove('active'));
  
//   // Show current slide
//   slides[n].style.display = 'block';
//   dots[n].classList.add('active');
// }

// function moveSlide(n) {
//   currentSlide = (currentSlide + n + slides.length) % slides.length;
//   showSlide(currentSlide);
// }

// function currentSlide(n) {
//   showSlide(n);
//   currentSlide = n;
// }

// // Initialize carousel
// showSlide(0);

// // Modal functionality
// function openModal() {
//   document.getElementById('manualModal').style.display = 'flex';
// }

// function closeModal() {
//   document.getElementById('manualModal').style.display = 'none';
// }

// // Harvest modal functionality
// function openHarvestModal(day) {
//   document.getElementById('harvestDay').textContent = `Keterangan Jumlah Sayur - ${day}`;
//   document.getElementById('harvestModal').style.display = 'flex';
// }

// function closeHarvestModal() {
//   document.getElementById('harvestModal').style.display = 'none';
// }

// function submitHarvest() {
//   const amount = document.getElementById('jumlahSayur').value;
//   // Here you could add code to send the harvest data to a server
//   closeHarvestModal();
// }




document.addEventListener('DOMContentLoaded', function() {
  let slideIndex = 0;
  const slides = document.querySelector('.slides');
  const dots = document.querySelectorAll('.dot');
  const totalSlides = slides.children.length;

  function showSlide(index) {
    if (index >= totalSlides) slideIndex = 0;
    else if (index < 0) slideIndex = totalSlides - 1;
    else slideIndex = index;
    
    slides.style.transform = 'translateX(' + (-slideIndex * 100) + '%)';
    
    dots.forEach(dot => dot.classList.remove('active'));
    dots[slideIndex].classList.add('active');
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

  // Auto slide every 5 seconds
  setInterval(autoSlide, 5000);

  // Initialize first slide
  showSlide(slideIndex);

  // Make functions available globally for onclick handlers
  window.moveSlide = moveSlide;
  window.currentSlide = currentSlide;

  // Modal open/close functions
  window.openModal = function() {
    const modal = document.getElementById('manualModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeModal = function() {
    const modal = document.getElementById('manualModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // Harvest modal functions
  window.openHarvestModal = function(day) {
    const modal = document.getElementById('harvestModal');
    const dayTitle = document.getElementById('harvestDay');
    if (modal && dayTitle) {
      dayTitle.textContent = `Keterangan Jumlah Sayur - ${day}`;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeHarvestModal = function() {
    const modal = document.getElementById('harvestModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.submitHarvest = function() {
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
});
