import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, LucideIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Google Icon Component
interface GoogleIconProps {
  className?: string;
}

const GoogleIcon = ({ className }: GoogleIconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

// Form Header Component
interface FormHeaderProps {
  title: string;
  subtitle: string;
}

const FormHeader = ({ title, subtitle }: FormHeaderProps) => (
  <div className="text-center space-y-2">
    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
      {title}
    </h1>
    <p className="text-gray-600">
      {subtitle}
    </p>
  </div>
);

// Input Field Component
interface InputFieldProps {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  required?: boolean;
  className?: string;
}

const InputField = ({
  id,
  type,
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = false,
  className = ""
}: InputFieldProps) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="text-sm font-medium text-gray-900"
    >
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full h-11 pl-10 pr-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 ${className}`}
        required={required}
      />
    </div>
  </div>
);

// Password Field Component
interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  required?: boolean;
  className?: string;
}

const PasswordField = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  required = false,
  className = ""
}: PasswordFieldProps) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="text-sm font-medium text-gray-900"
    >
      {label}
    </label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full h-11 pl-10 pr-10 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 ${className}`}
        required={required}
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors duration-300"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

// Checkbox Component
interface CheckboxProps {
  id: string;
  label: React.ReactNode;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = ({ id, label, checked, onChange }: CheckboxProps) => (
  <label htmlFor={id} className="flex items-start space-x-2 cursor-pointer">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-white"
    />
    <span className="text-gray-600 select-none text-sm">{label}</span>
  </label>
);

// Link Component
interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Link = ({ href, children, className = "", onClick }: LinkProps) => (
  <a
    href={href}
    onClick={onClick}
    className={`text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-300 ${className}`}
  >
    {children}
  </a>
);

// Button Component
interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

const Button = ({
  type = "button",
  variant = "primary",
  onClick,
  children,
  className = "",
  fullWidth = false,
  disabled = false
}: ButtonProps) => {
  const baseStyles = "h-11 rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};

// Divider Component
interface DividerProps {
  text: string;
}

const Divider = ({ text }: DividerProps) => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-200"></div>
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-white px-2 text-gray-500">
        {text}
      </span>
    </div>
  </div>
);

// Social Button Component
interface SocialButtonProps {
  provider: "google";
  onClick: () => void;
  children: React.ReactNode;
}

const SocialButton = ({ onClick, children }: SocialButtonProps) => (
  <Button variant="outline" onClick={onClick} fullWidth>
    <GoogleIcon className="h-5 w-5" />
    {children}
  </Button>
);

// Animated Blob Component
interface AnimatedBlobProps {
  color: string;
  position: string;
  delay?: string;
}

const AnimatedBlob = ({ color, position, delay = "" }: AnimatedBlobProps) => (
  <div className={`absolute ${position} w-72 h-72 ${color} rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob ${delay}`} />
);

// Gradient Wave Component
const GradientWave = () => (
  <div className="absolute inset-0 opacity-20">
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 560">
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path fill="url(#gradient1)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,560L1392,560C1344,560,1248,560,1152,560C1056,560,960,560,864,560C768,560,672,560,576,560C480,560,384,560,288,560C192,560,96,560,48,560L0,560Z" />
    </svg>
  </div>
);

// Progress Dots Component
interface ProgressDotsProps {
  count?: number;
  activeIndex?: number;
  color?: string;
}

const ProgressDots = ({ count = 3, activeIndex = 0, color = "white" }: ProgressDotsProps) => (
  <div className="flex justify-center gap-2 pt-4">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={`w-2 h-2 rounded-full ${
          index <= activeIndex
            ? `bg-${color}`
            : `bg-${color} opacity-40`
        }`}
        style={{
          opacity: index <= activeIndex ? (100 - (activeIndex - index) * 20) / 100 : 0.4
        }}
      />
    ))}
  </div>
);

