//===========================
// API-Integrated Frontend Script
// Replaces LocalStorage with Django REST API
// ===========================

// ===========================
// Navigation & Mobile Menu
// ===========================
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Set role from URL parameter on login page
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const loginRole = document.getElementById('loginRole');
    if (loginRole && role) {
        loginRole.value = role;
    }

    // Set registration type from URL parameter
    const regType = urlParams.get('type');
    if (regType && (regType === 'recruiter' || regType === 'freelancer')) {
        switchRole(regType);
    }

    // Check authentication status
    updateNavigation();
});

// ===========================
// Update Navigation Based on Auth
// ===========================
function updateNavigation() {
    if (api.isAuthenticated()) {
        const user = api.getUser();
        // You can update navigation to show user info or logout button
        console.log('Logged in as:', user);
    }
}

// ===========================
// Registration Role Switching
// ===========================
function switchRole(role) {
    const recruiterTab = document.getElementById('recruiterTab');
    const freelancerTab = document.getElementById('freelancerTab');
    const recruiterForm = document.getElementById('recruiterForm');
    const freelancerForm = document.getElementById('freelancerForm');

    if (role === 'recruiter') {
        recruiterTab.classList.add('active');
        freelancerTab.classList.remove('active');
        recruiterForm.style.display = 'flex';
        freelancerForm.style.display = 'none';
    } else {
        freelancerTab.classList.add('active');
        recruiterTab.classList.remove('active');
        freelancerForm.style.display = 'flex';
        recruiterForm.style.display = 'none';
    }
}

// ===========================
// Form Validation Utilities
// ===========================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10,}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function showFormMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.className = 'form-message';
        }, 5000);
    }
}

// ===========================
// Login Form Handler (API Integration)
// ===========================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        hideError('emailError');
        hideError('passwordError');
        hideError('roleError');

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const role = document.getElementById('loginRole').value;

        let isValid = true;

        // Validate email
        if (!email) {
            showError('emailError', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showError('passwordError', 'Password is required');
            isValid = false;
        }

        // Validate role
        if (!role) {
            showError('roleError', 'Please select your role');
            isValid = false;
        }

        if (isValid) {
            try {
                // Call API login
                const data = await api.login(email, password);

                // Check if user role matches selected role
                if (data.user.role !== role) {
                    showFormMessage('loginMessage', `This account is registered as a ${data.user.role}, not a ${role}.`, 'error');
                    await api.logout();
                    return;
                }

                showFormMessage('loginMessage', 'Login successful! Redirecting...', 'success');

                // Track login event
                await api.trackEvent('login', { role: data.user.role });

                setTimeout(() => {
                    if (role === 'freelancer') {
                        window.location.href = 'freelancer-profile.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            } catch (error) {
                showFormMessage('loginMessage', error.message || 'Invalid credentials. Please try again.', 'error');
            }
        }
    });
}

// ===========================
// Recruiter Registration Handler (API Integration)
// ===========================
const recruiterForm = document.getElementById('recruiterForm');
if (recruiterForm) {
    recruiterForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        hideError('recruiterNameError');
        hideError('recruiterEmailError');
        hideError('recruiterPasswordError');
        hideError('recruiterCompanyError');
        hideError('recruiterPhoneError');

        const fullName = document.getElementById('recruiterName').value.trim();
        const email = document.getElementById('recruiterEmail').value.trim();
        const password = document.getElementById('recruiterPassword').value;
        const companyName = document.getElementById('recruiterCompany').value.trim();
        const phone = document.getElementById('recruiterPhone').value.trim();

        let isValid = true;

        // Validate full name
        if (!fullName || fullName.length < 2) {
            showError('recruiterNameError', 'Please enter your full name');
            isValid = false;
        }

        // Validate email
        if (!email) {
            showError('recruiterEmailError', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('recruiterEmailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showError('recruiterPasswordError', 'Password is required');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError('recruiterPasswordError', 'Password must be at least 8 characters');
            isValid = false;
        }

        // Validate company name
        if (!companyName) {
            showError('recruiterCompanyError', 'Company name is required');
            isValid = false;
        }

        // Validate phone
        if (!phone) {
            showError('recruiterPhoneError', 'Phone number is required');
            isValid = false;
        } else if (!validatePhone(phone)) {
            showError('recruiterPhoneError', 'Please enter a valid phone number (min 10 digits)');
            isValid = false;
        }

        if (isValid) {
            try {
                // Call API register
                const userData = {
                    email,
                    password,
                    password_confirm: password,
                    full_name: fullName,
                    phone_number: phone,
                    role: 'recruiter'
                };

                const data = await api.register(userData);

                showFormMessage('recruiterMessage',
                    'Registration successful! Please check your email to verify your account.',
                    'success');

                // Reset form
                recruiterForm.reset();

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html?role=recruiter';
                }, 3000);
            } catch (error) {
                showFormMessage('recruiterMessage', error.message || 'Registration failed. Please try again.', 'error');
            }
        }
    });
}

