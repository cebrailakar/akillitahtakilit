const ipcRenderer = require("electron").ipcRenderer;
let currentTahta = [];
let announcements = [];
let backupAnnouncements = JSON.parse(JSON.stringify(announcements));
let isChanged = false;
let autoSlideInterval;
/*
   {
      name: "Kamera 1",
      location: "Ön Kapı",
      imageUrl: "https://via.placeholder.com/500/333333/FFFFFF?text=Kamera+1",
    },
    */
document.addEventListener("DOMContentLoaded", function () {
  ipcRenderer.send("init");
  manageNavbar();
});
function manageNavbar() {
  const navItems = document.querySelectorAll(".nav-item");
  const contentSections = document.querySelectorAll(".content-section");

  function switchTab(sectionId) {
    // Değişiklikler varsa ve duyurular sekmesinden çıkıyorsak uyarı ver
    if (
      hasChanges &&
      document.querySelector(".nav-item.active").dataset.section ===
      "duyurular" &&
      sectionId !== "duyurular"
    ) {
      showConfirmDialog(
        "Kaydedilmemiş Değişiklikler",
        "Kaydedilmemiş değişiklikleriniz var. Devam etmek istiyor musunuz?",
        () => performTabSwitch(sectionId)
      );
      return;
    }

    performTabSwitch(sectionId);
  }

  function performTabSwitch(sectionId) {
    navItems.forEach((item) => {
      item.classList.remove("active");
    });

    contentSections.forEach((section) => {
      section.classList.remove("active");
    });

    // Seçilen sekme ve içerik bölümüne active sınıfını ekle
    document
      .querySelector(`.nav-item[data-section="${sectionId}"]`)
      .classList.add("active");
    document.getElementById(`${sectionId}-section`).classList.add("active");
    t
    if (sectionId === "duyurular") {
      manageAnnouncement();
    } else {
      manageTahta();
    }
  }
}
function manageTahta() {
  const tahtaContainer = document.getElementById("tahta-container");

}
function manageAnnouncement() {

  const addAnnouncementButton = document.getElementById("add-announcement");
  const addAnnouncementPopup = document.getElementById(
    "add-announcement-popup"
  );
  const addAnnouncementForm = document.querySelector(".add-announcement-form");
  const announcementsContainer = document.getElementById(
    "announcements-container"
  );
  const refreshAnnouncementsButton = document.getElementById(
    "refresh-announcements"
  );
  const changesBar = document.getElementById("changes-bar");
  const saveChangesButton = document.getElementById("save-changes");
  const undoChangesButton = document.getElementById("undo-changes");
  manageSlider();
}

