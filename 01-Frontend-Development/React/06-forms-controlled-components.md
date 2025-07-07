# Forms and Controlled Components

Forms are essential for user interaction in web applications. React provides powerful patterns for handling form data, validation, and user input through controlled components. This guide covers form handling, validation strategies, and best practices.

## Controlled vs Uncontrolled Components

### Controlled Components

In controlled components, form data is handled by React state. The React component controls the input value.

```jsx
function ControlledInput() {
    const [value, setValue] = useState('');
    
    const handleChange = (e) => {
        setValue(e.target.value);
    };
    
    return (
        <input
            type="text"
            value={value} // React controls the value
            onChange={handleChange}
            placeholder="Controlled input"
        />
    );
}
```

### Uncontrolled Components

Uncontrolled components store their own state internally and use refs to access values.

```jsx
function UncontrolledInput() {
    const inputRef = useRef(null);
    
    const handleSubmit = () => {
        console.log(inputRef.current.value); // Access value via ref
    };
    
    return (
        <div>
            <input
                ref={inputRef}
                type="text"
                defaultValue="Initial value" // Use defaultValue, not value
                placeholder="Uncontrolled input"
            />
            <button onClick={handleSubmit}>Get Value</button>
        </div>
    );
}
```

## Basic Form Handling

### Simple Contact Form

```jsx
function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        newsletter: false
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }
        
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('Form submitted:', formData);
            alert('Message sent successfully!');
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
                newsletter: false
            });
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="contact-form">
            <h2>Contact Us</h2>
            
            <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                    disabled={isSubmitting}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    disabled={isSubmitting}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    className={errors.subject ? 'error' : ''}
                    disabled={isSubmitting}
                />
                {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>
            
            <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? 'error' : ''}
                    disabled={isSubmitting}
                    rows="5"
                />
                {errors.message && <span className="error-message">{errors.message}</span>}
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
                    Subscribe to newsletter
                </label>
            </div>
            
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="submit-button"
            >
                {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
        </form>
    );
}
```

## Advanced Form Patterns

### Multi-Step Form

```jsx
function MultiStepForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Personal Info
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        
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
        newsletter: false
    });
    
    const [errors, setErrors] = useState({});
    const totalSteps = 3;
    
    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
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
                if (!formData.email.trim()) newErrors.email = 'Email is required';
                else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
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
            console.log('Form submitted:', formData);
            alert('Registration completed successfully!');
        }
    };
    
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <PersonalInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />;
            case 2:
                return <AddressStep formData={formData} updateFormData={updateFormData} errors={errors} />;
            case 3:
                return <PreferencesStep formData={formData} updateFormData={updateFormData} errors={errors} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="multi-step-form">
            <div className="progress-bar">
                {Array.from({ length: totalSteps }, (_, index) => (
                    <div
                        key={index}
                        className={`step ${index + 1 <= currentStep ? 'active' : ''}`}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>
            
            <div className="form-content">
                {renderStep()}
            </div>
            
            <div className="form-navigation">
                {currentStep > 1 && (
                    <button onClick={prevStep} className="prev-button">
                        Previous
                    </button>
                )}
                
                {currentStep < totalSteps ? (
                    <button onClick={nextStep} className="next-button">
                        Next
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

// Step components
function PersonalInfoStep({ formData, updateFormData, errors }) {
    return (
        <div className="step-content">
            <h2>Personal Information</h2>
            
            <div className="form-row">
                <div className="form-group">
                    <label>First Name *</label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        className={errors.firstName ? 'error' : ''}
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
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
            </div>
            
            <div className="form-group">
                <label>Email *</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
                <label>Phone</label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                />
            </div>
        </div>
    );
}
```

### Dynamic Form Fields

```jsx
function DynamicForm() {
    const [fields, setFields] = useState([
        { id: 1, name: '', email: '', role: 'user' }
    ]);
    
    const addField = () => {
        const newField = {
            id: Date.now(),
            name: '',
            email: '',
            role: 'user'
        };
        setFields(prev => [...prev, newField]);
    };
    
    const removeField = (id) => {
        setFields(prev => prev.filter(field => field.id !== id));
    };
    
    const updateField = (id, property, value) => {
        setFields(prev => prev.map(field =>
            field.id === id ? { ...field, [property]: value } : field
        ));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Dynamic form data:', fields);
    };
    
    return (
        <form onSubmit={handleSubmit} className="dynamic-form">
            <h2>Team Members</h2>
            
            {fields.map((field, index) => (
                <div key={field.id} className="dynamic-field">
                    <h3>Member {index + 1}</h3>
                    
                    <div className="field-row">
                        <input
                            type="text"
                            placeholder="Name"
                            value={field.name}
                            onChange={(e) => updateField(field.id, 'name', e.target.value)}
                        />
                        
                        <input
                            type="email"
                            placeholder="Email"
                            value={field.email}
                            onChange={(e) => updateField(field.id, 'email', e.target.value)}
                        />
                        
                        <select
                            value={field.role}
                            onChange={(e) => updateField(field.id, 'role', e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                        </select>
                        
                        {fields.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeField(field.id)}
                                className="remove-button"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            ))}
            
            <button type="button" onClick={addField} className="add-button">
                Add Member
            </button>
            
            <button type="submit" className="submit-button">
                Save Team
            </button>
        </form>
    );
}
```

## Form Validation Patterns

### Real-time Validation