// ===========================
// Freelancer Registration Handler (API Integration)
// ===========================
const freelancerForm = document.getElementById('freelancerForm');
if (freelancerForm) {
    freelancerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        hideError('freelancerNameError');
        hideError('freelancerEmailError');
        hideError('freelancerPasswordError');
        hideError('freelancerPhoneError');
        hideError('freelancerSkillsError');

        const fullName = document.getElementById('freelancerName').value.trim();
        const email = document.getElementById('freelancerEmail').value.trim();
        const password = document.getElementById('freelancerPassword').value;
        const phone = document.getElementById('freelancerPhone').value.trim();
        const skills = document.getElementById('freelancerSkills').value.trim();

        let isValid = true;

        // Validate full name
        if (!fullName || fullName.length < 2) {
            showError('freelancerNameError', 'Please enter your full name');
            isValid = false;
        }

        // Validate email
        if (!email) {
            showError('freelancerEmailError', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('freelancerEmailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showError('freelancerPasswordError', 'Password is required');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError('freelancerPasswordError', 'Password must be at least 8 characters');
            isValid = false;
        }

        // Validate phone
        if (!phone) {
            showError('freelancerPhoneError', 'Phone number is required');
            isValid = false;
        } else if (!validatePhone(phone)) {
            showError('freelancerPhoneError', 'Please enter a valid phone number (min 10 digits)');
            isValid = false;
        }

        // Validate skills
        if (!skills) {
            showError('freelancerSkillsError', 'Please enter your skills');
            isValid = false;
        }

        if (isValid) {
            try {
                // Call API register
                const userData = {
                    email,
                    password,
                    password_confirm: password,
                    full_name: fullName,
                    phone_number: phone,
                    role: 'freelancer'
                };

                const data = await api.register(userData);

                showFormMessage('freelancerMessage',
                    'Registration successful! Please check your email to verify your account.',
                    'success');

                // Reset form
                freelancerForm.reset();

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html?role=freelancer';
                }, 3000);
            } catch (error) {
                showFormMessage('freelancerMessage', error.message || 'Registration failed. Please try again.', 'error');
            }
        }
    });
}

// ===========================
// Profile Form Handler (API Integration)
// ===========================
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    // Check authentication
    if (!api.isAuthenticated()) {
        window.location.href = 'login.html?role=freelancer';
    } else {
        // Load existing profile data if available
        loadProfileData();
    }

    // Handle profile picture preview
    const profilePicture = document.getElementById('profilePicture');
    if (profilePicture) {
        profilePicture.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const imagePreview = document.getElementById('imagePreview');
                    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Profile Picture">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    profileForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        hideError('profileNameError');
        hideError('profileEducationError');
        hideError('profileExperienceError');
        hideError('profileSkillsError');
        hideError('profileTechStackError');
        hideError('profilePortfolioError');
        hideError('profileAboutError');

        const fullName = document.getElementById('profileName').value.trim();
        const education = document.getElementById('profileEducation').value.trim();
        const experience = parseInt(document.getElementById('profileExperience').value);
        const skills = document.getElementById('profileSkills').value.trim();
        const techStack = document.getElementById('profileTechStack').value.trim();
        const certifications = document.getElementById('profileCertifications').value.trim();
        const portfolio = document.getElementById('profilePortfolio').value.trim();
        const about = document.getElementById('profileAbout').value.trim();

        let isValid = true;

        // Validate full name
        if (!fullName || fullName.length < 2) {
            showError('profileNameError', 'Please enter your full name');
            isValid = false;
        }

        // Validate education
        if (!education) {
            showError('profileEducationError', 'Education is required');
            isValid = false;
        }

        // Validate experience
        if (isNaN(experience) || experience < 0) {
            showError('profileExperienceError', 'Please enter valid years of experience');
            isValid = false;
        }

        // Validate skills
        if (!skills) {
            showError('profileSkillsError', 'Technical skills are required');
            isValid = false;
        }

        // Validate tech stack
        if (!techStack) {
            showError('profileTechStackError', 'Tech stack is required');
            isValid = false;
        }

        // Validate portfolio URL if provided
        if (portfolio && !validateURL(portfolio)) {
            showError('profilePortfolioError', 'Please enter a valid URL');
            isValid = false;
        }

        // Validate about
        if (!about || about.length < 20) {
            showError('profileAboutError', 'Please provide a description (min 20 characters)');
            isValid = false;
        }

        if (isValid) {
            try {
                // Create profile object
                const profileData = {
                    education,
                    experience_years: experience,
                    skills: skills.split(',').map(s => s.trim()),
                    tech_stack: techStack.split(',').map(t => t.trim()),
                    certifications,
                    portfolio_url: portfolio,
                    about_me: about,
                    availability_status: 'available'
                };

                // Create or update profile
                const response = await api.createFreelancerProfile(profileData);

                // Upload profile picture if provided
                const profilePictureInput = document.getElementById('profilePicture');
                if (profilePictureInput.files.length > 0) {
                    await api.uploadProfilePicture(response.id, profilePictureInput.files[0]);
                }

                showFormMessage('profileMessage', 'Profile saved successfully!', 'success');

                // Show preview
                previewProfile();

                // Track event
                await api.trackEvent('profile_update', { profile_id: response.id });
            } catch (error) {
                showFormMessage('profileMessage', error.message || 'Failed to save profile. Please try again.', 'error');
            }
        }
    });
}