function manageSlider() {
  resetAutoSlide();
  const sliderWrapper = document.querySelector(".slider-wrapper");

  sliderWrapper.innerHTML = "";

  slideData.forEach((slide) => {
    const slideElement = document.createElement("div");
    slideElement.classList.add("slide");

    const slideImage = document.createElement("img");
    slideImage.src = slide.imgSrc;
    slideImage.alt = slide.imgAlt;
    slideImage.classList.add("slide-image");

    const slideContent = document.createElement("div");
    slideContent.classList.add("slide-content");

    const slideTitle = document.createElement("h2");
    slideTitle.classList.add("slide-title");
    slideTitle.textContent = slide.title;

    const slideDescription = document.createElement("p");
    slideDescription.classList.add("slide-description");
    slideDescription.textContent = slide.description;

    slideContent.appendChild(slideTitle);
    slideContent.appendChild(slideDescription);

    slideElement.appendChild(slideImage);
    slideElement.appendChild(slideContent);

    sliderWrapper.appendChild(slideElement);
  });

  let dotsContainer = document.querySelector(".dots");
  if (!dotsContainer) {
    dotsContainer = document.createElement("div");
    dotsContainer.classList.add("dots");
    sliderWrapper.parentNode.appendChild(dotsContainer);
  } else {
    dotsContainer.innerHTML = "";
  }

  const slider = sliderWrapper;
  const slides = document.querySelectorAll(".slide");
  let slideIndex = 0;
  let slideWidth = slides[0].clientWidth;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  function updateSlideWidth() {
    slideWidth = slides[0].clientWidth;
    goToSlide(slideIndex);
  }

  window.addEventListener("resize", updateSlideWidth);

  if (slides.length > 1)
    slides.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => {
        slideIndex = i;
        goToSlide(slideIndex);
        resetAutoSlide();
      });
      dotsContainer.appendChild(dot);
    });

  function updateDots() {
    document.querySelectorAll(".dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === slideIndex);
    });
  }

  function goToSlide(index) {
    currentTranslate = -index * slideWidth;
    prevTranslate = currentTranslate;
    slider.style.transform = `translateX(${currentTranslate}px)`;
    updateDots();
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      slideIndex = (slideIndex + 1) % slides.length;
      goToSlide(slideIndex);
    }, 10000);
  }

  function resetAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  slider.addEventListener("mousedown", dragStart);
  slider.addEventListener("touchstart", dragStart);
  slider.addEventListener("mouseup", dragEnd);
  slider.addEventListener("touchend", dragEnd);
  slider.addEventListener("mouseleave", dragEnd);
  slider.addEventListener("mousemove", drag);
  slider.addEventListener("touchmove", drag);

  function dragStart(event) {
    resetAutoSlide();
    startPos = getPositionX(event);
    isDragging = true;
    animationID = requestAnimationFrame(animation);
    slider.style.cursor = "grabbing";
  }

  function drag(event) {
    if (isDragging) {
      const currentPosition = getPositionX(event);
      currentTranslate = prevTranslate + currentPosition - startPos;
    }
  }

  function dragEnd() {
    cancelAnimationFrame(animationID);
    isDragging = false;
    slider.style.cursor = "grab";
    const movedBy = currentTranslate - prevTranslate;
    if (movedBy < -100 && slideIndex < slides.length - 1) {
      slideIndex++;
    } else if (movedBy > 100 && slideIndex > 0) {
      slideIndex--;
    }
    goToSlide(slideIndex);
  }

  function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
  }

  function setSliderPosition() {
    slider.style.transform = `translateX(${currentTranslate}px)`;
  }

  function getPositionX(event) {
    return event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
  }

  updateSlideWidth();
  startAutoSlide();
}

function showSweetAlert(type, title, text) {
  Swal.fire({
    icon: type,
    title: title,
    text: text,
    timer: 3000,
    showConfirmButton: false,
  });
}

