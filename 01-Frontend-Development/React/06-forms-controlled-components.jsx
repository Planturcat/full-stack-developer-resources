// Forms and Controlled Components - Practical Examples

import React, { useState, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// 1. BASIC CONTROLLED COMPONENTS
// ============================================================================

// Simple controlled input
function ControlledInput() {
    const [value, setValue] = useState('');
    const [history, setHistory] = useState([]);
    
    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        
        // Track input history
        setHistory(prev => [...prev.slice(-4), newValue].filter(Boolean));
    };
    
    const clearInput = () => {
        setValue('');
        setHistory([]);
    };
    
    return (
        <div className="controlled-input-demo">
            <h3>Controlled Input Demo</h3>
            <div className="input-group">
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder="Type something..."
                />
                <button onClick={clearInput}>Clear</button>
            </div>
            
            <div className="input-info">
                <p>Current value: "{value}"</p>
                <p>Character count: {value.length}</p>
                <p>Word count: {value.trim() ? value.trim().split(/\s+/).length : 0}</p>
            </div>
            
            {history.length > 0 && (
                <div className="input-history">
                    <h4>Recent inputs:</h4>
                    <ul>
                        {history.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Uncontrolled component example
function UncontrolledInput() {
    const inputRef = useRef(null);
    const [submittedValue, setSubmittedValue] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const value = inputRef.current.value;
        setSubmittedValue(value);
        inputRef.current.value = ''; // Manual reset
    };
    
    const focusInput = () => {
        inputRef.current.focus();
    };
    
    return (
        <div className="uncontrolled-input-demo">
            <h3>Uncontrolled Input Demo</h3>
            <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    defaultValue="Initial value"
                    placeholder="Uncontrolled input"
                />
                <button type="submit">Submit</button>
                <button type="button" onClick={focusInput}>Focus Input</button>
            </form>
            
            {submittedValue && (
                <p>Last submitted: "{submittedValue}"</p>
            )}
        </div>
    );
}

// ============================================================================
// 2. COMPREHENSIVE CONTACT FORM
// ============================================================================

function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        priority: 'medium',
        newsletter: false,
        contactMethod: 'email'
    });
    
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        
        // Validate field on blur
        validateField(name, formData[name]);
    };
    
    const validateField = (name, value) => {
        let error = '';
        
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    error = 'Name is required';
                } else if (value.trim().length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;
                
            case 'email':
                if (!value.trim()) {
                    error = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
                
            case 'phone':
                if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
                    error = 'Please enter a valid phone number';
                }
                break;
                
            case 'subject':
                if (!value.trim()) {
                    error = 'Subject is required';
                }
                break;
                
            case 'message':
                if (!value.trim()) {
                    error = 'Message is required';
                } else if (value.trim().length < 10) {
                    error = 'Message must be at least 10 characters';
                } else if (value.trim().length > 1000) {
                    error = 'Message must be less than 1000 characters';
                }
                break;
        }
        
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
        
        return !error;
    };
    
    const validateForm = () => {
        const fieldsToValidate = ['name', 'email', 'subject', 'message'];
        let isValid = true;
        
        fieldsToValidate.forEach(field => {
            const fieldValid = validateField(field, formData[field]);
            if (!fieldValid) isValid = false;
        });
        
        // Mark all fields as touched
        const allTouched = fieldsToValidate.reduce((acc, field) => {
            acc[field] = true;
            return acc;
        }, {});
        setTouched(allTouched);
        
        return isValid;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setSubmitStatus({ type: 'error', message: 'Please fix the errors above' });
            return;
        }
        
        setIsSubmitting(true);
        setSubmitStatus(null);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate random failure
            if (Math.random() < 0.2) {
                throw new Error('Server error occurred');
            }
            
            console.log('Form submitted:', formData);
            setSubmitStatus({ 
                type: 'success', 
                message: 'Thank you! Your message has been sent successfully.' 
            });
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
                priority: 'medium',
                newsletter: false,
                contactMethod: 'email'
            });
            setErrors({});
            setTouched({});
            
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus({ 
                type: 'error', 
                message: 'Failed to send message. Please try again.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getFieldClassName = (fieldName) => {
        let className = 'form-input';
        if (touched[fieldName] && errors[fieldName]) {
            className += ' error';
        } else if (touched[fieldName] && !errors[fieldName] && formData[fieldName]) {
            className += ' valid';
        }
        return className;
    };
    
    return (
        <div className="contact-form-container">
            <form onSubmit={handleSubmit} className="contact-form">
                <h2>Contact Us</h2>
                
                {submitStatus && (
                    <div className={`status-message ${submitStatus.type}`}>
                        {submitStatus.message}
                    </div>
                )}
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getFieldClassName('name')}
                            disabled={isSubmitting}
                            placeholder="Enter your full name"
                        />
                        {touched.name && errors.name && (
                            <span className="error-message">{errors.name}</span>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getFieldClassName('email')}
                            disabled={isSubmitting}
                            placeholder="Enter your email"
                        />
                        {touched.email && errors.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getFieldClassName('phone')}
                            disabled={isSubmitting}
                            placeholder="Enter your phone number"
                        />
                        {touched.phone && errors.phone && (
                            <span className="error-message">{errors.phone}</span>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="form-input"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getFieldClassName('subject')}
                        disabled={isSubmitting}
                        placeholder="What is this regarding?"
                    />
                    {touched.subject && errors.subject && (
                        <span className="error-message">{errors.subject}</span>
                    )}
                </div>
                
                <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getFieldClassName('message')}
                        disabled={isSubmitting}
                        placeholder="Please describe your inquiry..."
                        rows="5"
                    />
                    <div className="character-count">
                        {formData.message.length}/1000 characters
                    </div>
                    {touched.message && errors.message && (
                        <span className="error-message">{errors.message}</span>
                    )}
                </div>
                
                <div className="form-group">
                    <label>Preferred Contact Method</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="contactMethod"
                                value="email"
                                checked={formData.contactMethod === 'email'}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            Email
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="contactMethod"
                                value="phone"
                                checked={formData.contactMethod === 'phone'}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            Phone
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="contactMethod"
                                value="either"
                                checked={formData.contactMethod === 'either'}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            Either
                        </label>
                    </div>
                </div>
                
                <div className="form-group">
                    <label className="checkbox-label">
                        <input
                            name="newsletter"
                            type="checkbox"
                            checked={formData.newsletter}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                        Subscribe to our newsletter for updates and tips
                    </label>
                </div>
                
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="submit-button"
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner">⟳</span>
                            Sending...
                        </>
                    ) : (
                        'Send Message'
                    )}
                </button>
            </form>
        </div>
    );
}

