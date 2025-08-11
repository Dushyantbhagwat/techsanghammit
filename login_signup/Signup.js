/*=============== SHOW HIDDEN - PASSWORD ===============*/
const showHiddenPass = (inputId, iconId) => {
    const input = document.getElementById(inputId),
          iconEye = document.getElementById(iconId);

    iconEye.addEventListener('click', () => {
        // Change password to text
        if(input.type === 'password'){
            // Switch to text
            input.type = 'text';

            // Icon change
            iconEye.classList.add('ri-eye-line');
            iconEye.classList.remove('ri-eye-off-line');
        } else {
            // Change to password
            input.type = 'password';

            // Icon change
            iconEye.classList.remove('ri-eye-line');
            iconEye.classList.add('ri-eye-off-line');
        }
    });
};

// Apply to all password fields (Signup & Confirm Password)
showHiddenPass('signup-pass', 'signup-eye');
showHiddenPass('signup-confirm-pass', 'signup-confirm-eye');

/*=============== DOMContentLoaded Events ===============*/
document.addEventListener("DOMContentLoaded", () => {
    // Tagline animation
    const tagline = document.querySelector(".login__tagline");
    setTimeout(() => {
        tagline.style.animation = "fadeInZoom 1.5s ease-in-out forwards";
    }, 500); // Slight delay for smooth appearance

    // Form Validation
    document.querySelector(".login__form").addEventListener("submit", (e) => {
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-pass").value.trim();
        const confirmPassword = document.getElementById("signup-confirm-pass").value.trim();
        const mobile = document.getElementById("signup-mobile").value.trim();

        if (!email || !password || !confirmPassword || !mobile) {
            alert("Please fill in all fields.");
            e.preventDefault();
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            e.preventDefault();
            return;
        }
    });

    // Dynamic Hover Tilt Effect
    const form = document.querySelector(".login__form");
    form.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = form.getBoundingClientRect();
        const x = ((e.clientX - left) / width - 0.5) * 20; // Scale for tilt
        const y = ((e.clientY - top) / height - 0.5) * 20;

        form.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
        form.style.borderImage = `linear-gradient(${x * 5}deg, var(--neon-blue), var(--neon-purple)) 1`;
    });

    form.addEventListener("mouseleave", () => {
        form.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
    });

    // Carousel - Infinite loop effect
    const carousel = document.querySelector(".carousel-wrapper");
    const boxes = [...carousel.children];
    boxes.forEach(box => {
        const clone = box.cloneNode(true);
        carousel.appendChild(clone);
    });

    // Glowing effect on tagline
    setInterval(() => {
        tagline.classList.toggle("glow-effect"); // Toggles glowing effect
    }, 2000);
});

/*=============== OTP Verification ===============*/
// Simulate OTP Generation and Verification
document.getElementById("signup-btn").addEventListener("click", (e) => {
    e.preventDefault(); // Prevent form submission
    const email = document.getElementById("signup-email").value;
    const mobile = document.getElementById("signup-mobile").value;

    if (!email || !mobile) {
        alert("Please provide email and mobile number.");
        return;
    }

    alert('OTP sent to your mobile number.');
    document.getElementById('otp-container').style.display = 'block'; // Show OTP section
    sendOTP(mobile); // Call function to send OTP
});

// Function to simulate sending OTP (replace with actual backend logic)
function sendOTP(mobile) {
    console.log('OTP sent to mobile:', mobile);
}

// OTP Verification Button
document.getElementById("verify-otp").addEventListener("click", () => {
    const enteredOTP = document.getElementById("otp").value;

    if (enteredOTP === '123456') { // Dummy OTP for simulation
        alert('OTP Verified Successfully!');
        // Proceed to save user registration (this is where you would send data to backend)
    } else {
        alert('Invalid OTP');
    }
});



// Redirect to Register Page
document.getElementById("register-btn").addEventListener("click", () => {
    window.location.href = "register.html"; // Redirect to the Register page (already on this page)
});

document.getElementById("login-btn").addEventListener("click", () => {
    window.location.href = "Login.html"; // Change to your desired page
 });

 