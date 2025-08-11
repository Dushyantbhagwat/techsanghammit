/*=============== SHOW HIDDEN - PASSWORD ===============*/
const showHiddenPass = (loginPass, loginEye) =>{
   const input = document.getElementById(loginPass),
         iconEye = document.getElementById(loginEye)

   iconEye.addEventListener('click', () =>{
      // Change password to text
      if(input.type === 'password'){
         // Switch to text
         input.type = 'text'

         // Icon change
         iconEye.classList.add('ri-eye-line')
         iconEye.classList.remove('ri-eye-off-line')
      } else{
         // Change to password
         input.type = 'password'

         // Icon change
         iconEye.classList.remove('ri-eye-line')
         iconEye.classList.add('ri-eye-off-line')
      }
   })
}

showHiddenPass('login-pass','login-eye')

document.addEventListener("DOMContentLoaded", () => {
    const tagline = document.querySelector(".login__tagline");

    setTimeout(() => {
        tagline.style.animation = "fadeInZoom 1.5s ease-in-out forwards";
    }, 500); // Slight delay for smooth appearance
});

document.addEventListener("DOMContentLoaded", () => {
   // Password Toggle
   const showHiddenPass = (inputId, iconId) => {
       const input = document.getElementById(inputId);
       const iconEye = document.getElementById(iconId);

       iconEye.addEventListener("click", () => {
           if (input.type === "password") {
               input.type = "text";
               iconEye.classList.replace("ri-eye-off-line", "ri-eye-line");
           } else {
               input.type = "password";
               iconEye.classList.replace("ri-eye-line", "ri-eye-off-line");
           }
       });
   };

   showHiddenPass("login-pass", "login-eye");

   // Form Validation
   document.querySelector(".login__form").addEventListener("submit", (e) => {
       const email = document.getElementById("login-email").value.trim();
       const password = document.getElementById("login-pass").value.trim();

       if (!email || !password) {
           alert("Please fill in all fields.");
           e.preventDefault();
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
});


document.addEventListener("DOMContentLoaded", () => {
   const carousel = document.querySelector(".carousel-wrapper");

   // Duplicate boxes to create an infinite loop
   const boxes = [...carousel.children];
   boxes.forEach(box => {
       const clone = box.cloneNode(true);
       carousel.appendChild(clone);
   });
});

document.addEventListener("DOMContentLoaded", () => {
    const tagline = document.querySelector(".login__tagline");

    setInterval(() => {
        tagline.classList.toggle("glow-effect"); // Toggles glowing effect
    }, 2000);
});

document.getElementById("register-btn").addEventListener("click", () => {
   window.location.href = "register.html"; // Change to your desired page
});

document.getElementById("login-btn").addEventListener("click", () => {
   window.location.href = "ogin.html"; // Change to your desired page
});

