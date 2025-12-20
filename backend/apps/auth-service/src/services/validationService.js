/**
 * Validation Service - Bank Grade Input Validation
 * Handles all input validation including password policies
 */

class ValidationService {
  
	/**
	 * Validate strong password policy (bank grade)
	 * @param {String} password - Password to validate
	 * @returns {Object} - { isValid: Boolean, errors: Array }
	 */
	static validatePassword(password) {
		const errors = [];
    
		if (!password || typeof password !== 'string') {
			errors.push('Password is required');
			return { isValid: false, errors };
		}
    
		// Minimum 8 characters
		if (password.length < 8) {
			errors.push('Password must be at least 8 characters long');
		}
    
		// Maximum 128 characters
		if (password.length > 128) {
			errors.push('Password cannot exceed 128 characters');
		}
    
		// Must contain at least one uppercase letter
		if (!/[A-Z]/.test(password)) {
			errors.push('Password must contain at least one uppercase letter');
		}
    
		// Must contain at least one lowercase letter
		if (!/[a-z]/.test(password)) {
			errors.push('Password must contain at least one lowercase letter');
		}
    
		// Must contain at least one number
		if (!/\d/.test(password)) {
			errors.push('Password must contain at least one number');
		}
    
		// Must contain at least one special character
		if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)) {
			errors.push('Password must contain at least one special character');
		}
    
		// No common weak passwords
		const commonPasswords = [
			'password', 'password123', '123456', '123456789', 'qwerty', 
			'abc123', 'password1', 'admin', 'welcome', '12345678'
		];
    
		if (commonPasswords.includes(password.toLowerCase())) {
			errors.push('Password is too common. Please choose a stronger password');
		}
    
		return {
			isValid: errors.length === 0,
			errors
		};
	}
  
	/**
	 * Validate email format
	 * @param {String} email - Email to validate
	 * @returns {Object} - { isValid: Boolean, errors: Array }
	 */
	static validateEmail(email) {
		const errors = [];
    
		if (!email || typeof email !== 'string') {
			errors.push('Email is required');
			return { isValid: false, errors };
		}
    
		// Basic email regex
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
		if (!emailRegex.test(email.trim().toLowerCase())) {
			errors.push('Please provide a valid email address');
		}
    
		// Check email length
		if (email.length > 254) {
			errors.push('Email address is too long');
		}
    
		return {
			isValid: errors.length === 0,
			errors
		};
	}
  
	/**
	 * Validate Indian mobile number
	 * @param {String} mobile - Mobile number to validate
	 * @returns {Object} - { isValid: Boolean, errors: Array }
	 */
	static validateMobileNumber(mobile) {
		const errors = [];
    
		if (!mobile || typeof mobile !== 'string') {
			errors.push('Mobile number is required');
			return { isValid: false, errors };
		}
    
		// Remove all non-digits
		const cleanMobile = mobile.replace(/\D/g, '');
    
		// Indian mobile number: 10 digits starting with 6-9
		const mobileRegex = /^[6-9]\d{9}$/;
    
		if (!mobileRegex.test(cleanMobile)) {
			errors.push('Mobile number must be 10 digits starting with 6-9');
		}
    
		return {
			isValid: errors.length === 0,
			errors,
			cleanMobile
		};
	}
  
	/**
	 * Validate full name
	 * @param {String} fullName - Full name to validate
	 * @returns {Object} - { isValid: Boolean, errors: Array }
	 */
	static validateFullName(fullName) {
		const errors = [];
    
		if (!fullName || typeof fullName !== 'string') {
			errors.push('Full name is required');
			return { isValid: false, errors };
		}
    
		const trimmedName = fullName.trim();
    
		if (trimmedName.length < 2) {
			errors.push('Full name must be at least 2 characters');
		}
    
		if (trimmedName.length > 100) {
			errors.push('Full name cannot exceed 100 characters');
		}
    
		// Only letters, spaces, and dots allowed
		const nameRegex = /^[a-zA-Z\s.]+$/;
		if (!nameRegex.test(trimmedName)) {
			errors.push('Full name can only contain letters, spaces and dots');
		}
    
		return {
			isValid: errors.length === 0,
			errors
		};
	}
  
	/**
	 * Validate date of birth (age requirements)
	 * @param {String|Date} dob - Date of birth
	 * @returns {Object} - { isValid: Boolean, errors: Array, age: Number }
	 */
	static validateDateOfBirth(dob) {
		const errors = [];
		let age = null;
    
		if (!dob) {
			errors.push('Date of birth is required');
			return { isValid: false, errors, age };
		}
    
		const birthDate = new Date(dob);
		const today = new Date();
    
		// Check if date is valid
		if (isNaN(birthDate.getTime())) {
			errors.push('Invalid date of birth format');
			return { isValid: false, errors, age };
		}
    
		// Check if date is not in future
		if (birthDate > today) {
			errors.push('Date of birth cannot be in the future');
			return { isValid: false, errors, age };
		}
    
		// Calculate age
		age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
    
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
    
		// Banking age requirements
		if (age < 18) {
			errors.push('You must be at least 18 years old to register');
		}
    
		if (age > 100) {
			errors.push('Invalid date of birth');
		}
    
		return {
			isValid: errors.length === 0,
			errors,
			age
		};
	}
  
	/**
	 * Validate address fields
	 * @param {Object} address - Address object
	 * @returns {Object} - { isValid: Boolean, errors: Array }
	 */
	static validateAddress(address) {
		const errors = [];

		if (!address || typeof address !== 'object') {
			errors.push('Address is required');
			return { isValid: false, errors };
		}

		// Accept common key variants (postal_code / pincode)
		const street = address.street || address.street_address || address.streetAddress || '';
		const city = address.city || address.town || '';
		const state = address.state || address.region || '';
		const postal_code = address.postal_code || address.pincode || address.postal || '';
		const country = address.country || '';

	
		if (!city || String(city).trim().length < 2) {
			errors.push('City is required');
		}

		if (!state || String(state).trim().length < 2) {
			errors.push('State is required');
		}

		// Postal code: common formats 5-6 digits (India 6)
		const pc = String(postal_code).trim();
		if (!pc || !/^\d{5,6}$/.test(pc)) {
			errors.push('Postal code must be 5 or 6 digits');
		}

		if (!country || String(country).trim().length < 2) {
			errors.push('Country is required');
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}
  
	/**
	 * Validate complete registration data
	 * @param {Object} data - Registration data
	 * @returns {Object} - { isValid: Boolean, errors: Array }
	 */
	static validateRegistrationData(data) {
		const allErrors = [];
    
		// Validate each field
		const nameValidation = this.validateFullName(data.full_name);
		const emailValidation = this.validateEmail(data.email);
		const mobileValidation = this.validateMobileNumber(data.mobile_number);
		const passwordValidation = this.validatePassword(data.password);
		const dobValidation = this.validateDateOfBirth(data.date_of_birth);
		const addressValidation = this.validateAddress(data.address);
    
		// Collect all errors
		allErrors.push(...(nameValidation.errors || []));
		allErrors.push(...(emailValidation.errors || []));
		allErrors.push(...(mobileValidation.errors || []));
		allErrors.push(...(passwordValidation.errors || []));
		allErrors.push(...(dobValidation.errors || []));
		allErrors.push(...(addressValidation.errors || []));
    
		return {
			isValid: allErrors.length === 0,
			errors: allErrors,
			cleanMobile: mobileValidation.cleanMobile,
			age: dobValidation.age
		};
	}
  
	/**
	 * Validate login credentials
	 * @param {Object} data - Login data
	 * @returns {Object} - { isValid: Boolean, errors: Array }
	 */
	static validateLoginData(data) {
		const errors = [];
    
		if (!data.identifier || typeof data.identifier !== 'string') {
			errors.push('Email or mobile number is required');
		}
    
		if (!data.password || typeof data.password !== 'string') {
			errors.push('Password is required');
		}
    
		return {
			isValid: errors.length === 0,
			errors
		};
	}
}

module.exports = ValidationService;

