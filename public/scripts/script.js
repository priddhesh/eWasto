document.getElementById("showUserForm").addEventListener("click", function() {
    document.getElementById("userForm").style.display = "block";
    document.getElementById("efacilityForm").style.display = "none";
});

document.getElementById("showEfacilityForm").addEventListener("click", function() {
    document.getElementById("userForm").style.display = "none";
    document.getElementById("efacilityForm").style.display = "block";
});

function isValidEmail(email) {
    // Use a regular expression for basic email validation
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
}

// Function to validate phone number
function isValidPhone(phone) {
    // Use a regular expression for basic phone number validation
    var phonePattern = /^\+?\d{1,4}[-.\s]?\d{1,12}$/;
    return phonePattern.test(phone);
}

// Function to validate password
function isValidPassword(password) {
    // Use a regular expression for password validation
    var passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/;
    return passwordPattern.test(password);
}

function registerCheck() {
    var email = document.getElementById("email").val;
    var phone = document.getElementById("phone").val;
    var password = document.getElementById("password").val;
    var confirmPassword = document.getElementById("confirmPassword").val;

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Validate phone number
    if (!isValidPhone(phone)) {
        alert('Please enter a valid phone number.');
        return;
    }

    // Validate password
    if (!isValidPassword(password)) {
        alert('Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    
}

function fetchLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
      }
}

function showPosition(position) {
    document.getElementById("x").value =  position.coords.latitude;
    document.getElementById("y").value =  position.coords.longitude;
  }

