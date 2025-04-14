import "./index.css";
import Swal, { SweetAlertIcon } from "sweetalert2";
import $ from "jquery";
declare global {
  interface Window {
    electronAPI: {
      sendMessage: (channel: string, data: any) => void;
      on: (channel: string, callback: Function) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      send: (channel: string, ...args: any[]) => void;
    };
  }
}
type NotificationOptions = {
  type: "warn" | "info";
  title: string;
  body: string;
};
type QRcodeData = {
  url: string;
  changeTime: number;
};
type slideData = {
  imageURL: string;
  title: string;
  description: string;
};
const ipcRenderer = window.electronAPI;

let slideData: slideData[] = [
  {
    imageURL: "",
    title: "Veri yok",
    description: "Duyurular sekmesinden ekleyebilirsiniz",
  },
];
ipcRenderer.on("class_number", (data: string) => {
  $("#current-class").text(`Sınıf: ${data}`);
});
ipcRenderer.on("school_name", (data: string) => {
  $("#current-school").text(`${data}`);
});
const Toast = Swal.mixin({
  toast: true,
  position: "top-right",
  iconColor: "white",
  customClass: {
    popup: "colored-toast",
  },
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

let notificationQueue: NotificationOptions[] = [];
let isShowingNotification = false;

const showNextNotification = () => {
  if (notificationQueue.length === 0) {
    isShowingNotification = false;
    return;
  }

  isShowingNotification = true;
  const notification = notificationQueue.shift()!;

  Toast.fire({
    icon: notification.type as SweetAlertIcon,
    title: notification.title,
    text: notification.body,
  }).then(() => {
    setTimeout(() => showNextNotification(), 300);
  });
};

ipcRenderer.on("on_notif", (data: NotificationOptions) => {
  notificationQueue.push(data);

  if (!isShowingNotification) {
    showNextNotification();
  }
});

let qrData = "";
let qrUpdate = 0;
let pinCode = "";
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("init");
  setInterval(() => {
    tick();
  }, 1000);

  managePopup();
  manageSlider();

  const close_app = document.getElementById("close-app");
  close_app.addEventListener("click", () => {
    ipcRenderer.send("close-app");
  });
});

ipcRenderer.on("announcements", (data: slideData[]) => {
  if (data.length) slideData = data;
  manageSlider();
});

ipcRenderer.on("wrongPasscode", async () => {
  $("#pin-input").text("");
  pinCode = "";
  const popup = document.getElementById("popup");
  popup.style.display = "none";
  notificationQueue.push({
    body: "Yanlış şifre",
    title: "Hata",
    type: "error" as any,
  });

  if (!isShowingNotification) {
    showNextNotification();
  }
});
function tick() {
  updateTime();
  updateQR();
}
ipcRenderer.on("qr_code", (data: QRcodeData) => {
  console.log(data);
  qrData = data.url;
  qrUpdate = data.changeTime / 1000;
});
function updateQR() {
  const qr_code = document.getElementById("qr-code") as HTMLImageElement;
  qr_code.src = qrData;
  if (qrUpdate > 0) {
    $("#qr-text").text(qrUpdate);
    qrUpdate--;
  } else {
    qrUpdate = 0;
    $("#qr-text").text("");
  }
}
function updateTime() {
  const now = new Date();
  $("#current-time").text(now.toLocaleTimeString("tr-TR"));

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  $("#current-date").text(now.toLocaleDateString("tr-TR", options));
}

let autoSlideInterval: string | number | NodeJS.Timeout;
function manageSlider() {
  const sliderWrapper = document.querySelector(".slider-wrapper");

  sliderWrapper.innerHTML = "";

  slideData.forEach((slide) => {
    const slideElement = document.createElement("div");
    slideElement.classList.add("slide");

    const slideImage = document.createElement("img");
    slideImage.src = slide.imageURL;
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

  function goToSlide(index: number) {
    currentTranslate = -index * slideWidth;
    prevTranslate = currentTranslate;
    (
      slider as HTMLElement
    ).style.transform = `translateX(${currentTranslate}px)`;
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

  function dragStart(event: any) {
    resetAutoSlide();
    startPos = getPositionX(event);
    isDragging = true;
    animationID = requestAnimationFrame(animation);
    (slider as HTMLElement).style.cursor = "grabbing";
  }

  function drag(event: any) {
    if (isDragging) {
      const currentPosition = getPositionX(event);
      currentTranslate = prevTranslate + currentPosition - startPos;
    }
  }

  function dragEnd() {
    cancelAnimationFrame(animationID);
    isDragging = false;
    (slider as HTMLElement).style.cursor = "grab";
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
    (
      slider as HTMLElement
    ).style.transform = `translateX(${currentTranslate}px)`;
  }

  function getPositionX(event: any) {
    return event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
  }

  updateSlideWidth();
  resetAutoSlide();
}
function managePopup() {
  const popup = document.getElementById("popup");
  const openPopupButton = document.getElementById("open-popup");
  const closePopupButton = document.getElementById("close-popup");

  openPopupButton.addEventListener("click", () => {
    popup.style.display = "flex";
  });

  closePopupButton.addEventListener("click", () => {
    popup.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  });

  function addPinDigit(digit: number) {
    if (digit == -1)
      return ((
        document.getElementById("pin-input") as HTMLTextAreaElement
      ).value = pinCode =
        "");
    if (digit == -2)
      return ((
        document.getElementById("pin-input") as HTMLTextAreaElement
      ).value = pinCode =
        pinCode.slice(0, -1));
    if (pinCode.length < 6) {
      pinCode += digit;

      if (pinCode.length >= 6) ipcRenderer.send("pin", pinCode);
      (document.getElementById("pin-input") as HTMLTextAreaElement).value =
        pinCode;
    } else {
      ipcRenderer.send("pin", pinCode);
    }
  }
  for (let i = 0; i <= 9; i++) {
    document
      .getElementById(`pin-${i}`)
      .addEventListener("click", () => addPinDigit(i));
  }

  document
    .getElementById("pin-clear")
    .addEventListener("click", () => addPinDigit(-1));
  document
    .getElementById("pin-delete")
    .addEventListener("click", () => addPinDigit(-2));
}