function showConfirmDialog(title, text, callback) {
  Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Evet",
    cancelButtonText: "Hayır",
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {


  // DOM elements
  const tahtaContainer = document.getElementById("tahta-container");
  const selectAllButton = document.getElementById("select-all");
  const unselectAllButton = document.getElementById("unselect-all");
  const toggleViewButton = document.getElementById("toggle-view");

  const contentSections = document.querySelectorAll(".content-section");
  const notificationPopup = document.getElementById("notification-popup");
  const notificationForm = document.getElementById("notification-form");
  const popupCloseButtons = document.querySelectorAll(".popup-close");
  const popupActions = document.querySelectorAll(".popup-action");
  const addAnnouncementButton = document.getElementById("add-announcement");
  const addAnnouncementPopup = document.getElementById(
    "add-announcement-popup"
  );
  const addAnnouncementForm = document.querySelector(".add-announcement-form");
  const announcementsContainer = document.getElementById(
    "announcements-container"
  );
  const refreshAnnouncementsButton = document.getElementById(
    "refresh-announcements"
  );
  const changesBar = document.getElementById("changes-bar");
  const saveChangesButton = document.getElementById("save-changes");
  const undoChangesButton = document.getElementById("undo-changes");

  let isGridView = true;

  function showSweetAlert(type, title, text) {
    Swal.fire({
      icon: type,
      title: title,
      text: text,
      timer: 3000,
      showConfirmButton: false,
    });
  }

  function showConfirmDialog(title, text, callback) {
    Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet",
      cancelButtonText: "Hayır",
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  }

  // Sekme değiştirme işlevi
  function switchTab(sectionId) {
    // Değişiklikler varsa ve duyurular sekmesinden çıkıyorsak uyarı ver
    if (
      hasChanges &&
      document.querySelector(".nav-item.active").dataset.section ===
      "duyurular" &&
      sectionId !== "duyurular"
    ) {
      showConfirmDialog(
        "Kaydedilmemiş Değişiklikler",
        "Kaydedilmemiş değişiklikleriniz var. Devam etmek istiyor musunuz?",
        () => performTabSwitch(sectionId)
      );
      return;
    }

    performTabSwitch(sectionId);
  }

  function performTabSwitch(sectionId) {
    navItems.forEach((item) => {
      item.classList.remove("active");
    });

    contentSections.forEach((section) => {
      section.classList.remove("active");
    });

    // Seçilen sekme ve içerik bölümüne active sınıfını ekle
    document
      .querySelector(`.nav-item[data-section="${sectionId}"]`)
      .classList.add("active");
    document.getElementById(`${sectionId}-section`).classList.add("active");

    // Eğer duyurular bölümüne geçildiyse slider'ı başlat
    if (sectionId === "duyurular") {
      handleAnnouncementsSection();
    } else {
      handleTahtaSection();
    }
  }

  function handleAnnouncementsSection() {
    manageSlider();
    renderAnnouncements();
    updateChangesBar();

    // Duyurular bölümüne geçince seçilen kameraları seçimden kaldır
    if (tahtaData.some((t) => t.selected)) {
      tahtaData.forEach((tahta) => {
        tahta.selected = false;
      });
      // Eylem çubuğunu gizle
      actionBar.classList.remove("active");
    }
  }

  function handleTahtaSection() {
    // Tahtalar bölümüne geçildiyse seçim durumunu güncelle
    updateSelectionState();
    // Değişiklikler çubuğunu gizle
    changesBar.classList.remove("active");
  }

  // Kameraları render etme
  function renderTahtaCards() {
    tahtaContainer.innerHTML = "";

    tahtaData.forEach((tahta) => {
      const tahtaCard = document.createElement("div");
      tahtaCard.className = "tahta-card";

      if (tahta.selected) {
        tahtaCard.classList.add("selected-card");
      }

      tahtaCard.dataset.tahtaId = tahta.id;
      const selectedIndicator = tahta.selected
        ? '<div class="selected-indicator"></div>'
        : "";

      tahtaCard.innerHTML = `
        <div class="tahta-feed">
          <img src="${tahta.imageUrl}" alt="${tahta.name}" />
          <span class="tahta-status status-${tahta.status}">${tahta.statusText}</span>
          ${selectedIndicator}
        </div>
        <div class="tahta-info">
          <div>
            <div class="tahta-name">${tahta.name}</div>
            <div class="tahta-location">${tahta.location}</div>
          </div>
          <div class="tahta-actions">
            <button class="action-btn">⚙️</button>
          </div>
        </div>
      `;

      tahtaContainer.appendChild(tahtaCard);

      const feedElement = tahtaCard.querySelector(".tahta-feed");
      feedElement.addEventListener("click", () =>
        toggleCardSelection(tahta.id)
      );
    });

    // Seçim durumunu güncelle
    updateSelectionState();
  }

  // Kart seçimi değiştirme
  function toggleCardSelection(id) {
    const tahta = tahtaData.find((t) => t.id === id);
    tahta.selected = !tahta.selected;
    renderTahtaCards();
  }

  // Seçim durumunu güncelleme
  function updateSelectionState() {
    const selectedTahtas = tahtaData.filter((t) => t.selected);
    const count = selectedTahtas.length;
    selectedCount.textContent = count;

    if (count > 0) {
      actionBar.classList.add("active");
    } else {
      actionBar.classList.remove("active");
    }
  }

  // Değişiklikleri gösterme/gizleme
  function updateChangesBar() {
    if (hasChanges) {
      changesBar.classList.add("active");
    } else {
      changesBar.classList.remove("active");
    }
  }

  // Görünüm değiştirme fonksiyonu
  function toggleView() {
    isGridView = !isGridView;

    if (isGridView) {
      tahtaContainer.className = "tahta-grid";
      toggleViewButton.textContent = "Liste Görünümü";
    } else {
      tahtaContainer.className = "tahta-list";
      toggleViewButton.textContent = "Kart Görünümü";
    }
  }

  // Tümünü seç fonksiyonu
  function selectAll() {
    tahtaData.forEach((tahta) => {
      tahta.selected = true;
    });
    renderTahtaCards();
  }

  // Seçimi kaldır fonksiyonu
  function unselectAll() {
    tahtaData.forEach((tahta) => {
      tahta.selected = false;
    });
    renderTahtaCards();
  }

  // Popup gösterme/gizleme
  function togglePopup(popupElement, show) {
    if (show) {
      popupElement.classList.add("active");
      setTimeout(() => {
        document.addEventListener("click", clickOutsidePopup);
      }, 10);
    } else {
      popupElement.classList.remove("active");
      document.removeEventListener("click", clickOutsidePopup);
    }

    function clickOutsidePopup(e) {
      if (e.target === popupElement) {
        togglePopup(popupElement, false);
      }
    }
  }

  // Eylem çalıştırma
  function executeAction(action) {
    const selectedTahtas = tahtaData.filter((t) => t.selected);
    const tahtaNames = selectedTahtas.map((t) => t.name).join(", ");

    switch (action) {
      case "notify":
        togglePopup(actionPopup, false);
        togglePopup(notificationPopup, true);
        break;
      case "turnoff":
        showSweetAlert("success", "Başarılı", `${tahtaNames} kapatıldı.`);
        break;
      case "screenoff":
        showSweetAlert(
          "success",
          "Başarılı",
          `${tahtaNames} için ekran kapatıldı.`
        );
        break;
      case "open15":
        showSweetAlert(
          "success",
          "Başarılı",
          `${tahtaNames} 15 dakikalığına açıldı.`
        );
        break;
    }

    if (action !== "notify") {
      togglePopup(actionPopup, false);
    }
  }

  // Bildirim gönderme
  function sendNotification(message) {
    const selectedTahtas = tahtaData.filter((t) => t.selected);
    const tahtaNames = selectedTahtas.map((t) => t.name).join(", ");
    showSweetAlert(
      "success",
      "Bildirim Gönderildi",
      `"${message}" mesajı ${tahtaNames} için gönderildi.`
    );
  }

  // ========== DUYURU FONKSİYONLARI ==========

  // Duyuruları Render Et
  function renderAnnouncements() {
    announcementsContainer.innerHTML = "";

    announcementData.forEach((announcement) => {
      const card = document.createElement("div");
      card.className = "announcement-card";
      card.dataset.id = announcement.id;

      card.innerHTML = `
        <div class="delete-button" data-id="${announcement.id}">✕</div>
        <div class="announcement-title">${announcement.title}</div>
        <div class="announcement-date">${announcement.date}</div>
        <div class="announcement-content">${announcement.content}</div>
      `;

      announcementsContainer.appendChild(card);

      // Silme butonu olayı
      const deleteButton = card.querySelector(".delete-button");
      deleteButton.addEventListener("click", function () {
        const id = parseInt(this.dataset.id);
        deleteAnnouncement(id);
      });
    });
  }

  // Duyuru Ekle
  function addAnnouncement(title, content, imageUrl = null) {
    const now = new Date();
    const formattedDate = `${now.getDate()} ${getMonthName(
      now.getMonth()
    )} ${now.getFullYear()}, ${now.getHours()}:${now.getMinutes() < 10 ? "0" : ""
      }${now.getMinutes()}`;

    const newAnnouncement = {
      id: Date.now(),
      title,
      content,
      date: formattedDate,
      image:
        imageUrl ||
        "https://via.placeholder.com/1200/333333/FFFFFF?text=Duyuru",
    };

    announcementData.unshift(newAnnouncement);

    // Slider verilerini güncelle
    slideData.unshift({
      imgSrc: newAnnouncement.image,
      imgAlt: newAnnouncement.title,
      title: newAnnouncement.title,
      description: newAnnouncement.content,
    });

    // Değişiklikleri işaretle
    hasChanges = true;
    updateChangesBar();

    // Arayüzü güncelle
    renderAnnouncements();
    manageSlider();

    return newAnnouncement;
  }

  // Ay adını al
  function getMonthName(monthIndex) {
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];
    return months[monthIndex];
  }

  // Duyuru Sil
  function deleteAnnouncement(id) {
    const index = announcementData.findIndex((a) => a.id === id);

    if (index !== -1) {
      announcementData.splice(index, 1);
      slideData.splice(index, 1);

      // Değişiklikleri işaretle
      hasChanges = true;
      updateChangesBar();

      renderAnnouncements();
      manageSlider();
    }
  }

  // Değişiklikleri Kaydet
  function saveChanges() {
    // Gerçek bir uygulamada burada API çağrısı yapılabilir
    originalAnnouncementData = JSON.parse(JSON.stringify(announcementData));
    hasChanges = false;
    updateChangesBar();
    showSweetAlert(
      "success",
      "Kaydedildi",
      "Değişiklikleriniz başarıyla kaydedildi."
    );
  }

  // Değişiklikleri Geri Al
  function undoChanges() {
    announcementData = JSON.parse(JSON.stringify(originalAnnouncementData));

    // Slider verilerini güncelle
    slideData = [];
    announcementData.forEach((announcement) => {
      slideData.push({
        imgSrc:
          announcement.image ||
          "https://via.placeholder.com/1200/333333/FFFFFF?text=Duyuru",
        imgAlt: announcement.title,
        title: announcement.title,
        description: announcement.content,
      });
    });

    hasChanges = false;
    updateChangesBar();

    renderAnnouncements();
    manageSlider();

    showSweetAlert("success", "Geri Alındı", "Değişiklikleriniz geri alındı.");
  }

  // Duyuruları Yenile
  function refreshAnnouncements() {
    // Burada gerçek uygulamada sunucudan verileri yeniden çekme işlemi yapılabilir
    // Şimdilik animasyon gösterip mevcut verileri yeniden render edelim
    const refreshIcon = document.querySelector(".refresh-icon");
    refreshIcon.style.animationName = "rotate";

    setTimeout(() => {
      renderAnnouncements();
      manageSlider();
      refreshIcon.style.animationName = "";
      showSweetAlert("success", "Yenilendi", "Duyurular başarıyla yenilendi.");
    }, 1000);
  }

  // ========== SLIDER FONKSİYONU ==========

  // Slider yönetimi
  function manageSlider() {
    const sliderWrapper = document.querySelector(".slider-wrapper");
    sliderWrapper.innerHTML = "";

    slideData.forEach((slide) => {
      const slideElement = document.createElement("div");
      slideElement.classList.add("slide");

      const slideImage = document.createElement("img");
      slideImage.src = slide.imgSrc;
      slideImage.alt = slide.imgAlt;
      slideImage.classList.add("slide-image");

      const slideContent = document.createElement("div");
      slideContent.classList.add("slide-content");

      const slideTitle = document.createElement("h2");
      slideTitle.classList.add("slide-title");
      slideTitle.textContent = slide.title;

      const slideDescription = document.createElement("p");
      slideDescription.classList.add("slide-description");
      slideDescription.textContent = slide.description;

      slideContent.appendChild(slideTitle);
      slideContent.appendChild(slideDescription);

      slideElement.appendChild(slideImage);
      slideElement.appendChild(slideContent);

      sliderWrapper.appendChild(slideElement);
    });

    let dotsContainer = document.querySelector(".dots");
    if (!dotsContainer) {
      dotsContainer = document.createElement("div");
      dotsContainer.classList.add("dots");
      sliderWrapper.parentNode.appendChild(dotsContainer);
    } else {
      dotsContainer.innerHTML = "";
    }

    const slider = sliderWrapper;
    const slides = document.querySelectorAll(".slide");
    let slideIndex = 0;
    let slideWidth = slides.length ? slides[0].clientWidth : 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let autoSlideInterval;

    function updateSlideWidth() {
      if (slides.length) {
        slideWidth = slides[0].clientWidth;
        goToSlide(slideIndex);
      }
    }

    window.addEventListener("resize", updateSlideWidth);

    if (slides.length > 1) {
      slides.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (i === 0) dot.classList.add("active");

        dot.addEventListener("click", () => {
          slideIndex = i;
          goToSlide(slideIndex);
          resetAutoSlide();
        });

        dotsContainer.appendChild(dot);
      });
    }

    function updateDots() {
      document.querySelectorAll(".dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === slideIndex);
      });
    }

    function goToSlide(index) {
      if (slides.length) {
        currentTranslate = -index * slideWidth;
        prevTranslate = currentTranslate;
        slider.style.transform = `translateX(${currentTranslate}px)`;
        updateDots();
      }
    }

    function startAutoSlide() {
      if (slides.length > 1) {
        autoSlideInterval = setInterval(() => {
          slideIndex = (slideIndex + 1) % slides.length;
          goToSlide(slideIndex);
        }, 10000);
      }
    }

    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }

    slider.addEventListener("mousedown", dragStart);
    slider.addEventListener("touchstart", dragStart);
    slider.addEventListener("mouseup", dragEnd);
    slider.addEventListener("touchend", dragEnd);
    slider.addEventListener("mouseleave", dragEnd);
    slider.addEventListener("mousemove", drag);
    slider.addEventListener("touchmove", drag);

    function dragStart(event) {
      resetAutoSlide();
      startPos = getPositionX(event);
      isDragging = true;
      animationID = requestAnimationFrame(animation);
      slider.style.cursor = "grabbing";
    }

    function drag(event) {
      if (isDragging) {
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
      }
    }

    function dragEnd() {
      cancelAnimationFrame(animationID);
      isDragging = false;
      slider.style.cursor = "grab";

      const movedBy = currentTranslate - prevTranslate;
      if (movedBy < -100 && slideIndex < slides.length - 1) {
        slideIndex++;
      } else if (movedBy > 100 && slideIndex > 0) {
        slideIndex--;
      }

      goToSlide(slideIndex);
    }

    function animation() {
      setSliderPosition();
      if (isDragging) requestAnimationFrame(animation);
    }

    function setSliderPosition() {
      slider.style.transform = `translateX(${currentTranslate}px)`;
    }

    function getPositionX(event) {
      return event.type.includes("mouse")
        ? event.pageX
        : event.touches[0].clientX;
    }

    updateSlideWidth();
    startAutoSlide();
  }

  // ========== OLAY DİNLEYİCİLERİ ==========

  // Görünüm değiştirme
  toggleViewButton.addEventListener("click", toggleView);

  // Seçim butonları
  selectAllButton.addEventListener("click", selectAll);
  unselectAllButton.addEventListener("click", unselectAll);

  // Sekme değiştirme
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const sectionId = this.dataset.section;
      switchTab(sectionId);
    });
  });

  // Eylem butonları
  showActionsButton.addEventListener("click", function () {
    togglePopup(actionPopup, true);
  });

  // Popup kapatma butonları
  popupCloseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const popup = this.closest(".popup-overlay");
      togglePopup(popup, false);
    });
  });

  // Popup eylem butonları
  popupActions.forEach((action) => {
    action.addEventListener("click", function () {
      const actionType = this.dataset.action;
      executeAction(actionType);
    });
  });

  // Bildirim formu
  notificationForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const message = document.getElementById("notification-message").value;
    if (message) {
      sendNotification(message);
      togglePopup(notificationPopup, false);
      this.reset();
    }
  });

  // Duyuru butonları
  addAnnouncementButton.addEventListener("click", function () {
    togglePopup(addAnnouncementPopup, true);
  });

  // Duyuru ekleme formu
  addAnnouncementForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const title = document.getElementById("announcement-title").value;
    const content = document.getElementById("announcement-content").value;
    const imageUrl =
      document.getElementById("announcement-image").value || null;

    if (title && content) {
      addAnnouncement(title, content, imageUrl);
      togglePopup(addAnnouncementPopup, false);
      this.reset();
    }
  });

  // Duyuru yenileme
  refreshAnnouncementsButton.addEventListener("click", refreshAnnouncements);

  // Değişiklik butonları
  saveChangesButton.addEventListener("click", saveChanges);
  undoChangesButton.addEventListener("click", undoChanges);

  // Başlangıçta kamera kartlarını render et
  renderTahtaCards();

  // İlk sekmeyi aktif et
  switchTab("tahtalar");
});
