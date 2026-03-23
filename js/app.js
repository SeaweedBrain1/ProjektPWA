document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('photo-canvas');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const locationSection = document.getElementById('location-section');
    const coordsText = document.getElementById('coords-text');
    const shareBtn = document.getElementById('share-btn');
    let currentStream;
    let photoBlob;
    let map;
    let marker;
    let currentLat, currentLng;
 
    async function initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            currentStream = stream;
            video.srcObject = stream;
        } catch (err) {
            console.error(err);
            alert('Nie można uzyskać dostępu do kamery. Sprawdź uprawnienia.');
        }
    }
 
    captureBtn.addEventListener('click', () => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            photoBlob = blob;
        }, 'image/jpeg');
 
        video.classList.add('d-none');
        canvas.classList.remove('d-none');
        captureBtn.classList.add('d-none');
        retakeBtn.classList.remove('d-none');
        locationSection.classList.remove('d-none');
 
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
 
        getLocation(); 
    });
 
    retakeBtn.addEventListener('click', () => {
        video.classList.remove('d-none');
        canvas.classList.add('d-none');
        captureBtn.classList.remove('d-none');
        retakeBtn.classList.add('d-none');
        locationSection.classList.add('d-none');
        initCamera(); 
    });
 
    function getLocation() {
        if (navigator.geolocation) {
            coordsText.textContent = "Pobieranie dokładnej lokalizacji...";
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLat = position.coords.latitude;
                    currentLng = position.coords.longitude;
                    coordsText.textContent = `Współrzędne: ${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`;
                    showMap(currentLat, currentLng);
                },
                (error) => {
                    coordsText.textContent = "Nie udało się pobrać lokalizacji GPS.";
                    console.error(error);
                },
                { enableHighAccuracy: true }
            );
        } else {
            coordsText.textContent = "Twoja przeglądarka nie wspiera geolokalizacji.";
        }
    }
 
    function showMap(lat, lng) {
        if (map) {
            map.setView([lat, lng], 16);
            marker.setLatLng([lat, lng]);
            return;
        }
 
        map = L.map('map').setView([lat, lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
 
        marker = L.marker([lat, lng]).addTo(map)
            .bindPopup('Miejsce zdarzenia')
            .openPopup();
    }
 
    initCamera();
});