const ipcRenderer = require("electron").ipcRenderer;
let slideData = [
    {
        imgSrc: "",
        imgAlt: "Boş veri",
        title: "Boş veri",
        description: "Boş veri"
    }
];
document.addEventListener("DOMContentLoaded", function () {
    ipcRenderer.send("init")
    updateTime();
    setInterval(updateTime, 1000);
    managePopup();
    manageSlider();
    const close_app = document.getElementById("close-app");
    close_app.addEventListener("click", () => {
        ipcRenderer.send("close-app");
    })
    const qr_code = document.getElementById("qr-code");
});
function manageSlider() {


    const sliderWrapper = document.querySelector(".slider-wrapper");

    sliderWrapper.innerHTML = '';

    slideData.forEach(slide => {
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
        dotsContainer.innerHTML = '';
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
    let autoSlideInterval;

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

    let pinCode = "";

    function addPinDigit(digit) {
        if (digit == -1)
            return (document.getElementById("pin-input").value = pinCode = "");
        if (digit == -2)
            return (document.getElementById("pin-input").value = pinCode =
                pinCode.slice(0, -1));
        if (pinCode.length < 6) {
            pinCode += digit;
            document.getElementById("pin-input").value = pinCode;
        } else {

        }
    }
    for (let i = 0; i <= 9; i++) {
        document.getElementById(`pin-${i}`).addEventListener("click", () => addPinDigit(i));
    }

    document.getElementById("pin-clear").addEventListener("click", () => addPinDigit(-1));
    document.getElementById("pin-delete").addEventListener("click", () => addPinDigit(-2));
}
function updateTime() {
    const now = new Date();

    const timeElement = document.getElementById("current-time");
    timeElement.textContent = now.toLocaleTimeString("tr-TR");

    const dateElement = document.getElementById("current-date");
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    dateElement.textContent = now.toLocaleDateString("tr-TR", options);
}