// Icon Badge Component
interface IconBadgeProps {
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

const IconBadge = ({ icon, size = "md", variant = "light" }: IconBadgeProps) => {
  const sizes = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4"
  };

  const variants = {
    light: "bg-white/10 backdrop-blur-sm text-white",
    dark: "bg-black/10 backdrop-blur-sm text-gray-900"
  };

  return (
    <div className={`inline-flex rounded-full ${sizes[size]} ${variants[variant]} mb-4`}>
      {icon}
    </div>
  );
};

// Hero Section Component
interface HeroSectionProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  showProgress?: boolean;
  progressIndex?: number;
}

const HeroSection = ({ title, description, icon, showProgress = true, progressIndex = 0 }: HeroSectionProps) => (
  <div className="text-center space-y-6 max-w-md">
    {icon && (
      <IconBadge icon={icon} size="md" variant="light" />
    )}
    <h2 className="text-3xl lg:text-4xl font-bold text-white">
      {title}
    </h2>
    <p className="text-lg text-white/80">
      {description}
    </p>
    {showProgress && <ProgressDots count={3} activeIndex={progressIndex} color="white" />}
  </div>
);

// Gradient Background Component
interface GradientBackgroundProps {
  children: React.ReactNode;
}

const GradientBackground = ({ children }: GradientBackgroundProps) => (
  <div className="hidden lg:flex flex-1 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-900" />

    <div className="absolute inset-0">
      <AnimatedBlob color="bg-emerald-500/30" position="top-0 -left-4" />
      <AnimatedBlob color="bg-green-500/30" position="top-0 -right-4" delay="animation-delay-2000" />
      <AnimatedBlob color="bg-teal-500/30" position="-bottom-8 left-20" delay="animation-delay-4000" />
    </div>

    <GradientWave />

    <div className="relative z-10 flex items-center justify-center p-8 lg:p-12 w-full">
      {children}
    </div>
  </div>
);

// Form Footer Component
interface FormFooterProps {
  text: string;
  linkText: string;
  linkHref: string;
  onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const FormFooter = ({ text, linkText, linkHref, onLinkClick }: FormFooterProps) => (
  <p className="mt-6 text-center text-sm text-gray-600">
    {text}{" "}
    <Link href={linkHref} onClick={onLinkClick}>
      {linkText}
    </Link>
  </p>
);

// ============================================================================
// MAIN SIGNUP COMPONENT
// ============================================================================

interface SignUpProps {
  onSwitchToSignIn?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, { fullName });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Account created successfully! Please check your email to verify your account.");
        // Clear form
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgreeToTerms(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("Failed to sign up with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full">
      {/* Left Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <FormHeader
            title="Create your account"
            subtitle="Get started with your free account"
          />

          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                  {success}
                </div>
              )}

              <InputField
                id="fullName"
                type="text"
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={User}
                required
              />

              <InputField
                id="email"
                type="email"
                label="Email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              <PasswordField
                id="password"
                label="Password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                required
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                required
              />

              <Checkbox
                id="terms"
                label={
                  <>
                    I agree to the{" "}
                    <Link href="#" onClick={(e) => e.preventDefault()}>Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</Link>
                  </>
                }
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />

              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <Divider text="Or continue with" />

              <SocialButton provider="google" onClick={handleGoogleSignUp}>
                Continue with Google
              </SocialButton>
            </form>

            <FormFooter
              text="Already have an account?"
              linkText="Sign in"
              linkHref="#"
              onLinkClick={(e) => {
                e.preventDefault();
                onSwitchToSignIn?.();
              }}
            />
          </Card>
        </div>
      </div>

      {/* Right Side - Hero Section with Gradient Background */}
      <GradientBackground>
        <HeroSection
          title="Join Our Community"
          description="Start your journey today with our platform. Access powerful features and connect with thousands of users worldwide."
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          showProgress
          progressIndex={0}
        />
      </GradientBackground>
    </div>
  );
};

export default SignUp;