```jsx
function RealTimeValidationForm() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    
    const [validation, setValidation] = useState({
        username: { isValid: false, message: '' },
        password: { isValid: false, message: '' },
        confirmPassword: { isValid: false, message: '' }
    });
    
    const validateUsername = (username) => {
        if (!username) {
            return { isValid: false, message: 'Username is required' };
        }
        if (username.length < 3) {
            return { isValid: false, message: 'Username must be at least 3 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
        }
        return { isValid: true, message: 'Username is available' };
    };
    
    const validatePassword = (password) => {
        if (!password) {
            return { isValid: false, message: 'Password is required' };
        }
        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters' };
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return { isValid: false, message: 'Password must contain uppercase, lowercase, and number' };
        }
        return { isValid: true, message: 'Password is strong' };
    };
    
    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) {
            return { isValid: false, message: 'Please confirm your password' };
        }
        if (confirmPassword !== password) {
            return { isValid: false, message: 'Passwords do not match' };
        }
        return { isValid: true, message: 'Passwords match' };
    };
    
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Real-time validation
        let validationResult;
        switch (field) {
            case 'username':
                validationResult = validateUsername(value);
                break;
            case 'password':
                validationResult = validatePassword(value);
                // Also revalidate confirm password if it exists
                if (formData.confirmPassword) {
                    const confirmValidation = validateConfirmPassword(formData.confirmPassword, value);
                    setValidation(prev => ({
                        ...prev,
                        confirmPassword: confirmValidation
                    }));
                }
                break;
            case 'confirmPassword':
                validationResult = validateConfirmPassword(value, formData.password);
                break;
        }
        
        setValidation(prev => ({
            ...prev,
            [field]: validationResult
        }));
    };
    
    const isFormValid = Object.values(validation).every(field => field.isValid);
    
    return (
        <form className="real-time-validation-form">
            <h2>Create Account</h2>
            
            <div className="form-group">
                <label>Username</label>
                <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className={validation.username.isValid ? 'valid' : 'invalid'}
                />
                <div className={`validation-message ${validation.username.isValid ? 'success' : 'error'}`}>
                    {validation.username.message}
                </div>
            </div>
            
            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={validation.password.isValid ? 'valid' : 'invalid'}
                />
                <div className={`validation-message ${validation.password.isValid ? 'success' : 'error'}`}>
                    {validation.password.message}
                </div>
            </div>
            
            <div className="form-group">
                <label>Confirm Password</label>
                <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={validation.confirmPassword.isValid ? 'valid' : 'invalid'}
                />
                <div className={`validation-message ${validation.confirmPassword.isValid ? 'success' : 'error'}`}>
                    {validation.confirmPassword.message}
                </div>
            </div>
            
            <button type="submit" disabled={!isFormValid}>
                Create Account
            </button>
        </form>
    );
}
```

## Custom Form Hooks

### useForm Hook

```jsx
function useForm(initialValues, validationSchema) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const setValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);
    
    const setFieldTouched = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);
    
    const validate = useCallback(() => {
        const newErrors = {};
        
        Object.keys(validationSchema).forEach(field => {
            const rules = validationSchema[field];
            const value = values[field];
            
            for (const rule of rules) {
                const error = rule(value, values);
                if (error) {
                    newErrors[field] = error;
                    break;
                }
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, validationSchema]);
    
    const handleSubmit = useCallback((onSubmit) => {
        return async (e) => {
            if (e) e.preventDefault();
            
            setIsSubmitting(true);
            
            // Mark all fields as touched
            const allTouched = Object.keys(values).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setTouched(allTouched);
            
            if (validate()) {
                try {
                    await onSubmit(values);
                } catch (error) {
                    console.error('Form submission error:', error);
                }
            }
            
            setIsSubmitting(false);
        };
    }, [values, validate]);
    
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);
    
    return {
        values,
        errors,
        touched,
        isSubmitting,
        setValue,
        setFieldTouched,
        validate,
        handleSubmit,
        reset,
        isValid: Object.keys(errors).length === 0
    };
}

// Validation rules
const required = (message = 'This field is required') => (value) => {
    return !value || (typeof value === 'string' && !value.trim()) ? message : null;
};

const minLength = (min, message) => (value) => {
    return value && value.length < min ? message || `Must be at least ${min} characters` : null;
};

const email = (message = 'Invalid email address') => (value) => {
    return value && !/\S+@\S+\.\S+/.test(value) ? message : null;
};

// Usage example
function LoginForm() {
    const { values, errors, touched, isSubmitting, setValue, setFieldTouched, handleSubmit } = useForm(
        { email: '', password: '' },
        {
            email: [required(), email()],
            password: [required(), minLength(6)]
        }
    );
    
    const onSubmit = async (formData) => {
        console.log('Login attempt:', formData);
        // Handle login logic
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
                <input
                    type="email"
                    placeholder="Email"
                    value={values.email}
                    onChange={(e) => setValue('email', e.target.value)}
                    onBlur={() => setFieldTouched('email')}
                />
                {touched.email && errors.email && (
                    <span className="error">{errors.email}</span>
                )}
            </div>
            
            <div className="form-group">
                <input
                    type="password"
                    placeholder="Password"
                    value={values.password}
                    onChange={(e) => setValue('password', e.target.value)}
                    onBlur={() => setFieldTouched('password')}
                />
                {touched.password && errors.password && (
                    <span className="error">{errors.password}</span>
                )}
            </div>
            
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}
```

## Best Practices

1. **Use controlled components** for form inputs in React
2. **Validate on both client and server** side
3. **Provide real-time feedback** for better user experience
4. **Use proper HTML form elements** and attributes
5. **Handle loading and error states** appropriately
6. **Make forms accessible** with proper labels and ARIA attributes
7. **Debounce expensive validations** like API calls
8. **Use custom hooks** to encapsulate form logic
9. **Handle edge cases** like network failures
10. **Test form behavior** thoroughly

Understanding forms and controlled components is essential for building interactive React applications that handle user input effectively and provide a great user experience.