// ============================================================================
// 3. MULTI-STEP FORM
// ============================================================================

function MultiStepForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Personal Info
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        
        // Step 2: Address
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
        
        // Step 3: Preferences
        interests: [],
        notifications: {
            email: true,
            sms: false,
            push: true
        },
        newsletter: false,
        language: 'en'
    });
    
    const [errors, setErrors] = useState({});
    const totalSteps = 3;
    
    const updateFormData = (field, value) => {
        if (field.includes('.')) {
            // Handle nested objects like notifications.email
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
        
        // Clear error when user updates field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };
    
    const validateStep = (step) => {
        const newErrors = {};
        
        switch (step) {
            case 1:
                if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
                if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
                if (!formData.email.trim()) {
                    newErrors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    newErrors.email = 'Email is invalid';
                }
                if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
                break;
                
            case 2:
                if (!formData.street.trim()) newErrors.street = 'Street address is required';
                if (!formData.city.trim()) newErrors.city = 'City is required';
                if (!formData.state.trim()) newErrors.state = 'State is required';
                if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
                break;
                
            case 3:
                if (formData.interests.length === 0) {
                    newErrors.interests = 'Please select at least one interest';
                }
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };
    
    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };
    
    const handleSubmit = async () => {
        if (validateStep(currentStep)) {
            console.log('Multi-step form submitted:', formData);
            alert('Registration completed successfully!');
        }
    };
    
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <PersonalInfoStep 
                        formData={formData} 
                        updateFormData={updateFormData} 
                        errors={errors} 
                    />
                );
            case 2:
                return (
                    <AddressStep 
                        formData={formData} 
                        updateFormData={updateFormData} 
                        errors={errors} 
                    />
                );
            case 3:
                return (
                    <PreferencesStep 
                        formData={formData} 
                        updateFormData={updateFormData} 
                        errors={errors} 
                    />
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="multi-step-form">
            <div className="progress-bar">
                <div className="progress-steps">
                    {Array.from({ length: totalSteps }, (_, index) => (
                        <div
                            key={index}
                            className={`step ${index + 1 <= currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}`}
                        >
                            <span className="step-number">{index + 1}</span>
                            <span className="step-label">
                                {index === 0 ? 'Personal' : index === 1 ? 'Address' : 'Preferences'}
                            </span>
                        </div>
                    ))}
                </div>
                <div 
                    className="progress-fill" 
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
            </div>
            
            <div className="form-content">
                {renderStep()}
            </div>
            
            <div className="form-navigation">
                {currentStep > 1 && (
                    <button onClick={prevStep} className="prev-button">
                        ← Previous
                    </button>
                )}
                
                <div className="step-indicator">
                    Step {currentStep} of {totalSteps}
                </div>
                
                {currentStep < totalSteps ? (
                    <button onClick={nextStep} className="next-button">
                        Next →
                    </button>
                ) : (
                    <button onClick={handleSubmit} className="submit-button">
                        Complete Registration
                    </button>
                )}
            </div>
        </div>
    );
}

