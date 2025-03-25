"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Flame, Loader2, AlertCircle, CheckCircle2, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { validatePassword } from "@/lib/auth/password";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Check username availability with debouncing
  const checkUsername = async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      // Call the real API endpoint
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`);

      if (!response.ok) {
        throw new Error('Failed to check username availability');
      }

      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Check email validity and availability
  const checkEmail = async (value: string) => {
    if (!value) {
      setEmailValid(null);
      setEmailAvailable(null);
      return;
    }

    // First validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    setEmailValid(isValid);

    if (!isValid) {
      setEmailAvailable(null);
      return;
    }

    setCheckingEmail(true);
    try {
      // Call the API to check if email is available
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(value)}`);

      if (!response.ok) {
        throw new Error('Failed to check email availability');
      }

      const data = await response.json();
      setEmailAvailable(data.available);
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Check if password meets requirements
  const checkPassword = (value: string) => {
    if (!value) {
      setPasswordValid(null);
      setPasswordError(null);
      return;
    }

    const validation = validatePassword(value);
    setPasswordValid(validation.isValid);
    setPasswordError(validation.error || null);

    // Also check if passwords match whenever either password changes
    if (confirmPassword) {
      setPasswordsMatch(value === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  };

  // Check if passwords match
  const checkPasswordsMatch = (value: string) => {
    if (!value || !password) {
      setPasswordsMatch(null);
      return;
    }

    setPasswordsMatch(value === password);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    // Debounce the username check to avoid too many requests
    const timeoutId = setTimeout(() => {
      checkUsername(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Debounce the email check
    const timeoutId = setTimeout(() => {
      checkEmail(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    checkPassword(value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    checkPasswordsMatch(value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !username || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (usernameAvailable === false) {
      toast.error("This username is already taken");
      return;
    }

    if (emailValid === false) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emailAvailable === false) {
      toast.error("This email is already registered");
      return;
    }

    if (passwordValid === false) {
      toast.error(passwordError || "Password does not meet requirements");
      return;
    }

    if (passwordsMatch === false) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          username,
          password
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || "Registration failed");
      }

      toast.success("Account created successfully!");

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Sign in error:", result.error);
        toast.error("Account created but sign-in failed. Please sign in manually.");
        router.push("/login");
      } else {
        toast.success("Signed in successfully");

        // Wait a moment to ensure the session is updated
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Flame className="h-10 w-10 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Register to track your F1 Fantasy bets and compete with friends
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="racefan123"
                  value={username}
                  onChange={handleUsernameChange}
                  required
                  className={`${
                    usernameAvailable === true ? 'border-green-500 pr-10' :
                    usernameAvailable === false ? 'border-red-500 pr-10' : ''
                  }`}
                  minLength={3}
                />
                {checkingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {usernameAvailable === true && !checkingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                )}
                {usernameAvailable === false && !checkingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                This will be displayed on leaderboards (min. 3 characters)
              </p>
              {usernameAvailable === false && (
                <p className="text-xs text-red-500">
                  This username is already taken
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className={`${
                    (emailValid === true && emailAvailable === true) ? 'border-green-500 pr-10' :
                    (emailValid === false || emailAvailable === false) ? 'border-red-500 pr-10' : ''
                  }`}
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {emailValid === true && emailAvailable === true && !checkingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                )}
                {(emailValid === false || emailAvailable === false) && !checkingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {emailValid === false && (
                <p className="text-xs text-red-500">
                  Please enter a valid email address
                </p>
              )}
              {emailValid === true && emailAvailable === false && (
                <p className="text-xs text-red-500">
                  This email is already registered. <Link href="/login" className="underline">Sign in instead?</Link>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className={`${
                    passwordValid === true ? 'border-green-500 pr-10' :
                    passwordValid === false ? 'border-red-500 pr-10' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number
              </p>
              {passwordValid === false && passwordError && (
                <p className="text-xs text-red-500">{passwordError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  className={`${
                    passwordsMatch === true ? 'border-green-500 pr-10' :
                    passwordsMatch === false ? 'border-red-500 pr-10' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              {passwordsMatch === false && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading ||
                usernameAvailable === false ||
                emailValid === false ||
                emailAvailable === false ||
                passwordValid === false ||
                passwordsMatch === false
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