// ===========================
// Load Profile Data (API Integration)
// ===========================
async function loadProfileData() {
    try {
        const user = api.getUser();
        if (user && user.role === 'freelancer') {
            // Try to get current user's profile
            const currentUser = await api.getCurrentUser();

            // If profile exists, load it
            // Note: You'll need to implement getFreelancerProfile by user ID
            // For now, we'll just show empty form
            console.log('User data loaded:', currentUser);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// ===========================
// Preview Profile
// ===========================
function previewProfile() {
    const fullName = document.getElementById('profileName').value.trim();
    const education = document.getElementById('profileEducation').value.trim();
    const experience = document.getElementById('profileExperience').value;
    const skills = document.getElementById('profileSkills').value.trim();
    const techStack = document.getElementById('profileTechStack').value.trim();
    const certifications = document.getElementById('profileCertifications').value.trim();
    const portfolio = document.getElementById('profilePortfolio').value.trim();
    const about = document.getElementById('profileAbout').value.trim();

    // Update preview
    document.getElementById('previewName').textContent = fullName || 'Your Name';
    document.getElementById('previewEducation').textContent = education || 'Education';
    document.getElementById('previewExperience').textContent = experience ? `${experience} years` : '0 years';
    document.getElementById('previewAbout').textContent = about || 'No description provided';

    // Update skills
    const skillsContainer = document.getElementById('previewSkills');
    if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        skillsContainer.innerHTML = skillsArray.map(skill =>
            `<span class="skill-tag">${skill}</span>`
        ).join('');
    } else {
        skillsContainer.innerHTML = '<p>No skills added</p>';
    }

    // Update tech stack
    const techStackContainer = document.getElementById('previewTechStack');
    if (techStack) {
        const techArray = techStack.split(',').map(t => t.trim());
        techStackContainer.innerHTML = techArray.map(tech =>
            `<span class="skill-tag">${tech}</span>`
        ).join('');
    } else {
        techStackContainer.innerHTML = '<p>No tech stack added</p>';
    }

    // Update certifications
    document.getElementById('previewCertifications').textContent = certifications || 'None';

    // Update portfolio
    const portfolioElement = document.getElementById('previewPortfolio');
    if (portfolio) {
        portfolioElement.innerHTML = `<a href="${portfolio}" target="_blank" style="color: var(--primary-color);">${portfolio}</a>`;
    } else {
        portfolioElement.textContent = 'Not provided';
    }

    // Update profile picture
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const img = imagePreview.querySelector('img');

    if (img) {
        previewImage.innerHTML = `<img src="${img.src}" alt="Profile Picture">`;
    } else {
        previewImage.innerHTML = '<span class="preview-avatar">👤</span>';
    }

    // Show preview
    document.getElementById('profilePreview').style.display = 'block';

    // Scroll to preview
    document.getElementById('profilePreview').scrollIntoView({ behavior: 'smooth' });
}

// ===========================
// Clear Profile Form
// ===========================
function clearProfile() {
    if (confirm('Are you sure you want to clear the form? This will not delete your saved profile.')) {
        document.getElementById('profileForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('profilePreview').style.display = 'none';
    }
}

// ===========================
// Logout Function
// ===========================
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        await api.logout();
        window.location.href = 'index.html';
    }
}