// Step components for multi-step form
function PersonalInfoStep({ formData, updateFormData, errors }) {
    return (
        <div className="step-content">
            <h2>Personal Information</h2>
            <p>Please provide your basic information</p>
            
            <div className="form-row">
                <div className="form-group">
                    <label>First Name *</label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        className={errors.firstName ? 'error' : ''}
                        placeholder="Enter first name"
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                
                <div className="form-group">
                    <label>Last Name *</label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        className={errors.lastName ? 'error' : ''}
                        placeholder="Enter last name"
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
            </div>
            
            <div className="form-group">
                <label>Email Address *</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter email address"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        placeholder="Enter phone number"
                    />
                </div>
                
                <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                        className={errors.dateOfBirth ? 'error' : ''}
                    />
                    {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                </div>
            </div>
        </div>
    );
}

function AddressStep({ formData, updateFormData, errors }) {
    return (
        <div className="step-content">
            <h2>Address Information</h2>
            <p>Where can we reach you?</p>
            
            <div className="form-group">
                <label>Street Address *</label>
                <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => updateFormData('street', e.target.value)}
                    className={errors.street ? 'error' : ''}
                    placeholder="Enter street address"
                />
                {errors.street && <span className="error-message">{errors.street}</span>}
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>City *</label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        className={errors.city ? 'error' : ''}
                        placeholder="Enter city"
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                
                <div className="form-group">
                    <label>State *</label>
                    <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => updateFormData('state', e.target.value)}
                        className={errors.state ? 'error' : ''}
                        placeholder="Enter state"
                    />
                    {errors.state && <span className="error-message">{errors.state}</span>}
                </div>
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>ZIP Code *</label>
                    <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => updateFormData('zipCode', e.target.value)}
                        className={errors.zipCode ? 'error' : ''}
                        placeholder="Enter ZIP code"
                    />
                    {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>
                
                <div className="form-group">
                    <label>Country</label>
                    <select
                        value={formData.country}
                        onChange={(e) => updateFormData('country', e.target.value)}
                    >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

function PreferencesStep({ formData, updateFormData, errors }) {
    const interestOptions = [
        'Technology', 'Sports', 'Music', 'Travel', 'Food', 'Art', 'Science', 'Gaming'
    ];
    
    const handleInterestChange = (interest) => {
        const currentInterests = formData.interests;
        const newInterests = currentInterests.includes(interest)
            ? currentInterests.filter(i => i !== interest)
            : [...currentInterests, interest];
        
        updateFormData('interests', newInterests);
    };
    
    return (
        <div className="step-content">
            <h2>Preferences</h2>
            <p>Help us personalize your experience</p>
            
            <div className="form-group">
                <label>Interests * (Select at least one)</label>
                <div className="checkbox-grid">
                    {interestOptions.map(interest => (
                        <label key={interest} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.interests.includes(interest)}
                                onChange={() => handleInterestChange(interest)}
                            />
                            {interest}
                        </label>
                    ))}
                </div>
                {errors.interests && <span className="error-message">{errors.interests}</span>}
            </div>
            
            <div className="form-group">
                <label>Notification Preferences</label>
                <div className="notification-options">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.notifications.email}
                            onChange={(e) => updateFormData('notifications.email', e.target.checked)}
                        />
                        Email notifications
                    </label>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.notifications.sms}
                            onChange={(e) => updateFormData('notifications.sms', e.target.checked)}
                        />
                        SMS notifications
                    </label>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.notifications.push}
                            onChange={(e) => updateFormData('notifications.push', e.target.checked)}
                        />
                        Push notifications
                    </label>
                </div>
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Preferred Language</label>
                    <select
                        value={formData.language}
                        onChange={(e) => updateFormData('language', e.target.value)}
                    >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.newsletter}
                            onChange={(e) => updateFormData('newsletter', e.target.checked)}
                        />
                        Subscribe to newsletter
                    </label>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// 4. MAIN DEMO COMPONENT
// ============================================================================

function FormsDemo() {
    const [activeDemo, setActiveDemo] = useState('controlled');
    
    const demos = {
        controlled: { component: ControlledInput, title: 'Controlled Components' },
        uncontrolled: { component: UncontrolledInput, title: 'Uncontrolled Components' },
        contact: { component: ContactForm, title: 'Contact Form' },
        multistep: { component: MultiStepForm, title: 'Multi-Step Form' }
    };
    
    const ActiveComponent = demos[activeDemo].component;
    
    return (
        <div className="forms-demo">
            <h1>Forms and Controlled Components Demo</h1>
            
            <div className="demo-navigation">
                {Object.entries(demos).map(([key, demo]) => (
                    <button
                        key={key}
                        onClick={() => setActiveDemo(key)}
                        className={activeDemo === key ? 'active' : ''}
                    >
                        {demo.title}
                    </button>
                ))}
            </div>
            
            <div className="demo-content">
                <h2>{demos[activeDemo].title}</h2>
                <ActiveComponent />
            </div>
        </div>
    );
}

export default FormsDemo;
